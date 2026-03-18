"use client";

import Link from "next/link";
import type { Book } from "@/types";
import ProcessingBadge from "./ProcessingBadge";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const isProcessing = book.processing_status !== "ready";

  return (
    <>
      <Link href={`/library/${book.id}`} className="book-card-link">
        <div className="book-card">
          <div className="cover-wrapper">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="cover" />
            ) : (
              <div className="cover-placeholder">
                <span className="cover-initial">
                  {book.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {isProcessing && (
              <div className="badge-overlay">
                <ProcessingBadge status={book.processing_status} />
              </div>
            )}
          </div>
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
          transition: transform 150ms ease;
          cursor: pointer;
        }
        .book-card:hover {
          transform: translateY(-2px);
        }
        .cover-wrapper {
          position: relative;
          aspect-ratio: 2 / 3;
          max-width: 160px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-secondary);
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
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
        }
        .cover-initial {
          font-family: var(--font-display);
          font-size: 36px;
          color: var(--text-tertiary);
        }
        .badge-overlay {
          position: absolute;
          bottom: 8px;
          left: 8px;
        }
        .card-info {
          max-width: 160px;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-author {
          font-size: 13px;
          color: var(--text-secondary);
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
          background: var(--bg-accent-subtle);
          color: var(--accent);
        }
      `}</style>
    </>
  );
}
