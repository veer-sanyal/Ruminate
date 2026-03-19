import type { WordTimestamp } from "@/lib/utils/audio-utils";

interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

/**
 * Align Whisper transcription word timestamps to the original chapter text.
 * Ensures one WordTimestamp entry per word in the original text, preserving
 * original casing and punctuation. Interpolates timestamps for unmatched words.
 */
export function alignTimestamps(
  originalText: string,
  whisperWords: WhisperWord[]
): WordTimestamp[] {
  const originalTokens = originalText.split(/\s+/).filter(w => w.length > 0);
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^\w'-]/g, "");

  const timestamps: WordTimestamp[] = [];
  let whisperIdx = 0;

  for (let i = 0; i < originalTokens.length; i++) {
    const origNorm = normalize(originalTokens[i]!);

    if (whisperIdx < whisperWords.length) {
      const wNorm = normalize(whisperWords[whisperIdx]!.word);

      // Direct match or close enough (one contains the other)
      if (origNorm === wNorm || origNorm.includes(wNorm) || wNorm.includes(origNorm)) {
        timestamps.push({
          word: originalTokens[i]!,
          start: Math.round(whisperWords[whisperIdx]!.start * 1000),
          end: Math.round(whisperWords[whisperIdx]!.end * 1000),
        });
        whisperIdx++;
      } else {
        // Interpolate from neighbors
        const prevEnd = timestamps.length > 0 ? timestamps[timestamps.length - 1]!.end : 0;
        const nextStart = whisperIdx < whisperWords.length
          ? Math.round(whisperWords[whisperIdx]!.start * 1000)
          : prevEnd + 200;
        timestamps.push({
          word: originalTokens[i]!,
          start: prevEnd,
          end: nextStart,
        });
      }
    } else {
      // No more whisper words — extrapolate
      const prevEnd = timestamps.length > 0 ? timestamps[timestamps.length - 1]!.end : 0;
      timestamps.push({
        word: originalTokens[i]!,
        start: prevEnd,
        end: prevEnd + 200,
      });
    }
  }

  return timestamps;
}
