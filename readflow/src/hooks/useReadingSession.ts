"use client";

import { useEffect, useRef } from "react";
import { useReaderStore } from "@/stores/readerStore";

export function useReadingSession(chapterId: string, mode: "narration" | "rsvp") {
  const sessionIdRef = useRef<string | null>(null);
  const { speed, checkpointRatings, currentWordIndex, sessionStartTime } =
    useReaderStore();

  // Create session on mount
  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapter_id: chapterId, mode }),
        });
        if (res.ok) {
          const data = await res.json();
          sessionIdRef.current = data.id;
        }
      } catch {
        // Session tracking is non-critical
      }
    }

    createSession();

    return () => {
      endSession();
    };
  }, [chapterId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function endSession() {
    if (!sessionIdRef.current || !sessionStartTime) return;

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          duration_seconds: durationSeconds,
          words_consumed: currentWordIndex,
          avg_speed: speed,
          comprehension_ratings: checkpointRatings,
        }),
      });
    } catch {
      // Non-critical
    }
  }

  return { endSession };
}
