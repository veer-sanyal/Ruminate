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
  if (!connections.length) return null;

  return (
    <>
      <div className="connections-section">
        <h3 className="section-title">Related Chapters</h3>
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
      </div>

      <style jsx>{`
        .connections-section {
          margin-bottom: 28px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 17px;
          color: var(--text-primary);
          margin-bottom: 12px;
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
      `}</style>
    </>
  );
}
