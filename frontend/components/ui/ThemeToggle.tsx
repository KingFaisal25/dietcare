"use client";

import { useThemeMode } from "@/app/providers";
import { FiMoon, FiSun } from "react-icons/fi";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      aria-pressed={isDark}
      className={`theme-transition inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/70 bg-white/80 text-neutral-700 shadow-card backdrop-blur hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-neutral-900/80 dark:text-neutral-100 ${className}`}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
