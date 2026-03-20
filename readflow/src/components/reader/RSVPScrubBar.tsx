"use client";

import { useCallback } from "react";

interface RSVPScrubBarProps {
  currentWord: number;
  totalWords: number;
  onSeek: (wordIndex: number) => void;
}

export default function RSVPScrubBar({
  currentWord,
  totalWords,
  onSeek,
}: RSVPScrubBarProps) {
  const percent = totalWords > 0 ? (currentWord / (totalWords - 1)) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPercent = (e.clientX - rect.left) / rect.width;
      const wordIndex = Math.round(clickPercent * (totalWords - 1));
      onSeek(wordIndex);
    },
    [totalWords, onSeek]
  );

  return (
    <>
      <div className="scrub-bar" onClick={handleClick}>
        <div className="scrub-track">
          <div
            className="scrub-fill"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
          <div
            className="scrub-thumb"
            style={{ left: `${Math.min(100, percent)}%` }}
          />
        </div>
        <div className="scrub-labels">
          <span className="scrub-label">{currentWord}</span>
          <span className="scrub-label">{totalWords} words</span>
        </div>
      </div>

      <style jsx>{`
        .scrub-bar {
          padding: 8px 16px;
          cursor: pointer;
        }
        .scrub-track {
          position: relative;
          height: 4px;
          border-radius: 2px;
          background: var(--bg-tertiary);
        }
        .scrub-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 100ms linear;
        }
        .scrub-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent);
          transform: translate(-50%, -50%);
          transition: left 100ms linear;
        }
        .scrub-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
        }
        .scrub-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-tertiary);
        }
      `}</style>
    </>
  );
}
