"use client";

import Button from "@/components/ui/Button";
import { Upload, ICON_DEFAULTS } from "@/lib/icons";

interface EmptyLibraryProps {
  onUpload: () => void;
}

export default function EmptyLibrary({ onUpload }: EmptyLibraryProps) {
  return (
    <>
      <div className="empty">
        {/* A stack of book spines — evocative of an empty shelf waiting to be filled */}
        <div className="book-stack" aria-hidden="true">
          <div className="spine spine-1" />
          <div className="spine spine-2" />
          <div className="spine spine-3" />
        </div>
        <h2 className="empty-title">Your reading nook awaits</h2>
        <p className="empty-desc">
          Add your first book to begin. Drop in an EPUB or PDF and
          we&apos;ll have it ready for you in moments.
        </p>
        <Button
          onClick={onUpload}
          icon={<Upload {...ICON_DEFAULTS} />}
        >
          Add a book
        </Button>
      </div>

      <style jsx>{`
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 72px 24px 48px;
        }
        .book-stack {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          margin-bottom: 28px;
        }
        .spine {
          border-radius: 2px;
        }
        .spine-1 {
          width: 14px;
          height: 64px;
          background: var(--bg-tertiary);
        }
        .spine-2 {
          width: 18px;
          height: 80px;
          background: var(--accent);
          opacity: 0.25;
        }
        .spine-3 {
          width: 12px;
          height: 56px;
          background: var(--bg-tertiary);
        }
        .empty-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .empty-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 8px;
          margin-bottom: 28px;
          max-width: 340px;
          line-height: 1.55;
        }
      `}</style>
    </>
  );
}
