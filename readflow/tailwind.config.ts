import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Fonts ── */
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        reader: ['"Literata"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },

      /* ── Colors (CSS custom properties mapped) ── */
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          reader: "var(--bg-reader)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          text: "var(--accent-text)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
      },

      /* ── Spacing (custom scale) ── */
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },

      /* ── Font sizes (type scale) ── */
      fontSize: {
        xs: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        sm: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        base: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        lg: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        xl: ["20px", { lineHeight: "1.5", fontWeight: "500" }],
        "2xl": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "3xl": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "4xl": ["40px", { lineHeight: "1.1", fontWeight: "600" }],
      },

      /* ── Border radius ── */
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },

      /* ── Breakpoints ── */
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },

      /* ── Max widths ── */
      maxWidth: {
        reader: "680px",
        content: "960px",
        sidebar: "240px",
      },

      /* ── Animations ── */
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      keyframes: {
        "shimmer": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-flag": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "slide-up": "slide-up 200ms ease-out",
        "fade-in": "fade-in 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "pulse-flag": "pulse-flag 200ms ease-out",
      },

      /* ── Box shadows ── */
      boxShadow: {
        elevated: "0 1px 3px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
