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

  return (
    <>
      <div className="library">
        <div className="library-header">
          <h1 className="library-title">Your Library</h1>
          <Button
            size="sm"
            icon={<Upload {...ICON_DEFAULTS} />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        </div>

        {/* Tabs */}
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

        {/* Search */}
        <div className="search-row">
          <Search size={16} strokeWidth={1.5} className="search-icon" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 && !search ? (
          <EmptyLibrary onUpload={() => setUploadOpen(true)} />
        ) : filtered.length === 0 ? (
          <p className="no-results">No books match &ldquo;{search}&rdquo;</p>
        ) : (
          <div className="grid">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
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
          align-items: center;
          justify-content: space-between;
        }
        .library-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
        }
        .tabs {
          display: flex;
          gap: 0;
          margin-top: 24px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .tab {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 150ms ease;
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
          margin-top: 20px;
        }
        .search-row :global(.search-icon) {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }
        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px;
          font-size: 14px;
          border: 1px solid var(--border-default);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          outline: none;
        }
        .search-input:focus {
          border-color: var(--accent);
        }
        .search-input::placeholder {
          color: var(--text-tertiary);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 160px));
          gap: 24px;
          margin-top: 24px;
        }
        .skeleton-card {
          aspect-ratio: 2 / 3;
        }
        .no-results {
          margin-top: 40px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
