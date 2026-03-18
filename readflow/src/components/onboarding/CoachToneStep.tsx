"use client";

import type { CoachTone } from "@/types";

const TONES: {
  value: CoachTone;
  label: string;
  description: string;
  sample: string;
}[] = [
  {
    value: "direct",
    label: "Direct",
    description: "Straight talk, no sugar-coating. Challenges you to act.",
    sample:
      '"You said discipline matters to you, but you\'ve skipped journaling three days in a row. What\'s actually getting in the way?"',
  },
  {
    value: "gentle",
    label: "Gentle",
    description: "Warm and encouraging. Meets you where you are.",
    sample:
      '"It sounds like this week has been tough. What\'s one small thing from your reading that felt true to you?"',
  },
  {
    value: "analytical",
    label: "Analytical",
    description: "Pattern-focused. Helps you see connections and trends.",
    sample:
      '"Interesting — you\'ve flagged \'vulnerability\' in three different chapters now. What do you think connects those moments?"',
  },
];

interface CoachToneStepProps {
  value: CoachTone;
  onChange: (tone: CoachTone) => void;
}

export default function CoachToneStep({ value, onChange }: CoachToneStepProps) {
  return (
    <>
      <div className="tone-step">
        <h2 className="step-title">Pick your coaching style</h2>
        <p className="step-desc">
          This sets the tone for reflections and journal prompts. You can change
          it anytime.
        </p>

        <div className="tone-cards">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              type="button"
              className={`tone-card ${value === tone.value ? "tone-active" : ""}`}
              onClick={() => onChange(tone.value)}
            >
              <span className="tone-label">{tone.label}</span>
              <span className="tone-description">{tone.description}</span>
              <span className="tone-sample">{tone.sample}</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tone-step {
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
        }
        .tone-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
        .tone-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 16px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-default);
          cursor: pointer;
          text-align: left;
          transition: all 150ms ease;
        }
        .tone-card:hover {
          border-color: var(--border-hover);
        }
        .tone-active {
          border-color: var(--accent);
          background: var(--bg-accent-subtle);
        }
        .tone-label {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .tone-description {
          font-size: 14px;
          color: var(--text-secondary);
        }
        .tone-sample {
          font-size: 13px;
          color: var(--text-tertiary);
          font-style: italic;
          line-height: 1.5;
          margin-top: 4px;
        }
      `}</style>
    </>
  );
}
