"use client";

import { getSentenceForWord } from "@/lib/utils/text-utils";

interface RSVPContextLineProps {
  text: string;
  currentWordIndex: number;
}

export default function RSVPContextLine({
  text,
  currentWordIndex,
}: RSVPContextLineProps) {
  const { sentenceText } = getSentenceForWord(text, currentWordIndex);

  return (
    <>
      <div className="context-line">
        <p className="context-text">{sentenceText}</p>
      </div>

      <style jsx>{`
        .context-line {
          text-align: center;
          padding: 0 24px;
          max-width: 600px;
          margin: 0 auto;
        }
        .context-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-tertiary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
