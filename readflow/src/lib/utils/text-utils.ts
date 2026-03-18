/**
 * Split text into individual words, preserving punctuation attached to words.
 */
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Split text into sentences using basic heuristics.
 * Each sentence includes its ending punctuation.
 */
export function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  return sentences;
}

/**
 * Split text into paragraphs (double newline separated).
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Get the word at a specific index.
 */
export function getWordAtIndex(words: string[], index: number): string | undefined {
  return words[index];
}

/**
 * Find which sentence a word belongs to, given a word index.
 * Returns the sentence index.
 */
export function getSentenceForWord(
  text: string,
  wordIndex: number
): { sentenceIndex: number; sentenceText: string } {
  const sentences = splitIntoSentences(text);
  let wordCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentenceWords = splitIntoWords(sentences[i]!);
    wordCount += sentenceWords.length;
    if (wordIndex < wordCount) {
      return { sentenceIndex: i, sentenceText: sentences[i]! };
    }
  }

  return {
    sentenceIndex: sentences.length - 1,
    sentenceText: sentences[sentences.length - 1] ?? "",
  };
}

/**
 * Find which paragraph a word belongs to.
 */
export function getParagraphForWord(
  text: string,
  wordIndex: number
): { paragraphIndex: number; paragraphText: string } {
  const paragraphs = splitIntoParagraphs(text);
  let wordCount = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraphWords = splitIntoWords(paragraphs[i]!);
    wordCount += paragraphWords.length;
    if (wordIndex < wordCount) {
      return { paragraphIndex: i, paragraphText: paragraphs[i]! };
    }
  }

  return {
    paragraphIndex: paragraphs.length - 1,
    paragraphText: paragraphs[paragraphs.length - 1] ?? "",
  };
}
