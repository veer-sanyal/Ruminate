"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.issues[0]?.message ?? "Invalid email" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <div className="reset-page">
          <h1 className="reset-title">Check your email</h1>
          <p className="reset-subtitle">
            We sent a password reset link to <strong>{email}</strong>. It may
            take a minute to arrive.
          </p>
          <Link href="/login">
            <Button variant="secondary" className="reset-btn">
              Back to sign in
            </Button>
          </Link>
        </div>
        <style jsx>{`
          .reset-page {
            display: flex;
            flex-direction: column;
          }
          .reset-title {
            font-family: var(--font-display);
            font-size: 28px;
            color: var(--text-primary);
          }
          .reset-subtitle {
            color: var(--text-secondary);
            margin-top: 8px;
            font-size: 15px;
            line-height: 1.5;
          }
          .reset-subtitle :global(strong) {
            color: var(--text-primary);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="reset-page">
        <h1 className="reset-title">Reset your password</h1>
        <p className="reset-subtitle">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="reset-form">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          {errors.form && <p className="form-error">{errors.form}</p>}

          <Button type="submit" loading={loading}>
            Send reset link
          </Button>
        </form>

        <p className="reset-footer">
          <Link href="/login" className="reset-link">
            Back to sign in
          </Link>
        </p>
      </div>

      <style jsx>{`
        .reset-page {
          display: flex;
          flex-direction: column;
        }
        .reset-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
        }
        .reset-subtitle {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 15px;
        }
        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 32px;
        }
        .form-error {
          font-size: 13px;
          color: var(--error);
        }
        .reset-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
        }
        .reset-footer :global(.reset-link) {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        .reset-footer :global(.reset-link):hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
