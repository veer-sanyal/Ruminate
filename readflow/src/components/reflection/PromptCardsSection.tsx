"use client";

import PromptCard from "./PromptCard";
import type { ReflectionPrompt } from "@/types";

interface PromptCardsSectionProps {
  prompts: ReflectionPrompt[];
  responses: string[];
  onResponseChange: (index: number, value: string) => void;
  onSave: () => void;
}

export default function PromptCardsSection({
  prompts,
  responses,
  onResponseChange,
  onSave,
}: PromptCardsSectionProps) {
  return (
    <>
      <div className="prompts-section">
        <div className="section-label-row">
          <span className="section-label">Reflect</span>
          <div className="label-line" />
        </div>
        {prompts.length > 0 ? (
          <div className="prompts-list">
            {prompts.map((p, i) => (
              <PromptCard
                key={i}
                depth={p.depth}
                prompt={p.prompt}
                response={responses[i] ?? ""}
                onResponseChange={(val) => onResponseChange(i, val)}
                onSave={onSave}
                index={i}
              />
            ))}
          </div>
        ) : (
          <p className="empty-hint">Reflection prompts will appear once the chapter is analyzed.</p>
        )}
      </div>

      <style jsx>{`
        .prompts-section {
          margin-bottom: 36px;
        }
        .section-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .section-label {
          font-family: var(--font-display);
          font-size: 19px;
          font-style: italic;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .label-line {
          flex: 1;
          height: 1px;
          background: var(--border-default);
        }
        .prompts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .empty-hint {
          font-size: 14px;
          font-style: italic;
          color: var(--text-tertiary);
          padding: 16px 0;
        }
      `}</style>
    </>
  );
}
