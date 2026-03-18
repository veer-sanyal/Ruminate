"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReaderStore } from "@/stores/readerStore";

const SAVE_INTERVAL_MS = 30_000; // 30 seconds

export function useProgressPersistence(
  bookId: string,
  chapterId: string
) {
  const { playbackPosition, currentWordIndex, mode } = useReaderStore();
  const lastSavedRef = useRef(0);

  const saveProgress = useCallback(async () => {
    try {
      await fetch(`/api/books/${bookId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: chapterId,
          listen_progress_ms: mode === "narration" ? Math.round(playbackPosition) : undefined,
          rsvp_progress_word: mode === "rsvp" ? currentWordIndex : undefined,
          reading_status: "in_progress",
        }),
      });
    } catch {
      // Non-critical
    }
  }, [bookId, chapterId, playbackPosition, currentWordIndex, mode]);

  // Periodic save
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSavedRef.current >= SAVE_INTERVAL_MS) {
        lastSavedRef.current = now;
        saveProgress();
      }
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [saveProgress]);

  // Save on visibility change / beforeunload
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        saveProgress();
      }
    }

    function handleBeforeUnload() {
      saveProgress();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveProgress]);

  return { saveProgress };
}
