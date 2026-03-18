"use client";

import Link from "next/link";
import type { Book } from "@/types";
import ProcessingBadge from "./ProcessingBadge";

interface BookCardProps {
  book: Book;
  variant?: "default" | "hero";
}

/**
 * Estimate reading progress from chapter data.
 * In a real implementation this would come from the API.
 * For now, we derive it from processing_status as a proxy.
 */
function getProgressPercent(book: Book): number {
  // If there's a finished_at, it's done
  if (book.finished_at) return 100;
  // Placeholder: no real progress data on the Book type yet
  return 0;
}

export default function BookCard({ book, variant = "default" }: BookCardProps) {
  const isProcessing = book.processing_status !== "ready";
  const progress = getProgressPercent(book);
  const isHero = variant === "hero";

  const coverEl = (
    <div className={`cover-wrapper ${isHero ? "cover-hero" : "cover-shelf"}`}>
      {/* Spine progress indicator */}
      {progress > 0 && (
        <div
          className="spine-progress"
          style={{ height: `${progress}%` }}
          aria-label={`${progress}% complete`}
        />
      )}
      {book.cover_url ? (
        <img src={book.cover_url} alt={book.title} className="cover" />
      ) : (
        <div className="cover-placeholder">
          <span className="cover-title">{book.title}</span>
          {book.author && <span className="cover-author">{book.author}</span>}
        </div>
      )}
      {isProcessing && (
        <div className="badge-overlay">
          <ProcessingBadge status={book.processing_status} />
        </div>
      )}
    </div>
  );

  if (isHero) {
    return (
      <>
        <Link href={`/library/${book.id}`} className="hero-link">
          <div className="hero-card">
            {coverEl}
            <div className="hero-info">
              <h2 className="hero-title">{book.title}</h2>
              {book.author && <p className="hero-author">{book.author}</p>}
              {book.ai_summary && (
                <p className="hero-summary">{book.ai_summary}</p>
              )}
              {book.theme_tags && book.theme_tags.length > 0 && (
                <div className="tag-row">
                  {book.theme_tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {book.estimated_listen_mins > 0 && (
                <p className="hero-meta">
                  ~{book.estimated_listen_mins} min listen
                </p>
              )}
            </div>
          </div>
        </Link>

        <style jsx>{`
          :global(.hero-link) {
            text-decoration: none;
            color: inherit;
          }
          .hero-card {
            display: flex;
            gap: 24px;
            padding: 20px;
            border: 1px solid var(--border-default);
            border-radius: 12px;
            transition: border-color 150ms ease;
            cursor: pointer;
          }
          .hero-card:hover {
            border-color: var(--border-subtle);
          }
          .cover-wrapper {
            position: relative;
            flex-shrink: 0;
            border-radius: 4px;
            overflow: hidden;
          }
          .cover-hero {
            width: 120px;
            height: 180px;
          }
          .cover {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .cover-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            gap: 4px;
            background: linear-gradient(
              145deg,
              var(--bg-tertiary) 0%,
              var(--bg-secondary) 100%
            );
          }
          .cover-title {
            font-family: var(--font-display);
            font-size: 13px;
            color: var(--text-secondary);
            text-align: center;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .cover-author {
            font-size: 10px;
            color: var(--text-tertiary);
            text-align: center;
          }
          .spine-progress {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 3px;
            background: var(--accent);
            opacity: 0.7;
            border-radius: 0 2px 0 0;
            z-index: 2;
            transition: height 300ms ease;
          }
          .badge-overlay {
            position: absolute;
            bottom: 8px;
            left: 8px;
          }

          .hero-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
          }
          .hero-title {
            font-family: var(--font-display);
            font-size: 22px;
            color: var(--text-primary);
            line-height: 1.25;
            letter-spacing: -0.01em;
          }
          .hero-author {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
          }
          .hero-summary {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-top: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .tag-row {
            display: flex;
            gap: 6px;
            margin-top: 12px;
            flex-wrap: wrap;
          }
          .tag-pill {
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 500;
            background: var(--accent-subtle);
            color: var(--accent-text);
          }
          .hero-meta {
            font-size: 12px;
            color: var(--text-tertiary);
            margin-top: 8px;
            font-variant-numeric: tabular-nums;
          }

          @media (max-width: 767px) {
            .hero-card {
              gap: 16px;
              padding: 16px;
            }
            .cover-hero {
              width: 96px;
              height: 144px;
            }
            .hero-title {
              font-size: 18px;
            }
            .hero-summary {
              display: none;
            }
          }
        `}</style>
      </>
    );
  }

  // Default shelf card
  return (
    <>
      <Link href={`/library/${book.id}`} className="book-card-link">
        <div className="book-card">
          {coverEl}
          <div className="card-info">
            <h3 className="card-title">{book.title}</h3>
            {book.author && <p className="card-author">{book.author}</p>}
            {book.theme_tags && book.theme_tags.length > 0 && (
              <div className="tag-row">
                {book.theme_tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      <style jsx>{`
        :global(.book-card-link) {
          text-decoration: none;
          color: inherit;
        }
        .book-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: pointer;
        }
        .book-card:hover .cover-wrapper {
          transform: translateY(-2px);
        }
        .cover-wrapper {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          transition: transform 200ms ease;
        }
        .cover-shelf {
          aspect-ratio: 2 / 3;
          width: 100%;
        }
        .cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px;
          gap: 4px;
          background: linear-gradient(
            145deg,
            var(--bg-tertiary) 0%,
            var(--bg-secondary) 100%
          );
        }
        .cover-title {
          font-family: var(--font-display);
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cover-author {
          font-size: 10px;
          color: var(--text-tertiary);
          text-align: center;
        }
        .spine-progress {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 3px;
          background: var(--accent);
          opacity: 0.7;
          border-radius: 0 2px 0 0;
          z-index: 2;
          transition: height 300ms ease;
        }
        .badge-overlay {
          position: absolute;
          bottom: 8px;
          left: 8px;
        }
        .card-info {
          min-width: 0;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-author {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
        .tag-row {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .tag-pill {
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          background: var(--accent-subtle);
          color: var(--accent-text);
        }
      `}</style>
    </>
  );
}
