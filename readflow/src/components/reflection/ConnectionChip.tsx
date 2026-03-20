"use client";

import Link from "next/link";
import { Link2, ICON_COMPACT } from "@/lib/icons";

interface ConnectionChipProps {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  similarity: number;
  sharedThemes: string[];
}

export default function ConnectionChip({
  bookId,
  chapterId,
  chapterTitle,
  similarity,
  sharedThemes,
}: ConnectionChipProps) {
  return (
    <>
      <Link
        href={`/reflect/${bookId}/${chapterId}`}
        className="connection-chip"
      >
        <Link2 {...ICON_COMPACT} />
        <span className="chip-title">{chapterTitle}</span>
        {sharedThemes.length > 0 && (
          <span className="chip-theme">{sharedThemes[0]}</span>
        )}
      </Link>

      <style jsx>{`
        :global(.connection-chip) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--bg-secondary);
          text-decoration: none;
          color: var(--text-primary);
          font-size: 13px;
          white-space: nowrap;
          transition: all 150ms ease;
          flex-shrink: 0;
        }
        :global(.connection-chip):hover {
          border-color: var(--accent);
          background: var(--bg-accent-subtle, var(--bg-tertiary));
        }
        .chip-title {
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chip-theme {
          font-size: 11px;
          color: var(--text-tertiary);
          padding: 1px 6px;
          background: var(--bg-tertiary);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}
