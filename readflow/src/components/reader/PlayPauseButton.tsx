"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/stores/readerStore";
import { Play, Pause } from "@/lib/icons";

export default function PlayPauseButton() {
  const { isPlaying, togglePlayPause } = useReaderStore();

  // Spacebar shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause]);

  return (
    <>
      <button className="play-pause" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? (
          <Pause size={28} strokeWidth={2} />
        ) : (
          <Play size={28} strokeWidth={2} />
        )}
      </button>

      <style jsx>{`
        .play-pause {
          width: 64px;
          height: 64px;
          border-radius: 32px;
          background: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          transition: transform 100ms ease;
        }
        .play-pause:hover {
          transform: scale(1.05);
        }
        .play-pause:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}
