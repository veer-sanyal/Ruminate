"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "@/lib/icons";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <>
        <button
          ref={ref}
          disabled={disabled || loading}
          className={`btn btn-${variant} btn-${size} ${className}`}
          {...props}
        >
          {loading ? (
            <Loader2 size={16} strokeWidth={1.5} className="btn-spinner" />
          ) : icon ? (
            <span className="btn-icon">{icon}</span>
          ) : null}
          {children}
        </button>

        <style jsx>{`
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: var(--font-sans);
            font-weight: 500;
            border-radius: 8px;
            cursor: pointer;
            transition: all 150ms ease;
            border: none;
            outline: none;
            position: relative;
            white-space: nowrap;
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* Variants */
          .btn-primary {
            background: var(--accent);
            color: white;
          }
          .btn-primary:hover:not(:disabled) {
            background: var(--accent-hover);
          }

          .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-default);
          }
          .btn-secondary:hover:not(:disabled) {
            background: var(--bg-tertiary);
          }

          .btn-ghost {
            background: transparent;
            color: var(--text-secondary);
          }
          .btn-ghost:hover:not(:disabled) {
            background: var(--bg-secondary);
            color: var(--text-primary);
          }

          .btn-destructive {
            background: var(--error);
            color: white;
          }
          .btn-destructive:hover:not(:disabled) {
            opacity: 0.9;
          }

          /* Sizes */
          .btn-sm {
            height: 32px;
            padding: 0 12px;
            font-size: 13px;
          }
          .btn-md {
            height: 40px;
            padding: 0 16px;
            font-size: 14px;
          }
          .btn-lg {
            height: 48px;
            padding: 0 24px;
            font-size: 16px;
          }

          .btn-icon {
            display: flex;
            align-items: center;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          .btn :global(.btn-spinner) {
            animation: spin 0.6s linear infinite;
          }
        `}</style>
      </>
    );
  }
);

Button.displayName = "Button";
export default Button;
