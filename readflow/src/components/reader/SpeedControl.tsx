"use client";

import { useReaderStore } from "@/stores/readerStore";

const PRESETS = [
  { label: "Relaxed", value: 0.75 },
  { label: "Normal", value: 1.0 },
  { label: "Brisk", value: 1.5 },
  { label: "Sprint", value: 2.0 },
];

export default function SpeedControl() {
  const { speed, setSpeed } = useReaderStore();

  return (
    <>
      <div className="speed-control">
        <div className="speed-display">{speed.toFixed(2)}x</div>
        <input
          type="range"
          min="0.75"
          max="2.5"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="speed-slider"
        />
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              className={`preset ${Math.abs(speed - p.value) < 0.01 ? "preset-active" : ""}`}
              onClick={() => setSpeed(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .speed-control {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
        }
        .speed-display {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .speed-slider {
          width: 100%;
          max-width: 280px;
          accent-color: var(--accent);
        }
        .presets {
          display: flex;
          gap: 6px;
        }
        .preset {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 100ms ease;
        }
        .preset:hover {
          background: var(--bg-tertiary);
        }
        .preset-active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}
