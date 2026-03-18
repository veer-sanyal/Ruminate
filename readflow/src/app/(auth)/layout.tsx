"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        {children}
      </div>
      <style jsx>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          background: var(--bg-primary);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
        }
      `}</style>
    </div>
  );
}
