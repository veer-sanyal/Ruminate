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
          <h2>ReadFlow</h2>
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
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-default);
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: width 200ms ease;
        }

        .sidebar-logo {
          padding: 24px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-logo h2 {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sidebar-nav {
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
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
          transition: all 150ms ease;
          position: relative;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .sidebar-nav-item.active {
          background: var(--accent-subtle);
          color: var(--accent-text);
          border-left: 2px solid var(--accent);
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
          .sidebar-logo h2 {
            display: none;
          }
          .sidebar-logo {
            padding: 24px 16px;
            display: flex;
            justify-content: center;
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
