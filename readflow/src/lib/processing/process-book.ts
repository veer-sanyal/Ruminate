import { createAdminClient } from "@/lib/supabase/admin";
import { parseEpub } from "./epub-parser";
import { parsePdf } from "./pdf-parser";
import {
  isQualityText,
  countWords,
  estimateListenMins,
  estimateRsvpMins,
} from "./extract";

/**
 * Process a book: download file, extract chapters, update DB.
 * Called directly (not via HTTP) to avoid Vercel deployment protection issues.
 */
export async function processBook(bookId: string) {
  const supabase = createAdminClient();

  try {
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError || !book) {
      throw new Error("Book not found");
    }

    await supabase
      .from("books")
      .update({ processing_status: "extracting" })
      .eq("id", bookId);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("book-files")
      .download(book.source_file_url);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const fileBuffer = await fileData.arrayBuffer();

    const result =
      book.source_format === "epub"
        ? await parseEpub(fileBuffer)
        : await parsePdf(fileBuffer);

    if (result.chapters.length === 0) {
      throw new Error("No chapters could be extracted from the file");
    }

    let totalWords = 0;
    const chapterInserts = [];

    for (const chapter of result.chapters) {
      if (!isQualityText(chapter.text)) {
        console.warn(`Low quality text in chapter: ${chapter.title}`);
      }

      const wordCount = countWords(chapter.text);
      totalWords += wordCount;

      chapterInserts.push({
        book_id: bookId,
        title: chapter.title,
        sort_order: chapter.sortOrder,
        word_count: wordCount,
        raw_text: chapter.text,
        reading_status: "unread" as const,
      });
    }

    const { error: chapterError } = await supabase
      .from("chapters")
      .insert(chapterInserts);

    if (chapterError) {
      throw new Error(`Failed to create chapters: ${chapterError.message}`);
    }

    const updateData: Record<string, unknown> = {
      processing_status: "ready",
      total_words: totalWords,
      estimated_listen_mins: estimateListenMins(totalWords),
      estimated_rsvp_mins: estimateRsvpMins(totalWords),
    };

    if (result.metadata?.title) {
      updateData.title = result.metadata.title;
    }
    if (result.metadata?.author) {
      updateData.author = result.metadata.author;
    }

    await supabase.from("books").update(updateData).eq("id", bookId);

    return { success: true, chapters: result.chapters.length };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed";

    await supabase
      .from("books")
      .update({
        processing_status: "error",
        processing_error: message,
      })
      .eq("id", bookId);

    throw error;
  }
}
