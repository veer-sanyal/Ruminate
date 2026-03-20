"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Eye, ICON_COMPACT } from "@/lib/icons";
import type { RecallQuestion } from "@/types";

interface RecallQuestionsSectionProps {
  questions: RecallQuestion[];
  answers: string[];
  onAnswerChange: (index: number, value: string) => void;
  onSave: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function RecallQuestionsSection({
  questions,
  answers,
  onAnswerChange,
  onSave,
  onGenerate,
  isGenerating,
}: RecallQuestionsSectionProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const toggleReveal = (index: number) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <>
      <div className="recall-section">
        <div className="section-label-row">
          <span className="section-title">Test Your Recall</span>
          <div className="label-line" />
        </div>

        {questions.length === 0 && (
          <div className="empty-state">
            <p className="empty-hint">See how much you remember — generate a quick set of recall questions.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onGenerate}
              loading={isGenerating}
            >
              Generate Questions
            </Button>
          </div>
        )}

        {questions.length > 0 && (
          <div className="questions-list">
            {questions.map((q, i) => (
              <div key={i} className="question-item">
                <p className="question">{q.question}</p>
                <input
                  className="answer-input"
                  placeholder="Your answer..."
                  value={answers[i] ?? ""}
                  onChange={(e) => onAnswerChange(i, e.target.value)}
                  onBlur={onSave}
                />
                <button
                  className="reveal-btn"
                  onClick={() => toggleReveal(i)}
                >
                  <Eye {...ICON_COMPACT} />
                  {revealedAnswers.has(i) ? "Hide" : "Show"} answer
                </button>
                {revealedAnswers.has(i) && (
                  <p className="correct-answer">{q.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .recall-section {
          margin-bottom: 36px;
        }
        .section-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .section-title {
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
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .empty-hint {
          font-size: 14px;
          font-style: italic;
          color: var(--text-tertiary);
        }
        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .question-item {
          padding: 14px 16px;
          border: 1px solid var(--border-default);
          border-radius: 10px;
        }
        .question {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .answer-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .answer-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .answer-input::placeholder {
          color: var(--text-tertiary);
        }
        .reveal-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 8px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-tertiary);
          border-radius: 4px;
        }
        .reveal-btn:hover {
          color: var(--text-secondary);
          background: var(--bg-secondary);
        }
        .correct-answer {
          margin-top: 8px;
          padding: 8px 10px;
          background: var(--bg-accent-subtle, var(--bg-tertiary));
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}
