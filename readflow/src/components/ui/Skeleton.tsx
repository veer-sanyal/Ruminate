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
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  );
}

/** Pre-built skeleton for a book card in the library grid */
export function BookCardSkeleton() {
  return (
    <>
      <div className="book-skeleton">
        <Skeleton height="100%" borderRadius="4px" />
        <div className="book-skeleton-text">
          <Skeleton width="80%" height="13px" borderRadius="3px" />
          <Skeleton width="50%" height="11px" borderRadius="3px" />
        </div>
      </div>
      <style jsx>{`
        .book-skeleton {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .book-skeleton > :first-child {
          aspect-ratio: 2 / 3;
        }
        .book-skeleton-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </>
  );
}
