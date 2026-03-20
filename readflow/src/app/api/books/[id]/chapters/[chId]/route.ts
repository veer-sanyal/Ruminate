import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; chId: string }> }
) {
  const { id, chId } = await params;
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

  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chId)
    .eq("book_id", id)
    .single();

  if (error || !chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // Include distillation data if available
  const admin = createAdminClient();
  const { data: distillation } = await admin
    .from("distillations")
    .select("summary, key_terms, claims, application_angles, payoff_questions")
    .eq("chapter_id", chId)
    .single();

  return NextResponse.json({
    ...chapter,
    distillation: distillation ?? null,
  });
}
