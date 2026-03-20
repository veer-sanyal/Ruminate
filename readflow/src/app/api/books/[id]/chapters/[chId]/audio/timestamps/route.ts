import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { openai } from "@/lib/openai";
import { alignTimestamps } from "@/lib/processing/timestamp-align";
import type { WordTimestamp } from "@/lib/utils/audio-utils";

export const maxDuration = 120;

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
  const [{ data: book }, { data: chapter }] = await Promise.all([
    supabase
      .from("books")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("chapters")
      .select("id, raw_text, audio_url, audio_timestamps")
      .eq("id", chId)
      .eq("book_id", id)
      .single(),
  ]);

  if (!book || !chapter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Already has timestamps (unless force regeneration requested)
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  if (chapter.audio_timestamps?.length && !force) {
    return NextResponse.json({ audio_timestamps: chapter.audio_timestamps });
  }

  if (!chapter.audio_url) {
    return NextResponse.json({ error: "Audio not yet generated" }, { status: 400 });
  }

  if (!chapter.raw_text) {
    return NextResponse.json({ error: "No text available" }, { status: 400 });
  }

  try {
    // Download the audio from storage
    console.log(`[Timestamps] Downloading audio for chapter ${chId}`);
    const audioResponse = await fetch(chapter.audio_url);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBytes = audioArrayBuffer.byteLength;
    console.log(`[Timestamps] Audio size: ${audioBytes} bytes`);

    // Whisper has a 25MB upload limit. If the file is larger, truncate it —
    // alignTimestamps will extrapolate timestamps for the few remaining words.
    const WHISPER_LIMIT = 25 * 1024 * 1024 - 1024; // 25MB minus 1KB safety margin
    let audioToSend: ArrayBuffer;
    if (audioBytes > WHISPER_LIMIT) {
      console.log(`[Timestamps] Audio ${audioBytes} bytes exceeds ${WHISPER_LIMIT}, truncating`);
      audioToSend = audioArrayBuffer.slice(0, WHISPER_LIMIT);
    } else {
      audioToSend = audioArrayBuffer;
    }

    const audioFile = new File([audioToSend], "chapter.mp3", { type: "audio/mpeg" });
    console.log("[Timestamps] Running Whisper for word timestamps...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });
    const whisperWords = (transcription as { words?: { word: string; start: number; end: number }[] }).words ?? [];
    const whisperDuration = (transcription as { duration?: number }).duration ?? 0;
    console.log(`[Timestamps] Whisper returned ${whisperWords.length} words, duration: ${whisperDuration}s`);

    // Estimate total audio duration from file size (~96-128kbps typical for TTS MP3)
    const estimatedDurationSec = audioBytes / 13000; // ~104kbps average
    const whisperCoveragePct = whisperDuration > 0 && estimatedDurationSec > 0
      ? (whisperDuration / estimatedDurationSec) * 100
      : 100;
    console.log(`[Timestamps] Coverage: ${whisperCoveragePct.toFixed(1)}% (whisper ${whisperDuration}s / est ${estimatedDurationSec.toFixed(0)}s)`);

    let timestamps: WordTimestamp[];

    if (whisperCoveragePct < 50 || whisperWords.length < 10) {
      // Whisper failed to decode most of the audio (concatenated MP3 issue)
      // Fall back to character-weighted linear timestamps
      console.log("[Timestamps] Low coverage — using character-weighted linear estimation");
      const originalTokens = chapter.raw_text.split(/\s+/).filter((w: string) => w.length > 0);
      const totalChars = originalTokens.reduce((sum: number, w: string) => sum + w.length, 0);
      // Use Whisper's duration if available, otherwise estimate
      const totalDurationMs = (whisperDuration > 30 ? whisperDuration : estimatedDurationSec) * 1000;
      let charsSoFar = 0;
      timestamps = originalTokens.map((word: string) => {
        const start = Math.round((charsSoFar / totalChars) * totalDurationMs);
        charsSoFar += word.length;
        const end = Math.round((charsSoFar / totalChars) * totalDurationMs);
        return { word, start, end };
      });
    } else {
      timestamps = alignTimestamps(chapter.raw_text, whisperWords);
    }

    console.log(`[Timestamps] Generated ${timestamps.length} word timestamps`);

    // Update chapter with timestamps
    const { error: updateError } = await adminSupabase
      .from("chapters")
      .update({ audio_timestamps: timestamps })
      .eq("id", chId);

    if (updateError) {
      console.error("[Timestamps] DB update error:", updateError);
      throw new Error(`DB update error: ${updateError.message}`);
    }

    return NextResponse.json({ audio_timestamps: timestamps });
  } catch (error) {
    console.error("[Timestamps] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: `Timestamp generation failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
