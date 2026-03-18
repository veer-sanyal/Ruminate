"use client";

import { useState } from "react";

const FOCUS_OPTIONS = [
  "Confidence",
  "Discipline",
  "Relationships",
  "Anxiety",
  "Leadership",
  "Creativity",
  "Communication",
  "Focus",
  "Emotional Regulation",
  "Self-Awareness",
];

interface FocusAreasStepProps {
  value: string[];
  onChange: (areas: string[]) => void;
}

export default function FocusAreasStep({
  value,
  onChange,
}: FocusAreasStepProps) {
  const [customInput, setCustomInput] = useState("");

  function toggle(area: string) {
    if (value.includes(area)) {
      onChange(value.filter((a) => a !== area));
    } else {
      onChange([...value, area]);
    }
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomInput("");
    }
  }

  return (
    <>
      <div className="focus-step">
        <h2 className="step-title">What do you want to grow in?</h2>
        <p className="step-desc">
          Choose 3-5 areas. This helps us personalize your reflections and
          journal prompts.
        </p>

        <div className="chip-grid">
          {FOCUS_OPTIONS.map((area) => (
            <button
              key={area}
              type="button"
              className={`chip ${value.includes(area) ? "chip-active" : ""}`}
              onClick={() => toggle(area)}
            >
              {area}
            </button>
          ))}
          {value
            .filter((a) => !FOCUS_OPTIONS.includes(a))
            .map((custom) => (
              <button
                key={custom}
                type="button"
                className="chip chip-active"
                onClick={() => toggle(custom)}
              >
                {custom}
              </button>
            ))}
        </div>

        <div className="custom-row">
          <input
            type="text"
            placeholder="Add your own..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            className="custom-input"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="custom-add"
          >
            Add
          </button>
        </div>

        <p className="count-hint">
          {value.length} selected{" "}
          {value.length < 3 ? `(pick at least ${3 - value.length} more)` : ""}
        </p>
      </div>

      <style jsx>{`
        .focus-step {
          display: flex;
          flex-direction: column;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--text-primary);
        }
        .step-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 8px;
          line-height: 1.5;
        }
        .chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }
        .chip {
          padding: 8px 16px;
          border-radius: 20px;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 500;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-default);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .chip:hover {
          background: var(--bg-tertiary);
        }
        .chip-active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .chip-active:hover {
          opacity: 0.9;
          background: var(--accent);
        }
        .custom-row {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .custom-input {
          flex: 1;
          height: 40px;
          padding: 0 12px;
          font-family: var(--font-sans);
          font-size: 14px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-primary);
          outline: none;
        }
        .custom-input:focus {
          border-color: var(--accent);
        }
        .custom-add {
          padding: 0 16px;
          height: 40px;
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          border: 1px solid var(--border-default);
          cursor: pointer;
        }
        .custom-add:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .count-hint {
          margin-top: 12px;
          font-size: 13px;
          color: var(--text-tertiary);
        }
      `}</style>
    </>
  );
}
