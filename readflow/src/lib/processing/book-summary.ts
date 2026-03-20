import { createAdminClient } from "@/lib/supabase/admin";
import { ai, MODEL_FLASH } from "@/lib/gemini";

/**
 * Generate book-level AI summary and theme tags from chapter distillations.
 * Called after all chapters have been distilled.
 */
export async function generateBookSummary(bookId: string) {
  const supabase = createAdminClient();

  // Fetch all distillations for this book's chapters
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, sort_order")
    .eq("book_id", bookId)
    .order("sort_order");

  if (!chapters?.length) return;

  const chapterIds = chapters.map((c) => c.id);

  const { data: distillations } = await supabase
    .from("distillations")
    .select("chapter_id, summary, key_terms")
    .in("chapter_id", chapterIds);

  if (!distillations?.length) return;

  // Build context from distillations in chapter order
  const orderedDistillations = chapters
    .map((ch) => {
      const dist = distillations.find((d) => d.chapter_id === ch.id);
      return dist ? `${ch.title ?? `Chapter ${ch.sort_order + 1}`}: ${dist.summary}` : null;
    })
    .filter(Boolean);

  const allKeyTerms = distillations.flatMap((d) => d.key_terms);

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Synthesize a book summary and theme tags from these chapter summaries.

Chapter summaries:
${orderedDistillations.join("\n\n")}

Key terms across all chapters: ${[...new Set(allKeyTerms)].join(", ")}

Respond with ONLY valid JSON:
{
  "ai_summary": "A compelling 2-4 sentence overview of the entire book's thesis and key contributions",
  "theme_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Guidelines:
- ai_summary: Write as if for a reader deciding whether to pick up the book. Be specific, not generic.
- theme_tags: 3-6 thematic tags (lowercase, concise). E.g. "behavioral economics", "habit formation", "decision-making"`,
  });

  const text = response.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("[BookSummary] Failed to parse LLM response");
    return;
  }

  const parsed = JSON.parse(jsonMatch[0]);

  await supabase
    .from("books")
    .update({
      ai_summary: parsed.ai_summary || null,
      theme_tags: parsed.theme_tags || [],
    })
    .eq("id", bookId);
}
