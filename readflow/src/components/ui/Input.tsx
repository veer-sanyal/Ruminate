"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

/* ── Input ── */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <>
        <div className="input-group">
          {label && (
            <label htmlFor={id} className="input-label">
              {label}
            </label>
          )}
          <input
            ref={ref}
            id={id}
            className={`input-field ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
          {error && <p className="input-error-text">{error}</p>}
        </div>

        <style jsx>{`
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .input-label {
            font-family: var(--font-sans);
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
          }
          .input-field {
            height: 44px;
            padding: 0 12px;
            font-family: var(--font-sans);
            font-size: 16px;
            color: var(--text-primary);
            background: var(--bg-primary);
            border: 1px solid var(--border-default);
            border-radius: 8px;
            outline: none;
            transition: border-color 150ms ease;
          }
          .input-field::placeholder {
            color: var(--text-tertiary);
          }
          .input-field:focus {
            border-color: var(--accent);
          }
          .input-error {
            border-color: var(--error);
          }
          .input-error-text {
            font-size: 13px;
            color: var(--error);
          }
        `}</style>
      </>
    );
  }
);
Input.displayName = "Input";

/* ── Textarea ── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <>
        <div className="input-group">
          {label && (
            <label htmlFor={id} className="input-label">
              {label}
            </label>
          )}
          <textarea
            ref={ref}
            id={id}
            className={`textarea-field ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
          {error && <p className="input-error-text">{error}</p>}
        </div>

        <style jsx>{`
          .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .input-label {
            font-family: var(--font-sans);
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
          }
          .textarea-field {
            min-height: 100px;
            padding: 10px 12px;
            font-family: var(--font-sans);
            font-size: 16px;
            color: var(--text-primary);
            background: var(--bg-primary);
            border: 1px solid var(--border-default);
            border-radius: 8px;
            outline: none;
            resize: vertical;
            transition: border-color 150ms ease;
          }
          .textarea-field::placeholder {
            color: var(--text-tertiary);
          }
          .textarea-field:focus {
            border-color: var(--accent);
          }
          .input-error {
            border-color: var(--error);
          }
          .input-error-text {
            font-size: 13px;
            color: var(--error);
          }
        `}</style>
      </>
    );
  }
);
Textarea.displayName = "Textarea";
