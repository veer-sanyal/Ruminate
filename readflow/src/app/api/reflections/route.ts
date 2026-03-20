import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateReflectionPrompts,
  generateEmbedding,
} from "@/lib/utils/ai-utils";

/**
 * GET /api/reflections?chapter_id=...&book_id=...
 * List reflections for a chapter or book.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapter_id");
  const bookId = searchParams.get("book_id");

  let query = supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (chapterId) {
    query = query.eq("chapter_id", chapterId);
  } else if (bookId) {
    // Get reflections for all chapters in a book
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id")
      .eq("book_id", bookId);

    if (!chapters?.length) {
      return NextResponse.json([]);
    }

    query = query.in(
      "chapter_id",
      chapters.map((c) => c.id)
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/reflections
 * Create a new reflection with AI-generated prompts and connections.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chapter_id } = await request.json();
  if (!chapter_id) {
    return NextResponse.json(
      { error: "chapter_id is required" },
      { status: 400 }
    );
  }

  // Check for existing reflection
  const { data: existing } = await supabase
    .from("reflections")
    .select("*")
    .eq("chapter_id", chapter_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Get distillation for this chapter
  const admin = createAdminClient();
  const { data: distillation } = await admin
    .from("distillations")
    .select("*")
    .eq("chapter_id", chapter_id)
    .single();

  // Get user profile for personalization
  const { data: userProfile } = await supabase
    .from("users")
    .select("focus_areas, coach_tone")
    .eq("id", user.id)
    .single();

  // Generate AI prompts (with or without distillation)
  let aiPrompts = [];
  try {
    if (distillation) {
      aiPrompts = await generateReflectionPrompts(distillation, userProfile ?? undefined);
    } else {
      // Distillation not ready yet — use generic prompts
      aiPrompts = [
        { depth: "surface", prompt: "What was the main idea of this chapter?" },
        { depth: "analytical", prompt: "Which claim did you find most compelling, and why?" },
        { depth: "personal", prompt: "How does this chapter connect to your own experience?" },
      ];
    }
  } catch (err) {
    console.warn("[Reflections] Prompt generation failed:", err);
    aiPrompts = [
      { depth: "surface", prompt: "What was the main idea of this chapter?" },
      { depth: "analytical", prompt: "Which claim did you find most compelling, and why?" },
      { depth: "personal", prompt: "How does this chapter connect to your own experience?" },
    ];
  }

  // Find related chapters via embedding similarity
  let aiConnections: { chapter_id: string; chapter_title: string; similarity: number; shared_themes: string[] }[] = [];
  try {
    if (distillation?.embedding) {
      // Get the chapter's book_id
      const { data: chapter } = await admin
        .from("chapters")
        .select("book_id")
        .eq("id", chapter_id)
        .single();

      if (chapter) {
        const { data: matches } = await admin.rpc("match_distillations", {
          query_embedding: distillation.embedding,
          match_count: 4,
          filter_book_id: chapter.book_id,
        });

        if (matches) {
          // Filter out the current chapter and get titles
          const otherMatches = matches.filter(
            (m: { chapter_id: string }) => m.chapter_id !== chapter_id
          );

          for (const match of otherMatches.slice(0, 3)) {
            const { data: ch } = await admin
              .from("chapters")
              .select("title")
              .eq("id", match.chapter_id)
              .single();

            aiConnections.push({
              chapter_id: match.chapter_id,
              chapter_title: ch?.title ?? "Untitled",
              similarity: match.similarity,
              shared_themes: match.key_terms?.slice(0, 3) ?? [],
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Reflections] Connection generation failed:", err);
  }

  // Create the reflection
  const { data: reflection, error } = await supabase
    .from("reflections")
    .insert({
      chapter_id,
      user_id: user.id,
      ai_prompts: aiPrompts,
      ai_connections: aiConnections,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(reflection, { status: 201 });
}
