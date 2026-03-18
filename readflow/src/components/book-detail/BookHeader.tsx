"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { Headphones, ICON_DEFAULTS } from "@/lib/icons";

interface BookHeaderProps {
  book: {
    id: string;
    title: string;
    author?: string | null;
    cover_url?: string | null;
    theme_tags?: string[];
    progress_percent: number;
    estimated_listen_mins?: number;
    total_chapters: number;
    completed_chapters: number;
    chapters?: { id: string; reading_status: string }[];
  };
}

export default function BookHeader({ book }: BookHeaderProps) {
  // Find next unfinished chapter
  const nextChapter = book.chapters?.find(
    (ch) => ch.reading_status !== "completed"
  );

  const timeRemaining = book.estimated_listen_mins
    ? Math.round(
        book.estimated_listen_mins * ((100 - book.progress_percent) / 100)
      )
    : null;

  return (
    <>
      <div className="book-header">
        <div className="cover-col">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="cover" />
          ) : (
            <div className="cover-placeholder">
              <span className="cover-initial">
                {book.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="info-col">
          <h1 className="book-title">{book.title}</h1>
          {book.author && <p className="book-author">{book.author}</p>}

          {book.theme_tags && book.theme_tags.length > 0 && (
            <div className="tag-row">
              {book.theme_tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${book.progress_percent}%` }}
              />
            </div>
            <span className="progress-text">
              {book.progress_percent}% complete
              {timeRemaining ? ` · ~${timeRemaining} min left` : ""}
            </span>
          </div>

          {nextChapter && (
            <Link href={`/read/${book.id}/${nextChapter.id}`}>
              <Button icon={<Headphones {...ICON_DEFAULTS} />}>
                {book.progress_percent > 0
                  ? "Continue Reading"
                  : "Start Reading"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .book-header {
          display: flex;
          gap: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .cover-col {
          flex-shrink: 0;
        }
        .cover {
          width: 180px;
          aspect-ratio: 2 / 3;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .cover-placeholder {
          width: 180px;
          aspect-ratio: 2 / 3;
          border-radius: 10px;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cover-initial {
          font-family: var(--font-display);
          font-size: 48px;
          color: var(--text-tertiary);
        }
        .info-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .book-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .book-author {
          font-size: 16px;
          color: var(--text-secondary);
        }
        .tag-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .tag-pill {
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          background: var(--bg-accent-subtle);
          color: var(--accent);
        }
        .progress-section {
          margin-top: 12px;
        }
        .progress-bar {
          height: 4px;
          border-radius: 2px;
          background: var(--bg-tertiary);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 300ms ease;
        }
        .progress-text {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-top: 6px;
          display: block;
        }

        @media (max-width: 640px) {
          .book-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .tag-row {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
