"use client";

import type { ProcessingStatus } from "@/types";
import { Loader2, AlertCircle, ICON_COMPACT } from "@/lib/icons";

interface ProcessingBadgeProps {
  status: ProcessingStatus;
}

const STATUS_CONFIG: Record<
  ProcessingStatus,
  { label: string; color: string; icon: "spinner" | "error" | null }
> = {
  uploading: { label: "Uploading", color: "var(--accent)", icon: "spinner" },
  extracting: { label: "Extracting", color: "var(--accent)", icon: "spinner" },
  distilling: { label: "Distilling", color: "var(--accent)", icon: "spinner" },
  ready: { label: "Ready", color: "var(--success)", icon: null },
  error: { label: "Error", color: "var(--error)", icon: "error" },
};

export default function ProcessingBadge({ status }: ProcessingBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (status === "ready") return null;

  return (
    <>
      <span className="badge">
        {config.icon === "spinner" && (
          <Loader2 {...ICON_COMPACT} className="badge-spinner" />
        )}
        {config.icon === "error" && <AlertCircle {...ICON_COMPACT} />}
        {config.label}
      </span>

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.65);
          color: ${config.color};
          backdrop-filter: blur(4px);
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .badge :global(.badge-spinner) {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </>
  );
}
