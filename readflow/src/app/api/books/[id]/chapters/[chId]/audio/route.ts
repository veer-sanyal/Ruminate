import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { openai } from "@/lib/openai";

export const maxDuration = 120;

const VALID_VOICES = ["alloy", "ash", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"] as const;
type Voice = typeof VALID_VOICES[number];

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

  // Verify ownership and get chapter in parallel
  const [{ data: book }, { data: chapter }] = await Promise.all([
    supabase
      .from("books")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("chapters")
      .select("id, raw_text, audio_url")
      .eq("id", chId)
      .eq("book_id", id)
      .single(),
  ]);

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // If audio already exists, return it (unless force regeneration)
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  if (chapter.audio_url && !force) {
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
    const voice: Voice = VALID_VOICES.includes(userVoice as Voice)
      ? (userVoice as Voice)
      : "alloy";

    const fullText = chapter.raw_text;
    console.log(`[TTS] Generating audio for chapter ${chId}, text length: ${fullText.length}, voice: ${voice}`);

    // Split into chunks at sentence boundaries (OpenAI TTS limit ~4096 chars)
    const chunks = splitTextIntoChunks(fullText, 4096);
    console.log(`[TTS] ${chunks.length} chunks`);

    // Generate MP3 for all chunks in parallel
    const mp3Buffers = await Promise.all(
      chunks.map(async (chunk, i) => {
        console.log(`[TTS] Generating chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
        const mp3Response = await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice,
          input: chunk,
          instructions: "Read this book passage naturally, as an audiobook narrator. Maintain a warm, steady pace.",
          response_format: "mp3",
          speed: 1.0,
        });
        const arrayBuffer = await mp3Response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    // Concatenate MP3 buffers — strip ID3/header from chunks after the first
    // so Whisper and other decoders treat it as a single continuous stream
    const audioBuffer = Buffer.concat(
      mp3Buffers.map((buf, i) => (i === 0 ? buf : stripMp3Header(buf)))
    );
    console.log(`[TTS] Total audio: ${audioBuffer.length} bytes`);

    // Upload audio to Supabase Storage
    const audioPath = `${user.id}/${id}/${chId}.mp3`;

    // Ensure audio-cache bucket exists
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === "audio-cache")) {
      console.log("[TTS] Creating audio-cache bucket");
      await adminSupabase.storage.createBucket("audio-cache", { public: true });
    }

    console.log(`[TTS] Uploading ${audioBuffer.length} bytes to ${audioPath}`);
    const { error: storageError } = await adminSupabase.storage
      .from("audio-cache")
      .upload(audioPath, audioBuffer, {
        contentType: "audio/mpeg",
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

    // Update chapter record with audio URL; clear old timestamps since audio changed
    const { error: updateError } = await adminSupabase
      .from("chapters")
      .update({ audio_url: urlData.publicUrl, audio_timestamps: null })
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
      if (error.message.includes("rate_limit") || error.message.includes("429")) {
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

/**
 * Strip ID3v2 tags and find the first MPEG sync frame in an MP3 buffer.
 * Used when concatenating multiple MP3 files into one continuous stream.
 */
function stripMp3Header(buf: Buffer): Buffer {
  let offset = 0;

  // Skip ID3v2 tag if present ("ID3" magic bytes)
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    // ID3v2 size is stored in 4 bytes (synchsafe integers)
    const size =
      ((buf[6]! & 0x7f) << 21) |
      ((buf[7]! & 0x7f) << 14) |
      ((buf[8]! & 0x7f) << 7) |
      (buf[9]! & 0x7f);
    offset = 10 + size;
  }

  // Find first MPEG audio frame sync word (0xFF followed by 0xE0+)
  while (offset < buf.length - 1) {
    if (buf[offset] === 0xff && (buf[offset + 1]! & 0xe0) === 0xe0) {
      break;
    }
    offset++;
  }

  return buf.subarray(offset);
}

/**
 * Split text into chunks at sentence boundaries, never exceeding maxChars.
 */
function splitTextIntoChunks(text: string, maxChars = 4096): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    const slice = remaining.substring(0, maxChars);
    const sentenceEnd = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf("? "),
      slice.lastIndexOf("! "),
      slice.lastIndexOf(".\n"),
      slice.lastIndexOf("?\n"),
      slice.lastIndexOf("!\n"),
    );

    let splitAt: number;
    if (sentenceEnd > maxChars * 0.3) {
      splitAt = sentenceEnd + 1;
    } else {
      const lastSpace = slice.lastIndexOf(" ");
      splitAt = lastSpace > maxChars * 0.3 ? lastSpace : maxChars;
    }

    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }

  return chunks;
}
