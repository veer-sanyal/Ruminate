"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PenLine, BarChart3, Settings, ICON_DEFAULTS } from "@/lib/icons";

const navItems = [
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: PenLine },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">R</span>
          <span className="logo-text">ReadFlow</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <item.icon {...ICON_DEFAULTS} />
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 240px;
          background: var(--bg-primary);
          border-right: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          z-index: 40;
        }

        .sidebar-logo {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-mark {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 400;
          color: var(--accent);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--accent);
          border-radius: 6px;
          letter-spacing: -0.02em;
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .sidebar-nav {
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 150ms ease, background 150ms ease;
        }

        .sidebar-nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .sidebar-nav-item.active {
          color: var(--accent-text);
          background: var(--accent-subtle);
        }

        .sidebar-nav-label {
          white-space: nowrap;
          overflow: hidden;
        }

        /* Tablet: collapse to icons only */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar {
            width: 64px;
          }
          .logo-text {
            display: none;
          }
          .sidebar-logo {
            padding: 24px 0;
            justify-content: center;
          }
          .sidebar-nav {
            padding: 8px;
          }
          .sidebar-nav-label {
            display: none;
          }
          .sidebar-nav-item {
            justify-content: center;
            padding: 10px;
          }
        }

        /* Mobile: hide sidebar */
        @media (max-width: 767px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
