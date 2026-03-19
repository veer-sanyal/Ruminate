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
    const textForTts = chapter.raw_text.substring(0, 5000);
    console.log(`[TTS] Generating audio for chapter ${chId}, text length: ${textForTts.length}`);

    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: textForTts,
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
    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData;

    if (!audioData?.data) {
      console.error("[TTS] No audio data in response. Parts:", JSON.stringify(response.candidates?.[0]?.content?.parts?.map(p => ({ mimeType: p.inlineData?.mimeType, hasData: !!p.inlineData?.data, keys: Object.keys(p) }))));
      throw new Error("No audio data in Gemini response");
    }

    console.log(`[TTS] Audio received, mimeType: ${audioData.mimeType}, data length: ${audioData.data.length}`);

    const audioBuffer = Buffer.from(audioData.data, "base64");
    const mimeType = audioData.mimeType ?? "audio/mp3";
    // Gemini TTS returns audio/wav or audio/L16 — normalize to wav
    const isWav = mimeType.includes("wav") || mimeType.includes("l16") || mimeType.includes("pcm") || mimeType.includes("L16");
    const ext = isWav ? "wav" : "mp3";
    const audioPath = `${user.id}/${id}/${chId}.${ext}`;

    // Upload audio to storage
    console.log(`[TTS] Uploading ${audioBuffer.length} bytes to ${audioPath} as ${mimeType}`);
    const { error: storageError } = await adminSupabase.storage
      .from("audio-cache")
      .upload(audioPath, audioBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (storageError) {
      console.error("[TTS] Storage error:", storageError);
      throw new Error(`Storage error: ${storageError.message}`);
    }

    // Get public URL
    const { data: urlData } = adminSupabase.storage
      .from("audio-cache")
      .getPublicUrl(audioPath);

    // Update chapter record
    const { error: updateError } = await adminSupabase
      .from("chapters")
      .update({
        audio_url: urlData.publicUrl,
      })
      .eq("id", chId);

    if (updateError) {
      console.error("[TTS] DB update error:", updateError);
      throw new Error(`DB update error: ${updateError.message}`);
    }

    console.log(`[TTS] Audio ready: ${urlData.publicUrl}`);
    return NextResponse.json({ audio_url: urlData.publicUrl });
  } catch (error) {
    console.error("[TTS] Error:", error instanceof Error ? error.message : error);
    console.error("[TTS] Stack:", error instanceof Error ? error.stack : "no stack");

    let message = "TTS generation failed";
    let status = 500;

    if (error instanceof Error) {
      // Parse Gemini quota/rate-limit errors
      if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")) {
        message = "TTS quota exceeded. Please try again later.";
        status = 429;
      } else if (error.message.includes("Storage error") || error.message.includes("DB update error")) {
        message = error.message;
      } else {
        message = `Audio generation failed: ${error.message}`;
      }
    }

    return NextResponse.json({ error: message }, { status });
  }
}
