import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Fetch chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, sort_order, word_count, reading_status, audio_url, last_read_at")
    .eq("book_id", id)
    .order("sort_order", { ascending: true });

  // Calculate progress
  const totalChapters = chapters?.length ?? 0;
  const completedChapters =
    chapters?.filter((c) => c.reading_status === "completed").length ?? 0;
  const progressPercent =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return NextResponse.json({
    ...book,
    chapters: chapters ?? [],
    progress_percent: progressPercent,
    total_chapters: totalChapters,
    completed_chapters: completedChapters,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: book } = await supabase
    .from("books")
    .select("id, source_file_url, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Delete storage files
  if (book.source_file_url) {
    await supabase.storage.from("book-files").remove([book.source_file_url]);
  }

  // Delete chapters (cascade should handle this, but explicit for clarity)
  await supabase.from("chapters").delete().eq("book_id", id);

  // Delete book
  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
