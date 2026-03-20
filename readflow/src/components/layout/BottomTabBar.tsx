"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PenLine, BarChart3, Settings, ICON_EMPHASIS } from "@/lib/icons";

const navItems = [
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: PenLine, disabled: true },
  { href: "/insights", label: "Insights", icon: BarChart3, disabled: true },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="bottom-tab-bar">
        {navItems.map((item) => {
          if ("disabled" in item && item.disabled) {
            return (
              <span key={item.href} className="tab-item disabled">
                <item.icon {...ICON_EMPHASIS} />
                <span className="tab-label">{item.label}</span>
              </span>
            );
          }
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tab-item ${isActive ? "active" : ""}`}
            >
              <item.icon {...ICON_EMPHASIS} />
              <span className="tab-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .bottom-tab-bar {
          display: none;
        }

        @media (max-width: 767px) {
          .bottom-tab-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            padding-bottom: env(safe-area-inset-bottom, 0);
            background: var(--bg-primary);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            background-color: color-mix(in srgb, var(--bg-primary) 80%, transparent);
            border-top: 1px solid var(--border-default);
            display: flex;
            align-items: center;
            justify-content: space-around;
            z-index: 50;
          }

          .tab-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 4px 12px;
            color: var(--text-tertiary);
            text-decoration: none;
            transition: color 150ms ease;
          }

          .tab-item.active {
            color: var(--accent);
          }

          .tab-label {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 500;
          }

          .tab-item.disabled {
            opacity: 0.3;
            pointer-events: none;
          }
        }
      `}</style>
    </>
  );
}
