import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ai, MODEL_TTS } from "@/lib/gemini";

// Map our voice names to Gemini prebuilt voices
const VOICE_MAP: Record<string, string> = {
  alloy: "Kore",
  echo: "Puck",
  nova: "Aoede",
  shimmer: "Leda",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; chId: string }> }
) {
  const { id, chId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership and get chapter
  const { data: book } = await supabase
    .from("books")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, raw_text, audio_url")
    .eq("id", chId)
    .eq("book_id", id)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // If audio already exists, return it
  if (chapter.audio_url) {
    return NextResponse.json({ audio_url: chapter.audio_url });
  }

  if (!chapter.raw_text) {
    return NextResponse.json({ error: "No text available" }, { status: 400 });
  }

  try {
    // Get user's preferred voice
    const { data: profile } = await supabase
      .from("users")
      .select("preferred_voice")
      .eq("id", user.id)
      .single();

    const userVoice = profile?.preferred_voice ?? "alloy";
    const geminiVoice = VOICE_MAP[userVoice] ?? "Kore";

    // Generate TTS audio via Gemini
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: chapter.raw_text.substring(0, 5000),
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: geminiVoice,
            },
          },
        },
      },
    });

    // Extract audio data from response
    const audioData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioData?.data) {
      throw new Error("No audio data in Gemini response");
    }

    const audioBuffer = Buffer.from(audioData.data, "base64");
    const mimeType = audioData.mimeType ?? "audio/mp3";
    const ext = mimeType.includes("wav") ? "wav" : "mp3";
    const audioPath = `${user.id}/${id}/${chId}.${ext}`;

    // Upload audio to storage
    const { error: storageError } = await adminSupabase.storage
      .from("audio-cache")
      .upload(audioPath, audioBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (storageError) {
      throw new Error(`Storage error: ${storageError.message}`);
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from("audio-cache")
      .getPublicUrl(audioPath);

    // Update chapter record
    await adminSupabase
      .from("chapters")
      .update({
        audio_url: urlData.publicUrl,
      })
      .eq("id", chId);

    return NextResponse.json({ audio_url: urlData.publicUrl });
  } catch (error) {
    let message = "TTS generation failed";
    let status = 500;

    if (error instanceof Error) {
      // Parse Gemini quota/rate-limit errors
      if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
        message = "TTS quota exceeded. Please try again later.";
        status = 429;
      } else if (error.message.includes("Storage error")) {
        message = error.message;
      } else {
        message = "Audio generation failed. Please retry.";
      }
    }

    return NextResponse.json({ error: message }, { status });
  }
}
