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

  // Already has timestamps
  if (chapter.audio_timestamps?.length) {
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

    const WHISPER_LIMIT = 24 * 1024 * 1024; // 24MB to stay safely under 25MB limit
    let whisperWords: { word: string; start: number; end: number }[] = [];

    if (audioBytes <= WHISPER_LIMIT) {
      // Small enough — single Whisper call
      const audioFile = new File([audioArrayBuffer], "chapter.mp3", { type: "audio/mpeg" });
      console.log("[Timestamps] Running Whisper for word timestamps...");
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      });
      whisperWords = (transcription as { words?: { word: string; start: number; end: number }[] }).words ?? [];
    } else {
      // Split MP3 into chunks under the limit and transcribe each
      // MP3 frames are independently decodable, so byte-level splitting works
      const numChunks = Math.ceil(audioBytes / WHISPER_LIMIT);
      const chunkSize = Math.ceil(audioBytes / numChunks);
      console.log(`[Timestamps] Audio exceeds limit, splitting into ${numChunks} chunks of ~${chunkSize} bytes`);

      // We need to estimate duration per chunk for timestamp offsetting
      // First, get total duration from a quick Whisper call on a tiny slice
      // Instead, we process sequentially and use Whisper's returned timestamps + offset
      const audioBuffer = Buffer.from(audioArrayBuffer);

      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, audioBytes);
        const chunkBuffer = audioBuffer.subarray(start, end);
        const chunkFile = new File([chunkBuffer], `chunk_${i}.mp3`, { type: "audio/mpeg" });

        console.log(`[Timestamps] Whisper chunk ${i + 1}/${numChunks} (${chunkBuffer.length} bytes)`);
        const transcription = await openai.audio.transcriptions.create({
          file: chunkFile,
          model: "whisper-1",
          response_format: "verbose_json",
          timestamp_granularities: ["word"],
        });

        const chunkWords = (transcription as { words?: { word: string; start: number; end: number }[] }).words ?? [];

        if (i === 0) {
          whisperWords = chunkWords;
        } else {
          // Offset timestamps: the last word end of previous chunk is our time offset
          const timeOffset = whisperWords.length > 0
            ? whisperWords[whisperWords.length - 1]!.end
            : 0;
          for (const w of chunkWords) {
            whisperWords.push({
              word: w.word,
              start: w.start + timeOffset,
              end: w.end + timeOffset,
            });
          }
        }
      }
    }

    console.log(`[Timestamps] Whisper returned ${whisperWords.length} words`);

    const timestamps: WordTimestamp[] = alignTimestamps(chapter.raw_text, whisperWords);
    console.log(`[Timestamps] Aligned ${timestamps.length} word timestamps`);

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
