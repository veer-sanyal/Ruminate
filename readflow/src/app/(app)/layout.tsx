"use client";

import Sidebar from "@/components/layout/Sidebar";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
      <BottomTabBar />
      <style jsx>{`
        .app-main {
          /* Desktop: offset by sidebar width */
          margin-left: 240px;
          min-height: 100vh;
          padding: 32px 24px;
          max-width: calc(960px + 48px);
        }

        /* Tablet: smaller sidebar */
        @media (min-width: 768px) and (max-width: 1023px) {
          .app-main {
            margin-left: 64px;
          }
        }

        /* Mobile: no sidebar offset, add bottom padding for tab bar */
        @media (max-width: 767px) {
          .app-main {
            margin-left: 0;
            padding: 20px 16px 80px;
          }
        }
      `}</style>
    </>
  );
}
