"use client";

import { useEffect, useRef } from "react";
import { useReaderStore } from "@/stores/readerStore";

const CHECKPOINT_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

/**
 * Tracks elapsed playback time and triggers checkpoint cards.
 */
export function useCheckpoints() {
  const { isPlaying, checkpointPending, triggerCheckpoint } = useReaderStore();
  const playTimeRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || checkpointPending) {
      lastTickRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current) {
        playTimeRef.current += now - lastTickRef.current;
      }
      lastTickRef.current = now;

      if (playTimeRef.current >= CHECKPOINT_INTERVAL_MS) {
        playTimeRef.current = 0;
        triggerCheckpoint();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, checkpointPending, triggerCheckpoint]);
}
