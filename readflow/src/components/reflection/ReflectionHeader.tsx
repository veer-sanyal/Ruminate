"use client";

import { Sparkles, ICON_DEFAULTS } from "@/lib/icons";

interface ReflectionHeaderProps {
  chapterTitle: string;
  summary: string;
}

export default function ReflectionHeader({
  chapterTitle,
  summary,
}: ReflectionHeaderProps) {
  return (
    <>
      <div className="reflection-header">
        <div className="icon-row">
          <Sparkles {...ICON_DEFAULTS} />
          <span className="label">Reflection Sprint</span>
        </div>
        <h1 className="chapter-title">{chapterTitle}</h1>
        <p className="summary">{summary}</p>
      </div>

      <style jsx>{`
        .reflection-header {
          margin-bottom: 32px;
        }
        .icon-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .chapter-title {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 12px;
        }
        .summary {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
      `}</style>
    </>
  );
}
