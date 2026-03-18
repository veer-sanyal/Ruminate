interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "4px",
  className = "",
}: SkeletonProps) {
  return (
    <>
      <div className={`skeleton ${className}`} style={{ width, height, borderRadius }} />
      <style jsx>{`
        .skeleton {
          background: var(--bg-tertiary);
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

/** Pre-built skeleton for a book card in the library grid */
export function BookCardSkeleton() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Skeleton height="200px" borderRadius="8px" />
      <Skeleton width="70%" height="14px" />
      <Skeleton width="40%" height="12px" />
    </div>
  );
}
