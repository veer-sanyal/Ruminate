"use client";

import { useState, useMemo } from "react";
import { useBooks } from "@/hooks/useBooks";
import BookCard from "@/components/library/BookCard";
import EmptyLibrary from "@/components/library/EmptyLibrary";
import UploadModal from "@/components/library/UploadModal";
import { BookCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { Upload, Search, ICON_DEFAULTS } from "@/lib/icons";

type Tab = "reading" | "finished";

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("reading");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const status = tab === "reading" ? "reading" : "finished";
  const { data: books, isLoading } = useBooks({ status });

  const filtered = useMemo(() => {
    if (!books || !search.trim()) return books ?? [];
    const q = search.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [books, search]);

  // The most recently-read book gets hero treatment
  const heroBook = tab === "reading" && !search && filtered.length > 0 ? filtered[0] : null;
  const shelfBooks = heroBook ? filtered.slice(1) : filtered;

  return (
    <>
      <div className="library">
        {/* Header */}
        <div className="library-header">
          <div className="header-text">
            <h1 className="library-title">Library</h1>
            <p className="library-subtitle">
              {tab === "reading"
                ? `${filtered.length} book${filtered.length !== 1 ? "s" : ""} in progress`
                : `${filtered.length} book${filtered.length !== 1 ? "s" : ""} finished`}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Upload {...ICON_DEFAULTS} />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        </div>

        {/* Tabs + Search row */}
        <div className="controls-row">
          <div className="tabs">
            <button
              className={`tab ${tab === "reading" ? "tab-active" : ""}`}
              onClick={() => setTab("reading")}
            >
              Reading
            </button>
            <button
              className={`tab ${tab === "finished" ? "tab-active" : ""}`}
              onClick={() => setTab("finished")}
            >
              Finished
            </button>
          </div>

          <div className="search-row">
            <Search size={15} strokeWidth={1.5} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="shelf-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 && !search ? (
          <EmptyLibrary onUpload={() => setUploadOpen(true)} />
        ) : filtered.length === 0 ? (
          <p className="no-results">No books match &ldquo;{search}&rdquo;</p>
        ) : (
          <>
            {/* Hero: currently reading */}
            {heroBook && (
              <div className="hero-section">
                <p className="hero-label">Continue reading</p>
                <BookCard book={heroBook} variant="hero" />
              </div>
            )}

            {/* Shelf */}
            {shelfBooks.length > 0 && (
              <>
                {heroBook && <p className="shelf-label">Your shelf</p>}
                <div className="shelf-grid">
                  {shelfBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <style jsx>{`
        .library {
          display: flex;
          flex-direction: column;
        }
        .library-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .header-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .library-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .library-subtitle {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        /* Controls row: tabs left, search right */
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
          gap: 16px;
        }
        .tabs {
          display: flex;
          gap: 0;
        }
        .tab {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-tertiary);
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 1.5px solid transparent;
          transition: color 150ms ease;
        }
        .tab:hover {
          color: var(--text-primary);
        }
        .tab-active {
          color: var(--text-primary);
          border-bottom-color: var(--accent);
        }

        .search-row {
          position: relative;
        }
        .search-row :global(.search-icon) {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }
        .search-input {
          width: 180px;
          height: 34px;
          padding: 0 10px 0 32px;
          font-size: 13px;
          font-family: var(--font-sans);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          outline: none;
          transition: border-color 150ms ease, width 200ms ease;
        }
        .search-input:focus {
          border-color: var(--accent);
          width: 240px;
        }
        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        /* Hero section */
        .hero-section {
          margin-top: 28px;
        }
        .hero-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-bottom: 12px;
        }

        /* Shelf */
        .shelf-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-top: 36px;
          margin-bottom: 12px;
        }
        .shelf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        .hero-section + .shelf-label {
          /* no extra margin needed, hero-section already has it */
        }
        .shelf-label + .shelf-grid {
          margin-top: 0;
        }

        .no-results {
          margin-top: 48px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* Mobile */
        @media (max-width: 767px) {
          .controls-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .search-input {
            width: 100%;
          }
          .search-input:focus {
            width: 100%;
          }
          .shelf-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
