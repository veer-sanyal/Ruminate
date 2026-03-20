"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ICON_COMPACT } from "@/lib/icons";

interface PromptCardProps {
  depth: "surface" | "analytical" | "personal";
  prompt: string;
  response: string;
  onResponseChange: (value: string) => void;
  onSave: () => void;
  index: number;
}

const DEPTH_LABELS: Record<string, { label: string; opacity: number }> = {
  surface: { label: "Comprehension", opacity: 0.6 },
  analytical: { label: "Analysis", opacity: 0.85 },
  personal: { label: "Personal", opacity: 1 },
};

export default function PromptCard({
  depth,
  prompt,
  response,
  onResponseChange,
  onSave,
  index,
}: PromptCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const config = DEPTH_LABELS[depth] ?? DEPTH_LABELS.surface!;

  return (
    <>
      <div
        className="prompt-card"
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <button className="prompt-header" onClick={() => setExpanded(!expanded)}>
          <div className="prompt-left">
            <span className="depth-tag" style={{ opacity: config.opacity }}>
              {config.label}
            </span>
            <span className="prompt-text">{prompt}</span>
          </div>
          {expanded ? (
            <ChevronUp {...ICON_COMPACT} />
          ) : (
            <ChevronDown {...ICON_COMPACT} />
          )}
        </button>

        {expanded && (
          <div className="prompt-body">
            <textarea
              className="response-textarea"
              placeholder="Write your response..."
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              onBlur={onSave}
              rows={3}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .prompt-card {
          border: 1px solid var(--border-default);
          border-radius: 12px;
          overflow: hidden;
          animation: slide-up 300ms ease forwards;
          opacity: 0;
        }
        .prompt-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          color: var(--text-secondary);
        }
        .prompt-header:hover {
          background: var(--bg-secondary);
        }
        .prompt-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .depth-tag {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
        }
        .prompt-text {
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.5;
        }
        .prompt-body {
          padding: 0 16px 14px;
        }
        .response-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          font-family: inherit;
        }
        .response-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .response-textarea::placeholder {
          color: var(--text-tertiary);
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
