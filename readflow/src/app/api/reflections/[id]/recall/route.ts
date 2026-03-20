import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRecallQuestions } from "@/lib/utils/ai-utils";

/**
 * POST /api/reflections/:id/recall
 * Generate recall questions for a reflection's chapter.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the reflection
  const { data: reflection } = await supabase
    .from("reflections")
    .select("chapter_id, recall_questions")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!reflection) {
    return NextResponse.json({ error: "Reflection not found" }, { status: 404 });
  }

  // Return existing if already generated
  const existingQuestions = reflection.recall_questions as unknown[];
  if (existingQuestions && Array.isArray(existingQuestions) && existingQuestions.length > 0) {
    return NextResponse.json({ recall_questions: existingQuestions });
  }

  // Get distillation
  const admin = createAdminClient();
  const { data: distillation } = await admin
    .from("distillations")
    .select("summary, key_terms, claims")
    .eq("chapter_id", reflection.chapter_id)
    .single();

  if (!distillation) {
    return NextResponse.json(
      { error: "No distillation found for this chapter" },
      { status: 404 }
    );
  }

  const questions = await generateRecallQuestions(distillation);

  // Save to reflection
  await supabase
    .from("reflections")
    .update({ recall_questions: questions })
    .eq("id", id);

  return NextResponse.json({ recall_questions: questions });
}
