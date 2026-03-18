export interface ExtractedChapter {
  title: string;
  text: string;
  sortOrder: number;
}

export interface ExtractionResult {
  chapters: ExtractedChapter[];
  metadata?: {
    title?: string;
    author?: string;
    coverUrl?: string;
  };
}

/**
 * Quality check for extracted text.
 * Returns true if text appears to be valid/readable.
 */
export function isQualityText(text: string): boolean {
  if (!text || text.length < 50) return false;

  // Check for garbled text (high ratio of non-ASCII or control characters)
  const nonPrintable = text.replace(/[\x20-\x7E\n\r\t]/g, "").length;
  const garbledRatio = nonPrintable / text.length;
  if (garbledRatio > 0.3) return false;

  // Check minimum word count
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) return false;

  return true;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate listening time in minutes at 1.0x speed (~150 WPM for TTS)
 */
export function estimateListenMins(wordCount: number): number {
  return Math.ceil(wordCount / 150);
}

/**
 * Estimate RSVP reading time in minutes at 300 WPM
 */
export function estimateRsvpMins(wordCount: number): number {
  return Math.ceil(wordCount / 300);
}
