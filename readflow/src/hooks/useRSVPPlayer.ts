"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReaderStore } from "@/stores/readerStore";
import { splitIntoWords, splitIntoParagraphs } from "@/lib/utils/text-utils";
import { calculateWordDuration, calculateParagraphBreak } from "@/lib/utils/rsvp-utils";

interface UseRSVPPlayerOptions {
  text: string;
  wpm: number;
  onEnded?: () => void;
}

export function useRSVPPlayer({ text, wpm, onEnded }: UseRSVPPlayerOptions) {
  const {
    isPlaying,
    currentWordIndex,
    setCurrentWordIndex,
    play,
    pause,
  } = useReaderStore();

  const words = splitIntoWords(text);
  const paragraphs = splitIntoParagraphs(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;

  // Build a set of word indices that end a paragraph (for paragraph break pauses)
  const paragraphEndIndices = useRef(new Set<number>());
  useEffect(() => {
    const indices = new Set<number>();
    let wordCount = 0;
    for (const para of paragraphs) {
      const paraWords = splitIntoWords(para);
      wordCount += paraWords.length;
      indices.add(wordCount - 1);
    }
    paragraphEndIndices.current = indices;
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    const store = useReaderStore.getState();
    const nextIndex = store.currentWordIndex + 1;

    if (nextIndex >= words.length) {
      store.pause();
      onEnded?.();
      return;
    }

    store.setCurrentWordIndex(nextIndex);

    // Schedule next word
    const word = words[nextIndex] ?? "";
    let duration = calculateWordDuration(word, wpmRef.current);

    // Extra pause at paragraph boundaries
    if (paragraphEndIndices.current.has(nextIndex)) {
      duration += calculateParagraphBreak(wpmRef.current);
    }

    timerRef.current = setTimeout(advance, duration);
  }, [words, onEnded]);

  // Start/stop the timer based on play state
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const word = words[currentWordIndex] ?? "";
      const duration = calculateWordDuration(word, wpmRef.current);
      timerRef.current = setTimeout(advance, duration);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  const seekToWord = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, words.length - 1));
      setCurrentWordIndex(clamped);

      // If playing, restart the timer from the new position
      if (useReaderStore.getState().isPlaying) {
        if (timerRef.current) clearTimeout(timerRef.current);
        const word = words[clamped] ?? "";
        const duration = calculateWordDuration(word, wpmRef.current);
        timerRef.current = setTimeout(advance, duration);
      }
    },
    [words, setCurrentWordIndex, advance]
  );

  return {
    words,
    currentWord: words[currentWordIndex] ?? "",
    currentWordIndex,
    totalWords: words.length,
    play,
    pause,
    seekToWord,
    isPlaying,
    progressPercent:
      words.length > 0
        ? Math.round((currentWordIndex / (words.length - 1)) * 100)
        : 0,
  };
}
