import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--bg-primary)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "64px",
          color: "var(--text-tertiary)",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "var(--text-secondary)",
          marginTop: "8px",
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/library"
        style={{
          marginTop: "24px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "40px",
          padding: "0 20px",
          borderRadius: "8px",
          background: "var(--accent)",
          color: "white",
          fontWeight: 500,
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        Go to Library
      </Link>
    </div>
  );
}
