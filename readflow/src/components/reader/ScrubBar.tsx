"use client";

import { useReaderStore } from "@/stores/readerStore";
import { formatDuration } from "@/lib/utils/audio-utils";

interface ScrubBarProps {
  duration: number; // total ms
  onSeek: (ms: number) => void;
}

export default function ScrubBar({ duration, onSeek }: ScrubBarProps) {
  const playbackPosition = useReaderStore((s) => s.playbackPosition);
  const progress = duration > 0 ? (playbackPosition / duration) * 100 : 0;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  }

  return (
    <>
      <div className="scrub-bar">
        <span className="time">{formatDuration(playbackPosition)}</span>
        <div className="track" onClick={handleClick}>
          <div className="fill" style={{ width: `${progress}%` }} />
          <div className="thumb" style={{ left: `${progress}%` }} />
        </div>
        <span className="time">{formatDuration(duration)}</span>
      </div>

      <style jsx>{`
        .scrub-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0 16px;
        }
        .time {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-tertiary);
          min-width: 42px;
        }
        .time:last-child {
          text-align: right;
        }
        .track {
          flex: 1;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          position: relative;
          cursor: pointer;
        }
        .fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          position: absolute;
          top: 0;
          left: 0;
        }
        .thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 6px;
          background: var(--accent);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}
