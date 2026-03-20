"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { MessageCircleQuestion, ICON_COMPACT } from "@/lib/icons";

interface ClarificationItem {
  passage: string;
  clarification: string;
}

interface ConfusionClarificationsProps {
  clarifications: ClarificationItem[];
  chapterId: string;
  onAddClarification: (item: ClarificationItem) => void;
}

export default function ConfusionClarifications({
  clarifications,
  chapterId,
  onAddClarification,
}: ConfusionClarificationsProps) {
  const [passage, setPassage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClarify = async () => {
    if (!passage.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reflections/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage: passage.trim(), chapter_id: chapterId }),
      });
      if (res.ok) {
        const data = await res.json();
        onAddClarification(data);
        setPassage("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="clarification-section">
        <h3 className="section-title">
          <MessageCircleQuestion {...ICON_COMPACT} />
          Confused about something?
        </h3>

        <div className="input-row">
          <input
            className="passage-input"
            placeholder="Paste or type the confusing passage..."
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClarify()}
          />
          <Button
            size="sm"
            onClick={handleClarify}
            loading={loading}
            disabled={!passage.trim()}
          >
            Clarify
          </Button>
        </div>

        {clarifications.length > 0 && (
          <div className="clarifications-list">
            {clarifications.map((c, i) => (
              <div key={i} className="clarification-item">
                <p className="c-passage">&ldquo;{c.passage}&rdquo;</p>
                <p className="c-explanation">{c.clarification}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .clarification-section {
          margin-bottom: 20px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .passage-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .passage-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .passage-input::placeholder {
          color: var(--text-tertiary);
        }
        .clarifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .clarification-item {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
        }
        .c-passage {
          font-size: 13px;
          color: var(--text-tertiary);
          font-style: italic;
          margin-bottom: 8px;
        }
        .c-explanation {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
