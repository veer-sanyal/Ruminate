"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/library");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setErrors({ form: "Google sign-in failed. Please try again." });
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <div className="login-page">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to continue reading.</p>

        <form onSubmit={handleSubmit} className="login-form">
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
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          {errors.form && <p className="form-error">{errors.form}</p>}

          <Button type="submit" loading={loading} className="login-btn">
            Sign in
          </Button>
        </form>

        <Link href="/reset-password" className="forgot-link">
          Forgot password?
        </Link>

        <div className="divider">
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleGoogle}
          loading={googleLoading}
          className="login-btn"
        >
          Continue with Google
        </Button>

        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="login-link">
            Sign up
          </Link>
        </p>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          flex-direction: column;
        }
        .login-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
        }
        .login-subtitle {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 15px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 32px;
        }
        .form-error {
          font-size: 13px;
          color: var(--error);
        }
        :global(.forgot-link) {
          display: block;
          margin-top: 12px;
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          text-align: right;
        }
        :global(.forgot-link):hover {
          text-decoration: underline;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: var(--text-tertiary);
          font-size: 13px;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }
        .login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .login-footer :global(.login-link) {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        .login-footer :global(.login-link):hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
