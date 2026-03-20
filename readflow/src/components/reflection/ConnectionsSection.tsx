"use client";

import ConnectionChip from "./ConnectionChip";
import type { ReflectionConnection } from "@/types";

interface ConnectionsSectionProps {
  bookId: string;
  connections: ReflectionConnection[];
}

export default function ConnectionsSection({
  bookId,
  connections,
}: ConnectionsSectionProps) {
  return (
    <>
      <div className="connections-section">
        <div className="section-label-row">
          <span className="section-label">Related Chapters</span>
          <div className="label-line" />
        </div>
        {connections.length > 0 ? (
          <div className="connections-scroll">
            {connections.map((conn) => (
              <ConnectionChip
                key={conn.chapter_id}
                bookId={bookId}
                chapterId={conn.chapter_id}
                chapterTitle={conn.chapter_title}
                similarity={conn.similarity}
                sharedThemes={conn.shared_themes}
              />
            ))}
          </div>
        ) : (
          <p className="empty-hint">Connections will appear once the chapter is analyzed.</p>
        )}
      </div>

      <style jsx>{`
        .connections-section {
          margin-bottom: 20px;
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
        .connections-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .connections-scroll::-webkit-scrollbar {
          display: none;
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
