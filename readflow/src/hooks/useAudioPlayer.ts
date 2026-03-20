"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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
  const timestampsRef = useRef<WordTimestamp[] | undefined>(timestamps);
  const [loadedState, setLoadedState] = useState(false);
  const {
    isPlaying,
    speed,
    play,
    pause,
    setCurrentWordIndex,
    seek,
  } = useReaderStore();

  // Keep timestamps ref in sync
  useEffect(() => {
    timestampsRef.current = timestamps;
  }, [timestamps]);

  // Initialize Howl
  useEffect(() => {
    if (!audioUrl) return;

    setLoadedState(false);

    const howl = new Howl({
      src: [audioUrl],
      html5: true,
      preload: true,
      onload: () => setLoadedState(true),
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

  // Time update loop — reads timestamps from ref so it always has latest
  const updateLoop = useCallback(() => {
    const howl = howlRef.current;
    if (!howl || !howl.playing()) return;

    const currentMs = (howl.seek() as number) * 1000;
    seek(currentMs);

    const ts = timestampsRef.current;
    if (ts && ts.length > 0) {
      const wordIndex = findWordIndexAtTime(ts, currentMs);
      setCurrentWordIndex(wordIndex);
    }

    rafRef.current = requestAnimationFrame(updateLoop);
  }, [seek, setCurrentWordIndex]);

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
  }, [isPlaying, updateLoop]);

  // Sync speed
  useEffect(() => {
    howlRef.current?.rate(speed);
  }, [speed]);

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

  return {
    seekTo,
    getDuration,
    isLoaded: loadedState,
    isLoading: !!audioUrl && !loadedState,
  };
}
