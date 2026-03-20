import { createAdminClient } from "@/lib/supabase/admin";
import { parseEpub } from "./epub-parser";
import { parsePdf } from "./pdf-parser";
import {
  isQualityText,
  countWords,
  estimateListenMins,
  estimateRsvpMins,
} from "./extract";
import { generateDistillation, generateEmbedding } from "@/lib/utils/ai-utils";
import { generateBookSummary } from "./book-summary";

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
      processing_status: "distilling",
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

    // Fetch the book for context (may have updated title/author)
    const { data: updatedBook } = await supabase
      .from("books")
      .select("title, author")
      .eq("id", bookId)
      .single();

    const bookContext = {
      title: updatedBook?.title ?? "Unknown",
      author: updatedBook?.author,
    };

    // Fetch inserted chapters to get their IDs
    const { data: insertedChapters } = await supabase
      .from("chapters")
      .select("id, raw_text, sort_order")
      .eq("book_id", bookId)
      .order("sort_order");

    // Distill each chapter (sequential to avoid rate limits)
    if (insertedChapters) {
      for (const ch of insertedChapters) {
        if (!ch.raw_text) continue;
        try {
          const distillation = await generateDistillation(ch.raw_text, bookContext);
          const embeddingText = `${distillation.summary}\n${distillation.key_terms.join(", ")}`;
          let embedding: number[] | null = null;
          try {
            embedding = await generateEmbedding(embeddingText);
          } catch {
            // Continue without embedding
          }

          await supabase.from("distillations").insert({
            chapter_id: ch.id,
            summary: distillation.summary,
            key_terms: distillation.key_terms,
            claims: distillation.claims,
            application_angles: distillation.application_angles,
            identity_beliefs: distillation.identity_beliefs,
            payoff_questions: distillation.payoff_questions,
            embedding: embedding ? `[${embedding.join(",")}]` : null,
          });
        } catch (err) {
          console.warn(`[ProcessBook] Distillation failed for chapter ${ch.id}:`, err);
        }
      }

      // Generate book-level summary from distillations
      try {
        await generateBookSummary(bookId);
      } catch (err) {
        console.warn("[ProcessBook] Book summary generation failed:", err);
      }
    }

    // Mark as ready
    await supabase
      .from("books")
      .update({ processing_status: "ready" })
      .eq("id", bookId);

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
