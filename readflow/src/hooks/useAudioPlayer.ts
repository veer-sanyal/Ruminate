"use client";

import { useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { useReaderStore } from "@/stores/readerStore";
import { findWordIndexAtTime, type WordTimestamp } from "@/lib/utils/audio-utils";

interface UseAudioPlayerOptions {
  audioUrl: string | null;
  timestamps?: WordTimestamp[];
  onEnded?: () => void;
}

export function useAudioPlayer({
  audioUrl,
  timestamps,
  onEnded,
}: UseAudioPlayerOptions) {
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number>(0);
  const {
    isPlaying,
    speed,
    play,
    pause,
    setCurrentWordIndex,
    seek,
  } = useReaderStore();

  // Initialize Howl
  useEffect(() => {
    if (!audioUrl) return;

    const howl = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      onend: () => {
        pause();
        onEnded?.();
      },
      onloaderror: (_id, error) => {
        console.error("Audio load error:", error);
      },
    });

    howlRef.current = howl;

    return () => {
      cancelAnimationFrame(rafRef.current);
      howl.unload();
      howlRef.current = null;
    };
  }, [audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause with store
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;

    if (isPlaying) {
      howl.play();
      updateLoop();
    } else {
      howl.pause();
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync speed
  useEffect(() => {
    howlRef.current?.rate(speed);
  }, [speed]);

  // Time update loop
  const updateLoop = useCallback(() => {
    const howl = howlRef.current;
    if (!howl || !howl.playing()) return;

    const currentMs = (howl.seek() as number) * 1000;
    seek(currentMs);

    if (timestamps) {
      const wordIndex = findWordIndexAtTime(timestamps, currentMs);
      setCurrentWordIndex(wordIndex);
    }

    rafRef.current = requestAnimationFrame(updateLoop);
  }, [timestamps, seek, setCurrentWordIndex]);

  // Seek to a specific position
  const seekTo = useCallback((ms: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    howl.seek(ms / 1000);
    seek(ms);
    if (timestamps) {
      const wordIndex = findWordIndexAtTime(timestamps, ms);
      setCurrentWordIndex(wordIndex);
    }
  }, [timestamps, seek, setCurrentWordIndex]);

  // Get total duration
  const getDuration = useCallback((): number => {
    return (howlRef.current?.duration() ?? 0) * 1000;
  }, []);

  const isLoaded = !!howlRef.current && howlRef.current.state() === "loaded";

  return {
    seekTo,
    getDuration,
    isLoaded,
    isLoading: !!audioUrl && !isLoaded,
  };
}
