import type { ExtractionResult, ExtractedChapter } from "./extract";

/**
 * Parse PDF file from a buffer.
 * Uses unpdf which works in serverless environments (no DOMMatrix/canvas needed).
 */
export async function parsePdf(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    const { extractText, getMeta } = await import("unpdf");

    const { text: fullText, totalPages } = await extractText(
      new Uint8Array(fileBuffer)
    );

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    let meta: { info?: Record<string, string> } = {};
    try {
      meta = await getMeta(new Uint8Array(fileBuffer));
    } catch {
      // metadata extraction is optional
    }

    const chapters: ExtractedChapter[] = [];

    // Try to detect chapter boundaries using common patterns
    const chapterPattern =
      /^(chapter\s+\d+|part\s+\d+|section\s+\d+|\d+\.\s+\w+)/gim;
    const matches = [...fullText.matchAll(chapterPattern)];

    if (matches.length > 1) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i]!;
        const nextMatch = matches[i + 1];
        const startIdx = match.index!;
        const endIdx = nextMatch ? nextMatch.index! : fullText.length;
        const chapterText = fullText.substring(startIdx, endIdx).trim();

        if (chapterText.length > 50) {
          chapters.push({
            title: match[0].trim(),
            text: chapterText,
            sortOrder: chapters.length,
          });
        }
      }
    }

    // Fallback: split into sections by page breaks or size
    if (chapters.length === 0) {
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
    }

    // Final fallback: single chapter with all text
    if (chapters.length === 0) {
      chapters.push({
        title: "Full Text",
        text: fullText.trim(),
        sortOrder: 0,
      });
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
