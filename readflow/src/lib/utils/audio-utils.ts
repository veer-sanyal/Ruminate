export interface WordTimestamp {
  word: string;
  start: number; // ms
  end: number; // ms
}

/**
 * Find which word index corresponds to a given playback time.
 */
export function findWordIndexAtTime(
  timestamps: WordTimestamp[],
  currentMs: number
): number {
  if (!timestamps || timestamps.length === 0) return 0;

  for (let i = timestamps.length - 1; i >= 0; i--) {
    if (currentMs >= timestamps[i]!.start) {
      return i;
    }
  }

  return 0;
}

/**
 * Find the start time of a sentence given the sentence's first word index.
 */
export function findSentenceStartTime(
  timestamps: WordTimestamp[],
  sentenceStartWordIndex: number
): number {
  return timestamps[sentenceStartWordIndex]?.start ?? 0;
}

/**
 * Format milliseconds into a readable duration (MM:SS or HH:MM:SS).
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Calculate progress percentage.
 */
export function calculateProgress(currentMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0;
  return Math.min(100, Math.round((currentMs / totalMs) * 100));
}
