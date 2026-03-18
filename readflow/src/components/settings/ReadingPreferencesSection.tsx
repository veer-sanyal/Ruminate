"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const VOICES = [
  { id: "alloy", label: "Alloy" },
  { id: "echo", label: "Echo" },
  { id: "nova", label: "Nova" },
  { id: "shimmer", label: "Shimmer" },
];

interface ReadingPreferencesSectionProps {
  narrationSpeed: number;
  preferredVoice: string;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export default function ReadingPreferencesSection({
  narrationSpeed,
  preferredVoice,
  onSave,
}: ReadingPreferencesSectionProps) {
  const [speed, setSpeed] = useState(narrationSpeed);
  const [voice, setVoice] = useState(preferredVoice);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ narration_speed: speed, preferred_voice: voice });
    setSaving(false);
  }

  return (
    <>
      <section className="settings-section">
        <h2 className="section-title">Reading Preferences</h2>
        <div className="fields">
          <div className="field">
            <label className="field-label">Narration speed</label>
            <input
              type="range"
              min="0.75"
              max="2.5"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="slider"
            />
            <span className="speed-val">{speed.toFixed(2)}x</span>
          </div>
          <div className="field">
            <label className="field-label">Preferred voice</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="select"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </div>
      </section>

      <style jsx>{`
        .settings-section {
          padding: 24px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 360px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .slider {
          accent-color: var(--accent);
        }
        .speed-val {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-secondary);
        }
        .select {
          height: 40px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
