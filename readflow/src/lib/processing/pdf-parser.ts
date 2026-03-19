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
  const sampleText = fullText.substring(0, 15000);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `You are analyzing the extracted text of a book/document to identify its structure. Below is the beginning of the text (first ~15000 characters). Identify all chapter/section boundaries.

Look for ANY structural divisions including but not limited to:
- Chapters (Chapter 1, Chapter One, I, II, etc.)
- Parts (Part 1, Part One, etc.)
- Named sections (Introduction, Preface, Foreword, Author's Note, Prologue, Epilogue, Conclusion, Afterword, Acknowledgments, About the Author, Appendix, etc.)
- Numbered sections without "Chapter" prefix
- Any other clear structural breaks

Return a JSON array of section titles in the order they appear. Each title should be the FULL title as it appears in the text (e.g. "Chapter 1: The Beginning" not just "Chapter 1"). If you find a table of contents, use it to identify ALL sections even if they're beyond the provided text.

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

    if (!sectionTitles.length || (sectionTitles.length === 1 && sectionTitles[0] === "Full Text")) {
      return fallbackChapterSplit(fullText);
    }

    // Now split the text at each section boundary
    const chapters: ExtractedChapter[] = [];

    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i]!;
      // Search for section title in full text (case-insensitive, flexible whitespace)
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
      const titleRegex = new RegExp(escapedTitle, "i");
      const match = fullText.match(titleRegex);

      if (!match || match.index === undefined) continue;

      const startIdx = match.index;

      // Find end: start of next section or end of text
      let endIdx = fullText.length;
      for (let j = i + 1; j < sectionTitles.length; j++) {
        const nextTitle = sectionTitles[j]!;
        const escapedNext = nextTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
        const nextRegex = new RegExp(escapedNext, "i");
        const nextMatch = fullText.match(nextRegex);
        if (nextMatch && nextMatch.index !== undefined && nextMatch.index > startIdx) {
          endIdx = nextMatch.index;
          break;
        }
      }

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
    if (chapters.length > 0) {
      const firstChapterStart = fullText.indexOf(chapters[0]!.text);
      if (firstChapterStart > 200) {
        const prefaceText = fullText.substring(0, firstChapterStart).trim();
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

    return chapters;
  } catch (error) {
    console.error("[Chapter Detection] LLM error, falling back:", error);
    return fallbackChapterSplit(fullText);
  }
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
