import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateConfusionClarification } from "@/lib/utils/ai-utils";

/**
 * POST /api/reflections/clarify
 * Generate AI clarification for a confusing passage.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { passage, chapter_id } = await request.json();

  if (!passage || !chapter_id) {
    return NextResponse.json(
      { error: "passage and chapter_id are required" },
      { status: 400 }
    );
  }

  // Get context
  const admin = createAdminClient();
  const { data: distillation } = await admin
    .from("distillations")
    .select("summary")
    .eq("chapter_id", chapter_id)
    .single();

  const { data: chapter } = await admin
    .from("chapters")
    .select("book_id")
    .eq("id", chapter_id)
    .single();

  let bookTitle: string | undefined;
  if (chapter) {
    const { data: book } = await admin
      .from("books")
      .select("title")
      .eq("id", chapter.book_id)
      .single();
    bookTitle = book?.title;
  }

  const clarification = await generateConfusionClarification(passage, {
    chapterSummary: distillation?.summary,
    bookTitle,
  });

  return NextResponse.json({ passage, clarification });
}
