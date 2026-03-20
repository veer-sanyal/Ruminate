import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDistillation, generateEmbedding } from "@/lib/utils/ai-utils";

export const maxDuration = 120;

/**
 * POST /api/internal/distill-chapter
 * Generates AI distillation for a single chapter.
 * Called internally by the processing pipeline.
 */
export async function POST(request: Request) {
  try {
    const { chapter_id } = await request.json();
    if (!chapter_id) {
      return NextResponse.json(
        { error: "chapter_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if already distilled
    const { data: existing } = await supabase
      .from("distillations")
      .select("id")
      .eq("chapter_id", chapter_id)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Already distilled", id: existing.id });
    }

    // Load chapter with book context
    const { data: chapter, error: chError } = await supabase
      .from("chapters")
      .select("id, raw_text, book_id")
      .eq("id", chapter_id)
      .single();

    if (chError || !chapter?.raw_text) {
      return NextResponse.json(
        { error: "Chapter not found or has no text" },
        { status: 404 }
      );
    }

    const { data: book } = await supabase
      .from("books")
      .select("title, author")
      .eq("id", chapter.book_id)
      .single();

    // Generate distillation
    const distillation = await generateDistillation(chapter.raw_text, {
      title: book?.title ?? "Unknown",
      author: book?.author,
    });

    // Generate embedding from summary + key terms
    const embeddingText = `${distillation.summary}\n${distillation.key_terms.join(", ")}`;
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(embeddingText);
    } catch (err) {
      console.warn("[Distill] Embedding generation failed, proceeding without:", err);
    }

    // Store result
    const { data: result, error: insertError } = await supabase
      .from("distillations")
      .insert({
        chapter_id,
        summary: distillation.summary,
        key_terms: distillation.key_terms,
        claims: distillation.claims,
        application_angles: distillation.application_angles,
        identity_beliefs: distillation.identity_beliefs,
        payoff_questions: distillation.payoff_questions,
        embedding: embedding ? `[${embedding.join(",")}]` : null,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`Failed to insert distillation: ${insertError.message}`);
    }

    return NextResponse.json({ success: true, id: result?.id });
  } catch (error) {
    console.error("[Distill] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Distillation failed" },
      { status: 500 }
    );
  }
}
