"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReaderStore } from "@/stores/readerStore";

/**
 * Manages word highlighting and auto-scrolling in the reader.
 * Pauses auto-scroll when user manually scrolls; resumes after 4s of inactivity
 * or when playback resumes.
 */
export function useWordHighlight(containerRef: React.RefObject<HTMLDivElement | null>) {
  const currentWordIndex = useReaderStore((s) => s.currentWordIndex);
  const isPlaying = useReaderStore((s) => s.isPlaying);
  const prevWordRef = useRef(-1);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticScrollRef = useRef(false);

  // Detect user manual scrolls and pause auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Listen on the parent scrollable element (reader-content)
    const scrollTarget = container.closest(".reader-content") ?? window;

    function handleScroll() {
      if (programmaticScrollRef.current) return;

      userScrolledRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        userScrolledRef.current = false;
      }, 4000);
    }

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [containerRef]);

  // Resume auto-scroll when playback starts
  useEffect(() => {
    if (isPlaying) {
      userScrolledRef.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }
  }, [isPlaying]);

  // Auto-scroll to keep highlighted word centered
  useEffect(() => {
    if (currentWordIndex === prevWordRef.current) return;
    prevWordRef.current = currentWordIndex;

    if (userScrolledRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const wordEl = container.querySelector(
      `[data-word-index="${currentWordIndex}"]`
    ) as HTMLElement | null;

    if (!wordEl) return;

    programmaticScrollRef.current = true;
    wordEl.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    // Reset flag after scroll animation completes
    setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 600);
  }, [currentWordIndex, containerRef]);

  return { currentWordIndex };
}
