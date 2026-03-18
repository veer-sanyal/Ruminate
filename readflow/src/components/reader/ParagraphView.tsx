"use client";

import { useReaderStore } from "@/stores/readerStore";
import { getParagraphForWord, splitIntoWords } from "@/lib/utils/text-utils";

interface ParagraphViewProps {
  text: string;
}

export default function ParagraphView({ text }: ParagraphViewProps) {
  const { showParagraphView, paragraphViewWordIndex, setShowParagraphView } =
    useReaderStore();

  if (!showParagraphView) return null;

  const { paragraphText } = getParagraphForWord(text, paragraphViewWordIndex);
  const paragraphWords = splitIntoWords(paragraphText);

  // Find relative word position within paragraph
  const allWords = splitIntoWords(text);
  let wordsBeforeParagraph = 0;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  for (const p of paragraphs) {
    const pWords = splitIntoWords(p.trim());
    if (wordsBeforeParagraph + pWords.length > paragraphViewWordIndex) break;
    wordsBeforeParagraph += pWords.length;
  }
  const relativeIndex = paragraphViewWordIndex - wordsBeforeParagraph;

  return (
    <>
      <div className="overlay" onClick={() => setShowParagraphView(false)}>
        <div className="paragraph-card" onClick={(e) => e.stopPropagation()}>
          <p className="paragraph-text">
            {paragraphWords.map((word, i) => (
              <span
                key={i}
                className={i === relativeIndex ? "highlight" : ""}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fade-in 150ms ease;
        }
        .paragraph-card {
          max-width: 600px;
          width: 100%;
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }
        .paragraph-text {
          font-family: var(--font-reading);
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-primary);
        }
        .paragraph-text :global(.highlight) {
          background: rgba(var(--accent-rgb, 139, 92, 246), 0.25);
          border-radius: 3px;
          padding: 1px 2px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
