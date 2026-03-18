import type { ExtractionResult, ExtractedChapter } from "./extract";

/**
 * Parse PDF file from a buffer.
 * Uses pdf.js for text extraction with heading detection.
 */
export async function parsePdf(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    const numPages = pdf.numPages;

    const allText: string[] = [];
    const headingPositions: { page: number; text: string; fontSize: number }[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      let pageText = "";
      let maxFontSize = 0;

      for (const item of content.items) {
        if ("str" in item) {
          const fontSize = "transform" in item ? Math.abs(item.transform[0]) : 12;
          pageText += item.str + " ";

          // Detect potential headings (larger font size)
          if (fontSize > 14 && item.str.trim().length > 0 && item.str.trim().length < 100) {
            headingPositions.push({
              page: i,
              text: item.str.trim(),
              fontSize,
            });
          }

          if (fontSize > maxFontSize) maxFontSize = fontSize;
        }
      }

      allText.push(pageText.trim());
    }

    // Build chapters from heading positions
    const fullText = allText.join("\n\n");
    const chapters: ExtractedChapter[] = [];

    if (headingPositions.length > 1) {
      // Use detected headings to split into chapters
      const avgFontSize =
        headingPositions.reduce((s, h) => s + h.fontSize, 0) /
        headingPositions.length;
      const chapterHeadings = headingPositions.filter(
        (h) => h.fontSize >= avgFontSize * 0.9
      );

      for (let i = 0; i < chapterHeadings.length; i++) {
        const heading = chapterHeadings[i]!;
        const nextHeading = chapterHeadings[i + 1];

        const startIdx = fullText.indexOf(heading.text);
        const endIdx = nextHeading
          ? fullText.indexOf(nextHeading.text)
          : fullText.length;

        if (startIdx !== -1) {
          const chapterText = fullText.substring(startIdx, endIdx).trim();
          chapters.push({
            title: heading.text,
            text: chapterText,
            sortOrder: i,
          });
        }
      }
    }

    // Fallback: if no chapters detected, split by page groups
    if (chapters.length === 0) {
      const pagesPerChapter = Math.max(1, Math.ceil(numPages / 10));
      for (let i = 0; i < allText.length; i += pagesPerChapter) {
        const chapterText = allText.slice(i, i + pagesPerChapter).join("\n\n");
        if (chapterText.trim()) {
          chapters.push({
            title: `Section ${Math.floor(i / pagesPerChapter) + 1}`,
            text: chapterText,
            sortOrder: chapters.length,
          });
        }
      }
    }

    return { chapters, metadata: {} };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}
