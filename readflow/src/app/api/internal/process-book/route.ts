import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseEpub } from "@/lib/processing/epub-parser";
import { parsePdf } from "@/lib/processing/pdf-parser";
import { isQualityText, countWords, estimateListenMins, estimateRsvpMins } from "@/lib/processing/extract";

export async function POST(request: Request) {
  const { book_id } = await request.json();

  if (!book_id) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // Fetch book record
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", book_id)
      .single();

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Update status to extracting
    await supabase
      .from("books")
      .update({ processing_status: "extracting" })
      .eq("id", book_id);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("book-files")
      .download(book.source_file_url);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const fileBuffer = await fileData.arrayBuffer();

    // Extract text based on format
    const result =
      book.source_format === "epub"
        ? await parseEpub(fileBuffer)
        : await parsePdf(fileBuffer);

    if (result.chapters.length === 0) {
      throw new Error("No chapters could be extracted from the file");
    }

    // Quality check and create chapter records
    let totalWords = 0;
    const chapterInserts = [];

    for (const chapter of result.chapters) {
      if (!isQualityText(chapter.text)) {
        console.warn(`Low quality text in chapter: ${chapter.title}`);
      }

      const wordCount = countWords(chapter.text);
      totalWords += wordCount;

      chapterInserts.push({
        book_id,
        title: chapter.title,
        sort_order: chapter.sortOrder,
        word_count: wordCount,
        raw_text: chapter.text,
        reading_status: "unread" as const,
      });
    }

    // Insert chapters
    const { error: chapterError } = await supabase
      .from("chapters")
      .insert(chapterInserts);

    if (chapterError) {
      throw new Error(`Failed to create chapters: ${chapterError.message}`);
    }

    // Update book metadata
    const updateData: Record<string, unknown> = {
      processing_status: "ready",
      total_words: totalWords,
      estimated_listen_mins: estimateListenMins(totalWords),
      estimated_rsvp_mins: estimateRsvpMins(totalWords),
    };

    // Use extracted metadata if available
    if (result.metadata?.title) {
      updateData.title = result.metadata.title;
    }
    if (result.metadata?.author) {
      updateData.author = result.metadata.author;
    }

    await supabase.from("books").update(updateData).eq("id", book_id);

    return NextResponse.json({ success: true, chapters: result.chapters.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed";

    // Set error status
    await supabase
      .from("books")
      .update({
        processing_status: "error",
        processing_error: message,
      })
      .eq("id", book_id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
