"use client";

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reader-layout">
      {children}
      <style jsx>{`
        .reader-layout {
          min-height: 100vh;
          background: var(--bg-reader);
        }
      `}</style>
    </div>
  );
}
