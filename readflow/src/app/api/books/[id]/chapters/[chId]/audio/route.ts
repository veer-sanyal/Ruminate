import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ai, MODEL_TTS, MODEL_LIVE_TTS } from "@/lib/gemini";
import { Modality } from "@google/genai";

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

    // Generate TTS audio via Gemini Live API (handles full chapter text)
    const fullText = chapter.raw_text;
    console.log(`[TTS] Generating audio for chapter ${chId}, full text length: ${fullText.length}`);

    let audioBuffer: Buffer;
    try {
      audioBuffer = await generateAudioViaLiveApi(fullText, geminiVoice);
    } catch (liveError) {
      console.warn("[TTS] Live API failed, falling back to batch chunking:", liveError);
      audioBuffer = await generateAudioViaBatchChunking(fullText, geminiVoice);
    }

    const uploadMimeType = "audio/wav";

    const audioPath = `${user.id}/${id}/${chId}.wav`;

    // Ensure audio-cache bucket exists
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === "audio-cache")) {
      console.log("[TTS] Creating audio-cache bucket");
      await adminSupabase.storage.createBucket("audio-cache", { public: true });
    }

    // Upload audio to storage
    console.log(`[TTS] Uploading ${audioBuffer.length} bytes to ${audioPath}`);
    const { error: storageError } = await adminSupabase.storage
      .from("audio-cache")
      .upload(audioPath, audioBuffer, {
        contentType: uploadMimeType,
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

/**
 * Split text into chunks at sentence boundaries, never exceeding maxChars.
 */
function splitTextIntoChunks(text: string, maxChars = 4000): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence boundary within maxChars
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
      splitAt = sentenceEnd + 1; // Include the punctuation
    } else {
      // No good sentence boundary — split at last space
      const lastSpace = slice.lastIndexOf(" ");
      splitAt = lastSpace > maxChars * 0.3 ? lastSpace : maxChars;
    }

    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }

  return chunks;
}

/**
 * Generate audio via Gemini Live API (streaming).
 * Sends text in chunks via a live session, collects PCM, wraps in WAV.
 */
async function generateAudioViaLiveApi(text: string, voiceName: string): Promise<Buffer> {
  const chunks = splitTextIntoChunks(text, 4000);
  console.log(`[TTS Live] ${chunks.length} chunks, voice: ${voiceName}`);

  const pcmBuffers: Buffer[] = [];
  let sampleRate = 24000;
  let done = false;
  let resolveCompletion: (() => void) | null = null;
  let rejectCompletion: ((err: Error) => void) | null = null;

  const session = await ai.live.connect({
    model: MODEL_LIVE_TTS,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
    callbacks: {
      onmessage: (message) => {
        const serverContent = message.serverContent;
        if (serverContent?.modelTurn?.parts) {
          for (const part of serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
              pcmBuffers.push(Buffer.from(part.inlineData.data, "base64"));
              const mime = part.inlineData.mimeType ?? "";
              const rateMatch = mime.match(/rate=(\d+)/);
              if (rateMatch?.[1]) {
                sampleRate = parseInt(rateMatch[1]);
              }
            }
          }
        }
        if (serverContent?.turnComplete) {
          done = true;
          resolveCompletion?.();
        }
      },
      onerror: (error) => {
        console.error("[TTS Live] Stream error:", error);
        rejectCompletion?.(new Error("Live TTS stream error"));
      },
    },
  });

  try {
    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      console.log(`[TTS Live] Sending chunk ${i + 1}/${chunks.length} (${chunks[i]!.length} chars)`);

      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [{ text: chunks[i]! }],
          },
        ],
        turnComplete: isLast,
      });
    }

    // Wait for turnComplete from the server
    if (!done) {
      await new Promise<void>((resolve, reject) => {
        resolveCompletion = resolve;
        rejectCompletion = reject;
        setTimeout(() => reject(new Error("Live TTS session timed out after 120s")), 120_000);
      });
    }
  } finally {
    session.close();
  }

  if (pcmBuffers.length === 0) {
    throw new Error("No audio data received from Live API");
  }

  const combinedPcm = Buffer.concat(pcmBuffers);
  console.log(`[TTS Live] Total PCM: ${combinedPcm.length} bytes, rate: ${sampleRate}`);
  return Buffer.from(wrapPcmInWav(combinedPcm, sampleRate));
}

/**
 * Fallback: generate audio via batch API with chunking.
 * Calls generateContent for each chunk and concatenates PCM.
 */
async function generateAudioViaBatchChunking(text: string, voiceName: string): Promise<Buffer> {
  const chunks = splitTextIntoChunks(text, 4000);
  console.log(`[TTS Batch] ${chunks.length} chunks, voice: ${voiceName}`);

  const pcmBuffers: Buffer[] = [];
  let sampleRate = 24000;

  for (let i = 0; i < chunks.length; i++) {
    console.log(`[TTS Batch] Generating chunk ${i + 1}/${chunks.length} (${chunks[i]!.length} chars)`);

    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: chunks[i]!,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData;

    if (!audioData?.data) {
      console.error(`[TTS Batch] No audio data for chunk ${i + 1}`);
      throw new Error(`No audio data for chunk ${i + 1}`);
    }

    const rawMimeType = audioData.mimeType ?? "";
    const rateMatch = rawMimeType.match(/rate=(\d+)/);
    if (rateMatch?.[1]) {
      sampleRate = parseInt(rateMatch[1]);
    }

    pcmBuffers.push(Buffer.from(audioData.data, "base64"));
  }

  const combinedPcm = Buffer.concat(pcmBuffers);
  console.log(`[TTS Batch] Total PCM: ${combinedPcm.length} bytes, rate: ${sampleRate}`);
  return Buffer.from(wrapPcmInWav(combinedPcm, sampleRate));
}

/**
 * Wrap raw PCM (16-bit signed, mono) data in a WAV container
 * so browsers can play it.
 */
function wrapPcmInWav(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;

  const header = Buffer.alloc(headerSize);

  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(dataSize + headerSize - 8, 4);
  header.write("WAVE", 8);

  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}
