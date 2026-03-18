"use client";

import Button from "@/components/ui/Button";
import { Loader2 } from "@/lib/icons";

interface AudioLoadingStateProps {
  status: "generating" | "error";
  onRetry?: () => void;
}

export default function AudioLoadingState({
  status,
  onRetry,
}: AudioLoadingStateProps) {
  return (
    <>
      <div className="audio-loading">
        {status === "generating" ? (
          <>
            <Loader2 size={32} strokeWidth={1.5} className="spinner" />
            <p className="loading-text">Generating narration...</p>
            <p className="loading-hint">
              This may take a moment for longer chapters.
            </p>
          </>
        ) : (
          <>
            <p className="error-text">Failed to generate audio</p>
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Try again
              </Button>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .audio-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 20px;
          text-align: center;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .audio-loading :global(.spinner) {
          animation: spin 1s linear infinite;
          color: var(--accent);
        }
        .loading-text {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .loading-hint {
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .error-text {
          font-size: 15px;
          color: var(--error);
        }
      `}</style>
    </>
  );
}
