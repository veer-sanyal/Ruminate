"use client";

import { useState } from "react";
import { useReaderStore } from "@/stores/readerStore";
import { MessageCircleQuestion, ICON_DEFAULTS } from "@/lib/icons";

export default function ConfusionFlag() {
  const { currentWordIndex, confusionFlags, flagConfusion } = useReaderStore();
  const [pulse, setPulse] = useState(false);

  function handleFlag() {
    flagConfusion(currentWordIndex);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }

  return (
    <>
      <button
        className={`confusion-btn ${pulse ? "pulse" : ""}`}
        onClick={handleFlag}
        aria-label="Flag confusion"
        title="I'm confused here"
      >
        <MessageCircleQuestion {...ICON_DEFAULTS} />
        {confusionFlags.length > 0 && (
          <span className="badge">{confusionFlags.length}</span>
        )}
      </button>

      <style jsx>{`
        .confusion-btn {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 40;
          width: 48px;
          height: 48px;
          border-radius: 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 150ms ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .confusion-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        @keyframes pulse-anim {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse-anim 0.6s ease;
        }
      `}</style>
    </>
  );
}
