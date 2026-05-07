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
          50: "#43c98f",
          100: "#43c98f",
          200: "#b2edd0",
          300: "#7dddb1",
          400: "#43c98f",
          500: "#1da271",
          600: "#14855d",
          700: "#116a4c",
          800: "#0d503a",
          900: "#0a3728",
        },
        surface: {
          0: "#ffffff",
          50: "#b2edd0",
          100: "#b2edd0",
          200: "#b2edd0",
          300: "#c1d2ca",
        },
        neutral: {
          0: "#ffffff",
          50: "#43c98f",
          100: "#43c98f",
          200: "#43c98f",
          300: "#c1d2ca",
          400: "#8aa094",
          500: "#5b7066",
          600: "#41544c",
          700: "#2b3933",
          800: "#1d2723",
          900: "#101714",
          950: "#090d0b",
        },
        success: { light: "#43c98f", DEFAULT: "#1fa971", dark: "#0d5e42" },
        warning: { light: "#43c98ff", DEFAULT: "#d88a1f", dark: "#8a530c" },
        danger: { light: "#ffe6e6", DEFAULT: "#dc5c5c", dark: "#8e2e2e" },
        info: { light: "#e6efff", DEFAULT: "#3178f6", dark: "#17489e" },
        secondary: {
          50: "#43c98f",
          100: "#d6e2ff",
          500: "#2f6fed",
          600: "#245bca",
          700: "#1d499f",
        },
        accent: {
          50: "#fff4e4",
          100: "#ffe5be",
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
