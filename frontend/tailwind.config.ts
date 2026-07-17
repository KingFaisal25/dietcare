import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#86efac",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#1da271",
          600: "#14855d",
          700: "#116a4c",
          800: "#0d503a",
          900: "#0a3728",
        },
        surface: {
          0: "#ffffff",
          50: "#f8faf9",
          100: "#f1f5f3",
          200: "#e2e8e5",
          300: "#cbd5d0",
        },
        neutral: {
          0: "#ffffff",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#86efac",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        success: { light: "#43c98f", DEFAULT: "#1fa971", dark: "#0d5e42" },
        warning: { light: "#fef3c7", DEFAULT: "#d88a1f", dark: "#8a530c" },
        danger: { light: "#fee2e2", DEFAULT: "#dc5c5c", dark: "#8e2e2e" },
        info: { light: "#e0f2fe", DEFAULT: "#3178f6", dark: "#17489e" },
        secondary: {
          50: "#eff6ff",
          100: "#86efac",
          500: "#2f6fed",
          600: "#245bca",
          700: "#1d499f",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f4a53a",
          600: "#d1841c",
        },
        macro: {
          protein: "#3b82f6",
          carbs: "#f4a53a",
          fat: "#dc5c5c",
          fiber: "#8b5cf6",
          calories: "#1da271",
        },
        primary: {
          DEFAULT: "#1da271",
          dark: "#14855d",
          light: "#eefcf5",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        modal: "var(--shadow-modal)",
        green: "var(--shadow-green)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        fast: "160ms",
        base: "240ms",
        slow: "420ms",
      },
    },
  },
  plugins: [],
};
export default config;
