"use client";

import { useReaderStore, type ReaderMode } from "@/stores/readerStore";
import { Headphones, Eye, ICON_COMPACT } from "@/lib/icons";

export default function ModeToggle() {
  const mode = useReaderStore((s) => s.mode);
  const setMode = useReaderStore((s) => s.setMode);
  const pause = useReaderStore((s) => s.pause);

  const handleToggle = (newMode: ReaderMode) => {
    if (newMode === mode) return;
    pause(); // Pause when switching modes
    setMode(newMode);
  };

  return (
    <>
      <div className="mode-toggle">
        <button
          className={`toggle-btn ${mode === "narration" ? "active" : ""}`}
          onClick={() => handleToggle("narration")}
        >
          <Headphones {...ICON_COMPACT} />
          Narration
        </button>
        <button
          className={`toggle-btn ${mode === "rsvp" ? "active" : ""}`}
          onClick={() => handleToggle("rsvp")}
        >
          <Eye {...ICON_COMPACT} />
          RSVP
        </button>
      </div>

      <style jsx>{`
        .mode-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 10px;
          padding: 3px;
          border: 1px solid var(--border-subtle);
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 14px;
          border-radius: 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-tertiary);
          transition: all 150ms ease;
          white-space: nowrap;
        }
        .toggle-btn:hover {
          color: var(--text-secondary);
        }
        .toggle-btn.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </>
  );
}
