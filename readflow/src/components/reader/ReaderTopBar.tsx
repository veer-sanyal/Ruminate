"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, ICON_DEFAULTS } from "@/lib/icons";

interface ReaderTopBarProps {
  bookId: string;
  chapterTitle: string;
  onSettingsClick: () => void;
  progressPercent?: number;
}

export default function ReaderTopBar({
  bookId,
  chapterTitle,
  onSettingsClick,
  progressPercent,
}: ReaderTopBarProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false); // scrolling down
      } else {
        setVisible(true); // scrolling up
      }
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={`top-bar ${visible ? "visible" : "hidden"}`}>
        <Link href={`/library/${bookId}`} className="back-btn">
          <ArrowLeft {...ICON_DEFAULTS} />
        </Link>

        <span className="chapter-title">
          {chapterTitle}
          {progressPercent !== undefined && progressPercent > 0 && (
            <span className="progress-badge">{progressPercent}%</span>
          )}
        </span>

        <div className="right-actions">
          <button onClick={onSettingsClick} className="settings-btn">
            <Settings {...ICON_DEFAULTS} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-subtle);
          transition: transform 200ms ease;
        }
        .hidden {
          transform: translateY(-100%);
        }
        .visible {
          transform: translateY(0);
        }
        :global(.back-btn) {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
        }
        :global(.back-btn):hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        .chapter-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 60%;
          text-align: center;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .progress-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 400;
          color: var(--text-tertiary);
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .right-actions {
          display: flex;
          gap: 4px;
        }
        .settings-btn {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: none;
          cursor: pointer;
        }
        .settings-btn:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
      `}</style>
    </>
  );
}
