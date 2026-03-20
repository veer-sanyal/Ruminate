"use client";

import { useRef, useCallback } from "react";
import { useReaderStore } from "@/stores/readerStore";
import { useWordHighlight } from "@/hooks/useWordHighlight";
import { splitIntoWords } from "@/lib/utils/text-utils";

interface ChapterTextProps {
  text: string;
  onTogglePlayPause: () => void;
}

export default function ChapterText({ text, onTogglePlayPause }: ChapterTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentWordIndex } = useWordHighlight(containerRef);
  const setShowParagraphView = useReaderStore((s) => s.setShowParagraphView);

  const words = splitIntoWords(text);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWordMouseDown = useCallback(
    (index: number) => {
      longPressTimer.current = setTimeout(() => {
        setShowParagraphView(true, index);
      }, 500);
    },
    [setShowParagraphView]
  );

  const handleWordMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="chapter-text"
        onClick={onTogglePlayPause}
      >
        {words.map((word, i) => (
          <span
            key={i}
            data-word-index={i}
            className={`word ${i === currentWordIndex ? "word-active" : ""}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleWordMouseDown(i);
            }}
            onMouseUp={handleWordMouseUp}
            onMouseLeave={handleWordMouseUp}
            onTouchStart={(e) => {
              handleWordMouseDown(i);
            }}
            onTouchEnd={handleWordMouseUp}
          >
            {word}{" "}
          </span>
        ))}
      </div>

      <style jsx>{`
        .chapter-text {
          font-family: var(--font-reader);
          font-size: 19px;
          line-height: 1.8;
          color: var(--text-primary);
          max-width: 620px;
          margin: 0 auto;
          padding: 48px 40px;
          cursor: pointer;
          user-select: none;
          letter-spacing: 0.01em;
          word-spacing: 0.05em;
        }
        .chapter-text p + p,
        .chapter-text br + span {
          margin-top: 1.2em;
        }
        .word {
          transition: none;
        }
        .word-active {
          background: var(--accent-subtle);
          color: var(--accent-text);
          border-radius: 3px;
          padding: 2px 1px;
        }

        @media (max-width: 640px) {
          .chapter-text {
            font-size: 17px;
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
}
