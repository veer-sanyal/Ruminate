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
          font-family: var(--font-reading);
          font-size: 20px;
          line-height: 1.7;
          color: var(--text-primary);
          max-width: 680px;
          margin: 0 auto;
          padding: 40px 0;
          cursor: pointer;
          user-select: none;
          overflow-y: auto;
        }
        .word {
          transition: none; /* INSTANT highlight */
        }
        .word-active {
          background: rgba(var(--accent-rgb, 139, 92, 246), 0.2);
          border-radius: 3px;
          padding: 1px 0;
        }

        @media (max-width: 640px) {
          .chapter-text {
            font-size: 18px;
            padding: 24px 0;
          }
        }
      `}</style>
    </>
  );
}
