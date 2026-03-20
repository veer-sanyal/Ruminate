"use client";

import Link from "next/link";
import { Check, Headphones, Sparkles, ICON_COMPACT } from "@/lib/icons";

interface Chapter {
  id: string;
  title: string | null;
  sort_order: number;
  word_count: number;
  reading_status: string;
  audio_url?: string | null;
  has_reflection?: boolean;
}

interface ChapterListProps {
  bookId: string;
  chapters: Chapter[];
}

export default function ChapterList({ bookId, chapters }: ChapterListProps) {
  return (
    <>
      <div className="chapter-list">
        <h2 className="section-title">Chapters</h2>
        <div className="chapters">
          {chapters.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/read/${bookId}/${ch.id}`}
              className="chapter-row"
            >
              <span className="ch-number">{i + 1}</span>
              <div className="ch-info">
                <span className="ch-title">
                  {ch.title ?? `Chapter ${i + 1}`}
                </span>
                <span className="ch-meta">
                  {ch.word_count.toLocaleString()} words
                  {ch.audio_url ? " · Audio ready" : ""}
                </span>
              </div>
              <span className="ch-status">
                {ch.has_reflection && (
                  <Sparkles
                    {...ICON_COMPACT}
                    style={{ color: "var(--accent)", marginRight: "4px" }}
                  />
                )}
                {ch.reading_status === "completed" ? (
                  <Check {...ICON_COMPACT} style={{ color: "var(--success)" }} />
                ) : ch.reading_status === "in_progress" ? (
                  <Headphones
                    {...ICON_COMPACT}
                    style={{ color: "var(--accent)" }}
                  />
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .chapter-list {
          margin-top: 32px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .chapters {
          display: flex;
          flex-direction: column;
        }
        :global(.chapter-row) {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: background 100ms ease;
        }
        :global(.chapter-row):hover {
          background: var(--bg-secondary);
        }
        .ch-number {
          width: 28px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }
        .ch-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .ch-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ch-meta {
          font-size: 12px;
          color: var(--text-tertiary);
        }
        .ch-status {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
