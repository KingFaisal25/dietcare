"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const storageKey = "dietcare-theme";

function resolveTheme(theme: ThemeMode) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within Providers");
  }

  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchInterval: 30 * 1000, // auto-refresh every 30s
          },
        },
      })
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey) as ThemeMode | null;
    const initialTheme = savedTheme ?? "system";
    const nextResolvedTheme = resolveTheme(initialTheme);

    setTheme(initialTheme);
    setResolvedTheme(nextResolvedTheme);
    document.documentElement.dataset.theme = nextResolvedTheme;
    document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentTheme = (window.localStorage.getItem(storageKey) as ThemeMode | null) ?? "system";
      if (currentTheme === "system") {
        const systemTheme = media.matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.dataset.theme = systemTheme;
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        const nextResolvedTheme =
          nextTheme === "system" ? resolveTheme("system") : nextTheme;

        setTheme(nextTheme);
        setResolvedTheme(nextResolvedTheme);
        window.localStorage.setItem(storageKey, nextTheme);
        document.documentElement.dataset.theme = nextResolvedTheme;
        document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      },
      toggleTheme: () => {
        const nextTheme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
        const nextResolvedTheme = nextTheme;

        setTheme(nextTheme);
        setResolvedTheme(nextResolvedTheme);
        window.localStorage.setItem(storageKey, nextTheme);
        document.documentElement.dataset.theme = nextResolvedTheme;
        document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      },
    }),
    [resolvedTheme, theme]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeValue}>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme={resolvedTheme}
          toastOptions={{
            style: {
              borderRadius: "24px",
              padding: "16px",
              boxShadow: "var(--shadow-float)",
              border: "1px solid var(--border-color)",
              background: "var(--background-elevated)",
              color: "var(--foreground)",
            },
            className: "font-body",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <ScrollToTop />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
