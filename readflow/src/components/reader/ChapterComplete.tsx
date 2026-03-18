"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { Sparkles, ChevronRight, ICON_DEFAULTS } from "@/lib/icons";

interface ChapterCompleteProps {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  nextChapterId: string | null;
  isLastChapter: boolean;
}

export default function ChapterComplete({
  bookId,
  chapterId,
  chapterTitle,
  nextChapterId,
  isLastChapter,
}: ChapterCompleteProps) {
  return (
    <>
      <div className="complete">
        <div className="complete-icon">
          <Sparkles size={40} strokeWidth={1.2} />
        </div>

        <h2 className="complete-title">
          {isLastChapter ? "You finished the book!" : "Chapter complete!"}
        </h2>
        <p className="complete-subtitle">{chapterTitle}</p>

        <div className="complete-actions">
          <Link href={`/reflect/${bookId}/${chapterId}`}>
            <Button variant="secondary" icon={<Sparkles {...ICON_DEFAULTS} />}>
              Reflect on this chapter
            </Button>
          </Link>

          {nextChapterId && (
            <Link href={`/read/${bookId}/${nextChapterId}`}>
              <Button icon={<ChevronRight {...ICON_DEFAULTS} />}>
                Continue to next chapter
              </Button>
            </Link>
          )}

          {isLastChapter && (
            <Link href={`/library/${bookId}`}>
              <Button>Back to book</Button>
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .complete {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 80px 24px;
        }
        .complete-icon {
          color: var(--accent);
          margin-bottom: 20px;
        }
        .complete-title {
          font-family: var(--font-display);
          font-size: 26px;
          color: var(--text-primary);
        }
        .complete-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 8px;
        }
        .complete-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 32px;
        }
      `}</style>
    </>
  );
}
