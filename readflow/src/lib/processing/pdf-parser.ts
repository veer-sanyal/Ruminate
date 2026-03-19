import type { ExtractionResult, ExtractedChapter } from "./extract";
import { detectDividerPattern } from "./divider-detect";
import { labelSections } from "./section-labeler";
import { ai, MODEL_FLASH } from "@/lib/gemini";

/**
 * Parse PDF file from a buffer.
 * Uses unpdf which works in serverless environments (no DOMMatrix/canvas needed).
 *
 * Strategy:
 * 1. Extract full text with unpdf
 * 2. Try divider-based splitting first (deterministic, reliable)
 * 3. Fall back to LLM structure detection if no dividers found
 */
export async function parsePdf(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    const { extractText, getMeta } = await import("unpdf");

    const { text: rawText } = await extractText(
      new Uint8Array(fileBuffer)
    );

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

    // Strategy 1: Divider-based splitting
    const divider = detectDividerPattern(fullText);
    let chapters: ExtractedChapter[];

    if (divider) {
      console.log(`[PDF Parser] Found divider pattern: ${divider.name} (${divider.count} occurrences)`);
      chapters = await splitByDividers(fullText, divider.pattern);
    } else {
      console.log("[PDF Parser] No divider pattern found, using LLM fallback");
      chapters = await splitByLlmFallback(fullText);
    }

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
 * Split text using detected divider patterns, then label sections via LLM.
 */
async function splitByDividers(
  fullText: string,
  pattern: RegExp
): Promise<ExtractedChapter[]> {
  const rawSections = fullText.split(pattern).filter(s => s.trim().length > 50);

  console.log(`[PDF Parser] Divider split produced ${rawSections.length} raw sections`);

  // Label sections via LLM
  const labeled = await labelSections(
    rawSections.map((text, index) => ({ index, text }))
  );

  const chapters: ExtractedChapter[] = [];
  let sortOrder = 0;

  for (const label of labeled) {
    if (!label.include) continue;
    if (label.index >= rawSections.length) continue;

    const sectionText = rawSections[label.index]!.trim();
    if (sectionText.length < 100) continue;

    chapters.push({
      title: label.title,
      text: sectionText,
      sortOrder: sortOrder++,
    });
  }

  // If labeling produced nothing useful, just use all sections with generic titles
  if (chapters.length === 0) {
    return rawSections
      .filter(s => s.trim().length > 100)
      .map((text, i) => ({
        title: `Section ${i + 1}`,
        text: text.trim(),
        sortOrder: i,
      }));
  }

  console.log(`[PDF Parser] Final chapters from dividers:`, chapters.map(c => `${c.title} (${c.text.length} chars)`));
  return chapters;
}

/**
 * LLM fallback: ask for exact first lines of each chapter, then find them by exact string search.
 */
async function splitByLlmFallback(fullText: string): Promise<ExtractedChapter[]> {
  const sampleText = fullText.substring(0, 30000);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Analyze this book text and identify chapter/section boundaries.

For each section, return the EXACT text of the first line/heading as it appears in the body text
(not as it appears in a table of contents). Copy it character-for-character.

Return a JSON array of objects:
[{"first_line": "exact first line text", "suggested_title": "Clean Title"}]

If you cannot find clear sections, return [{"first_line": "NONE", "suggested_title": "Full Text"}].

Return ONLY the JSON array.

Text:
${sampleText}`,
    });

    const text = response.text?.trim() ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallbackEqualSplit(fullText);

    const sections: { first_line: string; suggested_title: string }[] = JSON.parse(jsonMatch[0]);

    if (sections.length <= 1 && sections[0]?.first_line === "NONE") {
      return fallbackEqualSplit(fullText);
    }

    // Find positions by exact string search
    const allPositions = sections
      .map(s => ({ ...s, pos: fullText.indexOf(s.first_line) }))
      .filter(s => s.pos >= 0);

    // Skip past TOC region: find the largest gap between consecutive matches
    let searchFrom = 0;
    if (allPositions.length >= 3) {
      let maxGap = 0, gapIdx = 0;
      for (let i = 1; i < allPositions.length; i++) {
        const gap = allPositions[i]!.pos - allPositions[i - 1]!.pos;
        if (gap > maxGap) { maxGap = gap; gapIdx = i; }
      }
      const avgBefore = gapIdx > 0 ? allPositions[gapIdx - 1]!.pos / gapIdx : 0;
      if (maxGap > avgBefore * 5 && gapIdx > 0) {
        searchFrom = allPositions[gapIdx]!.pos;
      }
    }

    const found: { title: string; startIdx: number }[] = [];
    let cursor = searchFrom;

    for (const section of sections) {
      const pos = fullText.indexOf(section.first_line, cursor);
      if (pos >= 0) {
        found.push({ title: section.suggested_title, startIdx: pos });
        cursor = pos + section.first_line.length;
      }
    }

    if (found.length === 0) return fallbackEqualSplit(fullText);

    // Split text between found positions
    return found.map((f, i) => ({
      title: f.title,
      text: fullText.substring(f.startIdx, found[i + 1]?.startIdx ?? fullText.length).trim(),
      sortOrder: i,
    }));
  } catch (error) {
    console.error("[PDF Parser] LLM fallback error:", error);
    return fallbackEqualSplit(fullText);
  }
}

/**
 * Final fallback: split text into roughly equal chunks.
 */
function fallbackEqualSplit(fullText: string): ExtractedChapter[] {
  const CHUNK_SIZE = 15000;
  const chunks: ExtractedChapter[] = [];
  let pos = 0, idx = 0;

  while (pos < fullText.length) {
    let end = Math.min(pos + CHUNK_SIZE, fullText.length);
    // Find paragraph break near the end
    if (end < fullText.length) {
      const paraBreak = fullText.lastIndexOf("\n\n", end);
      if (paraBreak > pos + CHUNK_SIZE * 0.5) end = paraBreak;
    }
    const text = fullText.substring(pos, end).trim();
    if (text.length > 0) {
      chunks.push({
        title: `Part ${idx + 1}`,
        text,
        sortOrder: idx++,
      });
    }
    pos = end;
  }

  if (chunks.length === 0) {
    chunks.push({ title: "Full Text", text: fullText.trim(), sortOrder: 0 });
  }

  return chunks;
}
