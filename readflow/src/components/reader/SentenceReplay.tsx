"use client";

import { useReaderStore } from "@/stores/readerStore";
import { RotateCcw, ICON_DEFAULTS } from "@/lib/icons";

interface SentenceReplayProps {
  onReplaySentence: () => void;
}

export default function SentenceReplay({ onReplaySentence }: SentenceReplayProps) {
  return (
    <>
      <button
        className="replay-btn"
        onClick={onReplaySentence}
        aria-label="Replay sentence"
        title="Replay current sentence"
      >
        <RotateCcw {...ICON_DEFAULTS} />
      </button>

      <style jsx>{`
        .replay-btn {
          width: 44px;
          height: 44px;
          border-radius: 22px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 100ms ease;
        }
        .replay-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
      `}</style>
    </>
  );
}
