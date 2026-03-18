"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { CoachTone } from "@/types";

const FOCUS_OPTIONS = [
  "Confidence", "Discipline", "Relationships", "Anxiety", "Leadership",
  "Creativity", "Communication", "Focus", "Emotional Regulation", "Self-Awareness",
];

const TONES: { value: CoachTone; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "gentle", label: "Gentle" },
  { value: "analytical", label: "Analytical" },
];

interface PersonalizationSectionProps {
  focusAreas: string[];
  coachTone: CoachTone;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export default function PersonalizationSection({
  focusAreas: initialAreas,
  coachTone: initialTone,
  onSave,
}: PersonalizationSectionProps) {
  const [areas, setAreas] = useState(initialAreas);
  const [tone, setTone] = useState(initialTone);
  const [saving, setSaving] = useState(false);

  function toggleArea(area: string) {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ focus_areas: areas, coach_tone: tone });
    setSaving(false);
  }

  return (
    <>
      <section className="settings-section">
        <h2 className="section-title">Personalization</h2>

        <div className="subsection">
          <label className="field-label">Focus areas</label>
          <div className="chip-grid">
            {FOCUS_OPTIONS.map((area) => (
              <button
                key={area}
                type="button"
                className={`chip ${areas.includes(area) ? "chip-active" : ""}`}
                onClick={() => toggleArea(area)}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="subsection">
          <label className="field-label">Coaching style</label>
          <div className="tone-row">
            {TONES.map((t) => (
              <button
                key={t.value}
                className={`tone-btn ${tone === t.value ? "tone-active" : ""}`}
                onClick={() => setTone(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Button size="sm" onClick={handleSave} loading={saving}>
          Save
        </Button>
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
        .subsection {
          margin-bottom: 20px;
        }
        .field-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          padding: 6px 14px;
          border-radius: 18px;
          font-size: 13px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          color: var(--text-primary);
          cursor: pointer;
        }
        .chip-active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .tone-row {
          display: flex;
          gap: 8px;
        }
        .tone-btn {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-default);
          color: var(--text-primary);
          cursor: pointer;
        }
        .tone-active {
          border-color: var(--accent);
          background: var(--bg-accent-subtle);
        }
      `}</style>
    </>
  );
}
