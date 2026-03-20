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
  if (!prompts.length) return null;

  return (
    <>
      <div className="prompts-section">
        <h3 className="section-title">Reflect</h3>
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
      </div>

      <style jsx>{`
        .prompts-section {
          margin-bottom: 28px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 17px;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .prompts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </>
  );
}
