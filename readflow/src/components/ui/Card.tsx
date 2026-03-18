import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  padding?: string;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  padding = "16px",
  hover = false,
  className = "",
  onClick,
}: CardProps) {
  return (
    <>
      <div
        className={`card ${hover ? "card-hover" : ""} ${className}`}
        style={{ padding }}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </div>

      <style jsx>{`
        .card {
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 200ms ease;
        }
        .card-hover:hover {
          border-color: var(--border-subtle);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }
        .card-hover {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
