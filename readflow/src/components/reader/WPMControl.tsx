"use client";

import { WPM_PRESETS } from "@/lib/utils/rsvp-utils";

interface WPMControlProps {
  wpm: number;
  onWpmChange: (wpm: number) => void;
}

export default function WPMControl({ wpm, onWpmChange }: WPMControlProps) {
  return (
    <>
      <div className="wpm-control">
        <span className="wpm-display">{wpm} WPM</span>
        <div className="wpm-presets">
          {WPM_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`preset-btn ${wpm === preset.wpm ? "active" : ""}`}
              onClick={() => onWpmChange(preset.wpm)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .wpm-control {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }
        .wpm-display {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
          min-width: 70px;
        }
        .wpm-presets {
          display: flex;
          gap: 4px;
        }
        .preset-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .preset-btn:hover {
          border-color: var(--accent);
        }
        .preset-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}
