import type { ExtractionResult, ExtractedChapter } from "./extract";

/**
 * Parse EPUB file from a buffer.
 *
 * Note: Full EPUB parsing requires a library like epub.js or @nicktomlin/epub.
 * This is a simplified implementation that extracts text content from the EPUB's
 * XHTML files inside the ZIP archive. Install `jszip` for production use.
 */
export async function parseEpub(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    // EPUB files are ZIP archives containing XHTML files
    // For a production implementation, use a dedicated EPUB parsing library
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(fileBuffer);

    const chapters: ExtractedChapter[] = [];
    const xhtmlFiles: string[] = [];

    // Find XHTML content files
    zip.forEach((relativePath, file) => {
      if (
        !file.dir &&
        (relativePath.endsWith(".xhtml") ||
          relativePath.endsWith(".html") ||
          relativePath.endsWith(".htm")) &&
        !relativePath.includes("toc") &&
        !relativePath.includes("nav")
      ) {
        xhtmlFiles.push(relativePath);
      }
    });

    xhtmlFiles.sort();

    for (let i = 0; i < xhtmlFiles.length; i++) {
      const filePath = xhtmlFiles[i]!;
      const content = await zip.file(filePath)?.async("text");
      if (!content) continue;

      // Strip HTML tags to get plain text
      const text = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code)))
        .replace(/\s+/g, " ")
        .trim();

      if (text.length < 50) continue; // Skip near-empty files

      // Try to extract chapter title from <title> or <h1>
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i) ??
        content.match(/<h1[^>]*>([^<]+)<\/h1>/i) ??
        content.match(/<h2[^>]*>([^<]+)<\/h2>/i);

      const title = titleMatch?.[1]?.trim() ?? `Chapter ${i + 1}`;

      chapters.push({
        title,
        text,
        sortOrder: i,
      });
    }

    // Try to extract metadata from OPF file
    let metadata: ExtractionResult["metadata"] = {};
    const opfFile = Object.keys(zip.files).find((f) => f.endsWith(".opf"));
    if (opfFile) {
      const opfContent = await zip.file(opfFile)?.async("text");
      if (opfContent) {
        const titleMatch = opfContent.match(
          /<dc:title[^>]*>([^<]+)<\/dc:title>/i
        );
        const authorMatch = opfContent.match(
          /<dc:creator[^>]*>([^<]+)<\/dc:creator>/i
        );
        metadata = {
          title: titleMatch?.[1]?.trim(),
          author: authorMatch?.[1]?.trim(),
        };
      }
    }

    return { chapters, metadata };
  } catch (error) {
    console.error("EPUB parsing error:", error);
    throw new Error("Failed to parse EPUB file");
  }
}
