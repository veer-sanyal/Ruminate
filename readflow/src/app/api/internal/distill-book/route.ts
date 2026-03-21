import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDistillation, generateEmbedding } from "@/lib/utils/ai-utils";
import { generateBookSummary } from "@/lib/processing/book-summary";

export const maxDuration = 120;

/**
 * POST /api/internal/distill-book
 * Self-chaining endpoint: distills one chapter per invocation,
 * then fires a fetch to itself for the next chapter.
 * This avoids Vercel's serverless timeout killing long distillation runs.
 */
export async function POST(request: Request) {
  try {
    const { book_id } = await request.json();
    if (!book_id) {
      return NextResponse.json(
        { error: "book_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify the book exists and is in distilling state
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, title, author, processing_status")
      .eq("id", book_id)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Only proceed if book is in distilling state
    if (book.processing_status !== "distilling") {
      return NextResponse.json({
        message: `Book is in '${book.processing_status}' state, skipping`,
        done: true,
      });
    }

    // Get all chapters ordered by sort_order
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, raw_text, sort_order")
      .eq("book_id", book_id)
      .order("sort_order", { ascending: true });

    if (!chapters?.length) {
      return NextResponse.json({ error: "No chapters found" }, { status: 404 });
    }

    // Find the first chapter without a distillation
    const chapterIds = chapters.map((c) => c.id);
    const { data: distillations } = await supabase
      .from("distillations")
      .select("chapter_id")
      .in("chapter_id", chapterIds);

    const distilledIds = new Set(distillations?.map((d) => d.chapter_id) ?? []);
    const nextChapter = chapters.find((c) => !distilledIds.has(c.id));

    // All chapters distilled — generate book summary and mark ready
    if (!nextChapter) {
      try {
        await generateBookSummary(book_id);
      } catch (err) {
        console.warn("[DistillBook] Book summary generation failed:", err);
      }

      await supabase
        .from("books")
        .update({ processing_status: "ready" })
        .eq("id", book_id);

      return NextResponse.json({ done: true, message: "All chapters distilled" });
    }

    // Distill this chapter
    if (nextChapter.raw_text) {
      const bookContext = {
        title: book.title ?? "Unknown",
        author: book.author,
      };

      const distillation = await generateDistillation(nextChapter.raw_text, bookContext);

      const embeddingText = `${distillation.summary}\n${distillation.key_terms.join(", ")}`;
      let embedding: number[] | null = null;
      try {
        embedding = await generateEmbedding(embeddingText);
      } catch {
        // Continue without embedding
      }

      await supabase.from("distillations").insert({
        chapter_id: nextChapter.id,
        summary: distillation.summary,
        key_terms: distillation.key_terms,
        claims: distillation.claims,
        application_angles: distillation.application_angles,
        identity_beliefs: distillation.identity_beliefs,
        payoff_questions: distillation.payoff_questions,
        embedding: embedding ? `[${embedding.join(",")}]` : null,
      });
    }

    // Update book's updated_at to keep the stale-recovery timer fresh
    await supabase
      .from("books")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", book_id);

    // Chain to self for the next chapter (fire-and-forget)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    fetch(`${baseUrl}/api/internal/distill-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id }),
    }).catch((err) =>
      console.error("[DistillBook] Failed to chain to next chapter:", err)
    );

    const distilledCount = distilledIds.size + 1;
    return NextResponse.json({
      done: false,
      chapter_id: nextChapter.id,
      distilled: distilledCount,
      total: chapters.length,
    });
  } catch (error) {
    console.error("[DistillBook] Error:", error);

    // Try to set book to error state
    try {
      const { book_id } = await request.clone().json();
      if (book_id) {
        const supabase = createAdminClient();
        await supabase
          .from("books")
          .update({
            processing_status: "error",
            processing_error:
              error instanceof Error ? error.message : "Distillation failed",
          })
          .eq("id", book_id);
      }
    } catch {
      // Best effort
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Distillation failed" },
      { status: 500 }
    );
  }
}
