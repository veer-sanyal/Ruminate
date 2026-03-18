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
        <div className="empty-icon">
          <Upload size={48} strokeWidth={1} />
        </div>
        <h2 className="empty-title">Your library is empty</h2>
        <p className="empty-desc">
          Upload your first book to get started. We support EPUB and PDF files.
        </p>
        <Button
          onClick={onUpload}
          icon={<Upload {...ICON_DEFAULTS} />}
        >
          Upload a book
        </Button>
      </div>

      <style jsx>{`
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 80px 24px;
        }
        .empty-icon {
          color: var(--text-tertiary);
          margin-bottom: 20px;
        }
        .empty-title {
          font-family: var(--font-display);
          font-size: 22px;
          color: var(--text-primary);
        }
        .empty-desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 8px;
          margin-bottom: 24px;
          max-width: 320px;
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}
