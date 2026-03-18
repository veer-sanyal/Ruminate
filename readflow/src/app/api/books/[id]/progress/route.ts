import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
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

  // Verify book ownership
  const { data: book } = await supabase
    .from("books")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const body = await request.json();

  const updateData: Record<string, unknown> = {
    last_read_at: new Date().toISOString(),
  };

  if (body.listen_progress_ms !== undefined) {
    updateData.listen_progress_ms = body.listen_progress_ms;
  }
  if (body.rsvp_progress_word !== undefined) {
    updateData.rsvp_progress_word = body.rsvp_progress_word;
  }
  if (body.reading_status) {
    updateData.reading_status = body.reading_status;
  }

  const { error } = await supabase
    .from("chapters")
    .update(updateData)
    .eq("id", body.chapter_id)
    .eq("book_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
