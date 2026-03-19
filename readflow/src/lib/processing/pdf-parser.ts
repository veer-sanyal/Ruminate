import type { ExtractionResult, ExtractedChapter } from "./extract";
import { ai, MODEL_FLASH } from "@/lib/gemini";

/**
 * Parse PDF file from a buffer.
 * Uses unpdf which works in serverless environments (no DOMMatrix/canvas needed).
 */
export async function parsePdf(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    const { extractText, getMeta } = await import("unpdf");

    const { text: rawText } = await extractText(
      new Uint8Array(fileBuffer)
    );

    // unpdf returns text as string or string[] depending on version
    const fullText = Array.isArray(rawText) ? rawText.join("\n\n") : rawText;

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    let meta: { info?: Record<string, string> } = {};
    try {
      meta = await getMeta(new Uint8Array(fileBuffer));
    } catch {
      // metadata extraction is optional
    }

    // Use LLM to detect chapter/section boundaries
    const chapters = await detectChaptersWithLlm(fullText);

    return {
      chapters,
      metadata: {
        title: meta.info?.Title || undefined,
        author: meta.info?.Author || undefined,
      },
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(
      `Failed to parse PDF file: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * Use Gemini to detect chapter/section boundaries in extracted text.
 * Handles standard chapters, intros, author's notes, appendices, etc.
 */
async function detectChaptersWithLlm(
  fullText: string
): Promise<ExtractedChapter[]> {
  // Send first portion of text to LLM for structure detection
  // We send enough to capture the table of contents or early chapter patterns
  const sampleText = fullText.substring(0, 20000);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `You are analyzing the extracted text of a book/document to identify its structure. Below is the beginning of the text (first ~20000 characters). Identify all chapter/section boundaries.

Look for ANY structural divisions including but not limited to:
- Chapters (Chapter 1, Chapter One, I, II, etc.)
- Parts (Part 1, Part One, etc.)
- Named sections (Introduction, Preface, Foreword, Author's Note, Prologue, Epilogue, Conclusion, Afterword, Acknowledgments, About the Author, Appendix, etc.)
- Numbered sections without "Chapter" prefix
- Any other clear structural breaks

IMPORTANT: If the text contains a Table of Contents (TOC), use it to learn what sections exist, but return the titles as they would appear as STANDALONE HEADINGS in the body text — not as TOC line items. TOC entries often include page numbers or extra formatting that won't match the actual chapter headings. Return clean heading titles only.

Return a JSON array of section titles in the order they appear. Each title should be the FULL title as it appears as a heading in the body text (e.g. "Chapter 1: The Beginning" not just "Chapter 1").

If you cannot identify any clear structure, return ["Full Text"].

IMPORTANT: Return ONLY the JSON array, no other text. Example:
["Author's Note", "Introduction", "Chapter 1: Getting Started", "Chapter 2: The Journey", "Conclusion", "Acknowledgments"]

Text to analyze:
${sampleText}`,
    });

    const responseText = response.text?.trim() ?? "[]";
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("[Chapter Detection] LLM did not return valid JSON, falling back");
      return fallbackChapterSplit(fullText);
    }

    const sectionTitles: string[] = JSON.parse(jsonMatch[0]);
    console.log("[Chapter Detection] LLM returned titles:", JSON.stringify(sectionTitles));

    if (!sectionTitles.length || (sectionTitles.length === 1 && sectionTitles[0] === "Full Text")) {
      return fallbackChapterSplit(fullText);
    }

    // Find section positions using fuzzy matching with TOC-skip logic
    const foundSections = findSectionsWithTocSkip(fullText, sectionTitles);
    console.log("[Chapter Detection] Found sections:", foundSections.map(s => `${s.title} @${s.startIdx}`));

    // If fuzzy matching found very few sections, try pattern-based detection
    if (foundSections.length < Math.min(3, sectionTitles.length) && sectionTitles.length >= 3) {
      console.log("[Chapter Detection] Too few matches, trying pattern-based detection");
      const patternSections = findChaptersByPattern(fullText, sectionTitles);
      if (patternSections.length > foundSections.length) {
        console.log("[Chapter Detection] Pattern-based found more:", patternSections.length);
        foundSections.length = 0;
        foundSections.push(...patternSections);
      }
    }

    // Now split text between consecutive found positions
    const chapters: ExtractedChapter[] = [];

    for (let i = 0; i < foundSections.length; i++) {
      const { title, startIdx } = foundSections[i]!;
      const endIdx = i + 1 < foundSections.length
        ? foundSections[i + 1]!.startIdx
        : fullText.length;

      const chapterText = fullText.substring(startIdx, endIdx).trim();
      if (chapterText.length > 50) {
        chapters.push({
          title,
          text: chapterText,
          sortOrder: chapters.length,
        });
      }
    }

    // If we found any content before the first detected section, include it
    if (chapters.length > 0 && foundSections.length > 0) {
      const firstSectionStart = foundSections[0]!.startIdx;
      if (firstSectionStart > 200) {
        const prefaceText = fullText.substring(0, firstSectionStart).trim();
        if (prefaceText.length > 50) {
          chapters.unshift({
            title: "Front Matter",
            text: prefaceText,
            sortOrder: 0,
          });
          // Re-index sort orders
          chapters.forEach((ch, idx) => { ch.sortOrder = idx; });
        }
      }
    }

    if (chapters.length === 0) {
      return fallbackChapterSplit(fullText);
    }

    console.log("[Chapter Detection] Final chapters:", chapters.map(c => `${c.title} (${c.text.length} chars)`));
    return chapters;
  } catch (error) {
    console.error("[Chapter Detection] LLM error, falling back:", error);
    return fallbackChapterSplit(fullText);
  }
}

/**
 * Find section positions with TOC-cluster detection.
 * Pass 1: find first occurrences. If they cluster (TOC), Pass 2: re-search after cluster.
 * Uses fuzzy matching: tries full title, then partial matches.
 */
function findSectionsWithTocSkip(
  fullText: string,
  sectionTitles: string[]
): { title: string; startIdx: number }[] {
  const pass1 = findSectionPositionsFuzzy(fullText, sectionTitles, 0);

  // Detect TOC cluster: all matches bunched in first portion, bulk of text after
  if (pass1.length >= 2) {
    const lastMatchEnd = pass1[pass1.length - 1]!.startIdx;
    const textAfterLastMatch = fullText.length - lastMatchEnd;
    if (textAfterLastMatch > fullText.length * 0.5) {
      console.log("[Chapter Detection] TOC cluster detected, re-searching body from offset", lastMatchEnd);
      const pass2 = findSectionPositionsFuzzy(fullText, sectionTitles, lastMatchEnd + 1);
      if (pass2.length >= 2) {
        return pass2;
      }
    }
  }

  return pass1;
}

/**
 * Find section title positions using fuzzy matching.
 * For each title, tries multiple matching strategies:
 * 1. Full title match
 * 2. Title prefix (before ":" or "—")
 * 3. Title suffix (after ":" or "—")
 * 4. Key words only (for long titles)
 */
function findSectionPositionsFuzzy(
  fullText: string,
  sectionTitles: string[],
  startFrom: number
): { title: string; startIdx: number }[] {
  const results: { title: string; startIdx: number }[] = [];
  let searchFrom = startFrom;

  for (const title of sectionTitles) {
    const matchIdx = fuzzyFindTitle(fullText, title, searchFrom);

    if (matchIdx === -1) {
      console.log("[Chapter Detection] No match for:", title, "from offset", searchFrom);
      continue;
    }

    searchFrom = matchIdx + title.length;
    results.push({ title, startIdx: matchIdx });
  }

  return results;
}

/**
 * Try to find a title in the text using progressively relaxed strategies.
 */
function fuzzyFindTitle(fullText: string, title: string, searchFrom: number): number {
  const searchSlice = fullText.substring(searchFrom);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");

  // Strategy 1: Full title, flexible whitespace
  const fullMatch = searchSlice.match(new RegExp(esc(title), "i"));
  if (fullMatch?.index !== undefined) {
    return searchFrom + fullMatch.index;
  }

  // Strategy 2: Strip leading number prefix ("1. Title" → "Title", "1: Title" → "Title")
  const numberPrefixMatch = title.match(/^\d+[\.\:\)\s]+\s*/);
  const titleWithoutNumber = numberPrefixMatch
    ? title.substring(numberPrefixMatch[0].length).trim()
    : null;

  if (titleWithoutNumber && titleWithoutNumber.length > 5) {
    const numlessMatch = searchSlice.match(new RegExp(esc(titleWithoutNumber), "i"));
    if (numlessMatch?.index !== undefined) {
      return searchFrom + numlessMatch.index;
    }
  }

  // Strategy 3: Split on separators (":" "—" "-") and try suffix (the unique part)
  const separators = [":", "—", " - "];
  for (const sep of separators) {
    const sepIdx = title.indexOf(sep);
    if (sepIdx <= 0) continue;
    const suffix = title.substring(sepIdx + sep.length).trim();
    if (suffix.length > 5) {
      const suffixMatch = searchSlice.match(new RegExp(esc(suffix), "i"));
      if (suffixMatch?.index !== undefined) {
        return searchFrom + suffixMatch.index;
      }
    }
  }

  return -1;
}

/**
 * Fallback: find chapters by detecting heading patterns directly in the text.
 * Looks for "Chapter N", standalone numbers, and named sections.
 */
function findChaptersByPattern(
  fullText: string,
  llmTitles: string[]
): { title: string; startIdx: number }[] {
  const results: { title: string; startIdx: number }[] = [];
  let match: RegExpExecArray | null;

  // Pattern 1: "Chapter N" (with optional subtitle)
  const chapterPattern = /\n\s*(chapter\s+(\d+|[a-z]+)(?:\s*[:\-—]\s*[^\n]*)?)\s*\n/gi;
  while ((match = chapterPattern.exec(fullText)) !== null) {
    results.push({ title: match[1]!.trim(), startIdx: match.index + 1 });
  }

  // Pattern 2: Standalone number on its own line (common in PDF extraction for chapter numbers)
  // Match a line that's just a number, possibly followed by a title on the next line
  const standaloneNumPattern = /\n\s*(\d{1,2})\s*\n\s*([^\n]{5,80})\s*\n/g;
  while ((match = standaloneNumPattern.exec(fullText)) !== null) {
    const num = match[1]!;
    const titleAfter = match[2]!.trim();
    // Skip if this looks like a page number (preceded by lots of text on same logical page)
    // or if number is > 30 (unlikely chapter count)
    if (parseInt(num) > 30) continue;
    if (!results.some(r => Math.abs(r.startIdx - match!.index) < 100)) {
      results.push({ title: `${num}. ${titleAfter}`, startIdx: match.index + 1 });
    }
  }

  // Pattern 3: Named sections (intro, conclusion, etc.)
  const namedSectionPattern = /\n\s*((?:introduction|preface|foreword|prologue|epilogue|conclusion|afterword|acknowledgments?|about the author|appendix)(?:\s*[:\-—]\s*[^\n]*)?)\s*\n/gi;
  while ((match = namedSectionPattern.exec(fullText)) !== null) {
    const startIdx = match.index + 1;
    if (!results.some(r => Math.abs(r.startIdx - startIdx) < 100)) {
      results.push({ title: match[1]!.trim(), startIdx });
    }
  }

  // Sort by position
  results.sort((a, b) => a.startIdx - b.startIdx);

  // Skip TOC cluster: find where body content starts by looking for a gap
  // In a TOC, entries are close together; in the body, chapters are far apart
  if (results.length >= 4) {
    // Find the largest gap between consecutive matches
    let maxGap = 0;
    let gapIdx = 0;
    for (let i = 1; i < results.length; i++) {
      const gap = results[i]!.startIdx - results[i - 1]!.startIdx;
      if (gap > maxGap) {
        maxGap = gap;
        gapIdx = i;
      }
    }
    // If the largest gap is significantly bigger than the average gap before it,
    // everything before the gap is likely the TOC
    if (gapIdx > 0) {
      const avgGapBefore = results[gapIdx - 1]!.startIdx / gapIdx;
      if (maxGap > avgGapBefore * 5 && gapIdx < results.length - 1) {
        console.log("[Chapter Detection] Pattern: skipping TOC entries before gap at index", gapIdx);
        results.splice(0, gapIdx);
      }
    }
  }

  // Cross-reference with LLM titles to use cleaner names
  for (const result of results) {
    const lowerResult = result.title.toLowerCase();
    for (const llmTitle of llmTitles) {
      const lowerLlm = llmTitle.toLowerCase();
      // Match by shared number or significant text overlap
      const numMatch = lowerResult.match(/^(\d+)/);
      const llmNumMatch = lowerLlm.match(/^(\d+)/);
      if (numMatch && llmNumMatch && numMatch[1] === llmNumMatch[1]) {
        result.title = llmTitle;
        break;
      }
      // Match by chapter number
      const chapterNum = lowerResult.match(/chapter\s+(\d+)/)?.[1];
      if (chapterNum && lowerLlm.includes(`chapter ${chapterNum}`)) {
        result.title = llmTitle;
        break;
      }
      // Match by title text overlap (at least 80% of words match)
      const resultWords = lowerResult.replace(/^\d+[\.\:\)]\s*/, "").split(/\s+/);
      const llmWords = lowerLlm.replace(/^\d+[\.\:\)]\s*/, "").split(/\s+/);
      if (resultWords.length >= 3) {
        const overlap = resultWords.filter(w => llmWords.includes(w)).length;
        if (overlap >= resultWords.length * 0.8) {
          result.title = llmTitle;
          break;
        }
      }
    }
  }

  return results;
}

/**
 * Fallback: split text into roughly equal sections by page breaks or size.
 */
function fallbackChapterSplit(fullText: string): ExtractedChapter[] {
  const chapters: ExtractedChapter[] = [];
  const pages = fullText.split(/\f/);

  if (pages.length > 1) {
    const pagesPerChapter = Math.max(1, Math.ceil(pages.length / 10));
    for (let i = 0; i < pages.length; i += pagesPerChapter) {
      const chapterText = pages
        .slice(i, i + pagesPerChapter)
        .join("\n\n")
        .trim();
      if (chapterText.length > 0) {
        chapters.push({
          title: `Section ${Math.floor(i / pagesPerChapter) + 1}`,
          text: chapterText,
          sortOrder: chapters.length,
        });
      }
    }
  }

  if (chapters.length === 0) {
    chapters.push({
      title: "Full Text",
      text: fullText.trim(),
      sortOrder: 0,
    });
  }

  return chapters;
}
