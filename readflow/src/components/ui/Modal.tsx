"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X, ICON_DEFAULTS } from "@/lib/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "480px",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      <div
        className="modal-overlay"
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      >
        <div className="modal-content" style={{ maxWidth }}>
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            <button
              onClick={onClose}
              className="modal-close"
              aria-label="Close modal"
            >
              <X {...ICON_DEFAULTS} />
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          animation: fade-in 200ms ease;
        }
        .modal-content {
          width: 100%;
          background: var(--bg-primary);
          border-radius: 12px;
          border: 1px solid var(--border-default);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
          animation: scale-in 200ms ease;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .modal-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .modal-close {
          color: var(--text-tertiary);
          padding: 4px;
          border-radius: 4px;
          transition: color 150ms ease;
        }
        .modal-close:hover {
          color: var(--text-primary);
        }
        .modal-body {
          padding: 20px;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
