"use client";

import { useEffect, useRef } from "react";
import { useReaderStore } from "@/stores/readerStore";

/**
 * Manages word highlighting and auto-scrolling in the reader.
 */
export function useWordHighlight(containerRef: React.RefObject<HTMLDivElement | null>) {
  const currentWordIndex = useReaderStore((s) => s.currentWordIndex);
  const prevWordRef = useRef(-1);

  useEffect(() => {
    if (currentWordIndex === prevWordRef.current) return;
    prevWordRef.current = currentWordIndex;

    const container = containerRef.current;
    if (!container) return;

    // Find the highlighted word element
    const wordEl = container.querySelector(
      `[data-word-index="${currentWordIndex}"]`
    ) as HTMLElement | null;

    if (!wordEl) return;

    // Auto-scroll to keep highlighted word in view
    const containerRect = container.getBoundingClientRect();
    const wordRect = wordEl.getBoundingClientRect();

    const isAbove = wordRect.top < containerRect.top + 80;
    const isBelow = wordRect.bottom > containerRect.bottom - 80;

    if (isAbove || isBelow) {
      wordEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentWordIndex, containerRef]);

  return { currentWordIndex };
}
