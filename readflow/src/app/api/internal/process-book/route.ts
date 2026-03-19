import { NextResponse } from "next/server";
import { processBook } from "@/lib/processing/process-book";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { book_id } = await request.json();

  if (!book_id) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  try {
    const adminSupabase = createAdminClient();

    // Get book info for audio cleanup
    const { data: book } = await adminSupabase
      .from("books")
      .select("id, user_id")
      .eq("id", book_id)
      .single();

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Get existing chapters to clean up their audio files
    const { data: existingChapters } = await adminSupabase
      .from("chapters")
      .select("id, audio_url")
      .eq("book_id", book_id);

    if (existingChapters && existingChapters.length > 0) {
      // Delete audio files from storage
      const audioPaths = existingChapters
        .filter((ch) => ch.audio_url)
        .map((ch) => `${book.user_id}/${book_id}/${ch.id}.wav`);

      if (audioPaths.length > 0) {
        console.log(`[Reprocess] Deleting ${audioPaths.length} audio files`);
        await adminSupabase.storage.from("audio-cache").remove(audioPaths);
      }

      // Delete existing chapters from DB
      console.log(`[Reprocess] Deleting ${existingChapters.length} existing chapters`);
      const { error: deleteError } = await adminSupabase
        .from("chapters")
        .delete()
        .eq("book_id", book_id);

      if (deleteError) {
        console.error("[Reprocess] Failed to delete chapters:", deleteError);
        throw new Error(`Failed to delete existing chapters: ${deleteError.message}`);
      }
    }

    const result = await processBook(book_id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
