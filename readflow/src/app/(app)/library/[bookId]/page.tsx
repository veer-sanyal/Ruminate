"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useBook } from "@/hooks/useBook";
import { useQueryClient } from "@tanstack/react-query";
import BookHeader from "@/components/book-detail/BookHeader";
import ChapterList from "@/components/book-detail/ChapterList";
import ChapterEditMode from "@/components/book-detail/ChapterEditMode";
import DeleteBookModal from "@/components/book-detail/DeleteBookModal";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { ArrowLeft, Trash2, ICON_COMPACT } from "@/lib/icons";
import Link from "next/link";

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { data: book, isLoading, error } = useBook(bookId);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Skeleton width="200px" height="24px" />
        <Skeleton height="240px" borderRadius="10px" />
        <Skeleton width="60%" height="16px" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--text-primary)" }}>
          Book not found
        </h2>
        <Link href="/library">
          <Button variant="secondary" style={{ marginTop: "16px" }}>
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="book-detail">
        <div className="top-bar">
          <Link href="/library" className="back-link">
            <ArrowLeft {...ICON_COMPACT} />
            Library
          </Link>
          <div className="top-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Done" : "Edit Chapters"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              icon={<Trash2 {...ICON_COMPACT} />}
            >
              Delete
            </Button>
          </div>
        </div>

        <BookHeader book={book} />

        {editing ? (
          <ChapterEditMode
            bookId={bookId}
            chapters={book.chapters}
            onSave={() => {
              setEditing(false);
              queryClient.invalidateQueries({ queryKey: ["book", bookId] });
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <ChapterList bookId={bookId} chapters={book.chapters} />
        )}
      </div>

      <DeleteBookModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        bookId={bookId}
        bookTitle={book.title}
      />

      <style jsx>{`
        .book-detail {
          display: flex;
          flex-direction: column;
        }
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        :global(.back-link) {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
        }
        :global(.back-link):hover {
          color: var(--text-primary);
        }
        .top-actions {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </>
  );
}
