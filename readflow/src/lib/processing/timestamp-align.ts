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
 *
 * @param estimatedDurationMs  Total audio duration estimate; used to extrapolate
 *                              timestamps for words beyond Whisper coverage.
 */
export function alignTimestamps(
  originalText: string,
  whisperWords: WhisperWord[],
  estimatedDurationMs?: number
): WordTimestamp[] {
  const originalTokens = originalText.split(/\s+/).filter(w => w.length > 0);
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^\w'-]/g, "");

  const timestamps: WordTimestamp[] = [];
  let whisperIdx = 0;
  let consecutiveMisses = 0;

  for (let i = 0; i < originalTokens.length; i++) {
    const origNorm = normalize(originalTokens[i]!);

    if (whisperIdx < whisperWords.length) {
      const wNorm = normalize(whisperWords[whisperIdx]!.word);

      // Direct match or close enough (one contains the other)
      if (origNorm.length > 0 && wNorm.length > 0 &&
          (origNorm === wNorm || origNorm.includes(wNorm) || wNorm.includes(origNorm))) {
        timestamps.push({
          word: originalTokens[i]!,
          start: Math.round(whisperWords[whisperIdx]!.start * 1000),
          end: Math.round(whisperWords[whisperIdx]!.end * 1000),
        });
        whisperIdx++;
        consecutiveMisses = 0;
      } else {
        // Look ahead in Whisper words (up to 5) to find a match
        let found = false;
        if (origNorm.length > 0) {
          const maxLook = Math.min(5, whisperWords.length - whisperIdx);
          for (let j = 1; j < maxLook; j++) {
            const futureNorm = normalize(whisperWords[whisperIdx + j]!.word);
            if (futureNorm.length > 0 &&
                (origNorm === futureNorm || origNorm.includes(futureNorm) || futureNorm.includes(origNorm))) {
              whisperIdx += j; // skip unmatched Whisper words
              timestamps.push({
                word: originalTokens[i]!,
                start: Math.round(whisperWords[whisperIdx]!.start * 1000),
                end: Math.round(whisperWords[whisperIdx]!.end * 1000),
              });
              whisperIdx++;
              consecutiveMisses = 0;
              found = true;
              break;
            }
          }
        }

        if (!found) {
          consecutiveMisses++;
          // If stuck for too many consecutive words, skip the Whisper word
          if (consecutiveMisses > 3) {
            whisperIdx++;
            consecutiveMisses = 0;
          }
          const prevEnd = timestamps.length > 0 ? timestamps[timestamps.length - 1]!.end : 0;
          const nextStart = whisperIdx < whisperWords.length
            ? Math.round(whisperWords[whisperIdx]!.start * 1000)
            : prevEnd;
          timestamps.push({
            word: originalTokens[i]!,
            start: prevEnd,
            end: Math.max(prevEnd, nextStart),
          });
        }
      }
    } else {
      // No more whisper words — will be fixed up below
      const prevEnd = timestamps.length > 0 ? timestamps[timestamps.length - 1]!.end : 0;
      timestamps.push({
        word: originalTokens[i]!,
        start: prevEnd,
        end: prevEnd,
      });
    }
  }

  // Fix up tail: if there are words beyond Whisper coverage, distribute them
  // evenly across the remaining estimated duration
  if (timestamps.length > 0 && estimatedDurationMs && estimatedDurationMs > 0) {
    const lastAlignedMs = timestamps[timestamps.length - 1]!.end;
    if (lastAlignedMs < estimatedDurationMs * 0.8) {
      // Find where Whisper coverage ends (last word with a real timestamp change)
      let coverageEnd = timestamps.length - 1;
      for (let i = timestamps.length - 1; i > 0; i--) {
        if (timestamps[i]!.end !== timestamps[i - 1]!.end) {
          coverageEnd = i;
          break;
        }
      }

      const tailCount = timestamps.length - coverageEnd - 1;
      if (tailCount > 0) {
        const tailStartMs = timestamps[coverageEnd]!.end;
        const tailDurationMs = estimatedDurationMs - tailStartMs;
        const perWordMs = tailDurationMs / tailCount;

        for (let i = coverageEnd + 1; i < timestamps.length; i++) {
          const offset = i - coverageEnd;
          timestamps[i]!.start = Math.round(tailStartMs + (offset - 1) * perWordMs);
          timestamps[i]!.end = Math.round(tailStartMs + offset * perWordMs);
        }
      }
    }
  }

  return timestamps;
}
