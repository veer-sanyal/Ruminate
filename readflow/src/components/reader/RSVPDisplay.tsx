"use client";

import { findORP } from "@/lib/utils/rsvp-utils";

interface RSVPDisplayProps {
  word: string;
}

export default function RSVPDisplay({ word }: RSVPDisplayProps) {
  if (!word) {
    return (
      <div className="rsvp-display">
        <span className="rsvp-placeholder">Ready</span>
        <style jsx>{`
          .rsvp-display {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 120px;
          }
          .rsvp-placeholder {
            font-size: 24px;
            color: var(--text-tertiary);
          }
        `}</style>
      </div>
    );
  }

  const orpIndex = findORP(word);
  const before = word.slice(0, orpIndex);
  const orp = word[orpIndex] ?? "";
  const after = word.slice(orpIndex + 1);

  return (
    <>
      <div className="rsvp-display">
        <div className="rsvp-word-container">
          {/* ORP guide line — anchored to center where ORP char sits */}
          <div className="orp-guide" />
          <div className="rsvp-word">
            <span className="before">{before}</span>
            <span className="orp-char">{orp}</span>
            <span className="after">{after}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rsvp-display {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 120px;
          padding: 20px;
          user-select: none;
        }
        .rsvp-word-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .orp-guide {
          position: absolute;
          top: -4px;
          width: 2px;
          height: calc(100% + 8px);
          background: var(--accent);
          opacity: 0.3;
          left: 50%;
          transform: translateX(-50%);
        }
        .rsvp-word {
          font-family: var(--font-reader);
          font-size: 42px;
          font-weight: 400;
          letter-spacing: 0.02em;
          white-space: nowrap;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: baseline;
        }
        .before {
          color: var(--text-primary);
          text-align: right;
        }
        .orp-char {
          color: var(--accent);
          font-weight: 700;
          text-align: center;
        }
        .after {
          color: var(--text-primary);
          text-align: left;
        }
      `}</style>
    </>
  );
}
