"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { signupSchema } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({ email, password });
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
      await signUp(email, password);
      router.push("/onboarding");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      if (message.toLowerCase().includes("already registered")) {
        setErrors({ email: "An account with this email already exists" });
      } else {
        setErrors({ form: message });
      }
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
      <div className="signup-page">
        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">Start your reading journey.</p>

        <form onSubmit={handleSubmit} className="signup-form">
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
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          {errors.form && <p className="form-error">{errors.form}</p>}

          <Button type="submit" loading={loading} className="signup-btn">
            Create account
          </Button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <Button
          variant="secondary"
          onClick={handleGoogle}
          loading={googleLoading}
          className="signup-btn"
        >
          Continue with Google
        </Button>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link href="/login" className="signup-link">
            Sign in
          </Link>
        </p>
      </div>

      <style jsx>{`
        .signup-page {
          display: flex;
          flex-direction: column;
        }
        .signup-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
        }
        .signup-subtitle {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 15px;
        }
        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 32px;
        }
        .form-error {
          font-size: 13px;
          color: var(--error);
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
        .signup-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .signup-footer :global(.signup-link) {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        .signup-footer :global(.signup-link):hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
