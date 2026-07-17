"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserApi } from "@/lib/auth";

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

/**
 * AuthInitializer: Fetches the current session on mount.
 * Sets isLoading=false regardless of outcome, preventing the checkout page
 * from being stuck in an infinite loading state.
 */
function AuthInitializer() {
  const { setUser, clearAuth } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getUserApi()
      .then((user) => setUser(user))
      .catch(() => clearAuth());
  }, [setUser, clearAuth]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    // Force consistent light-green theme
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("dark");
    window.localStorage.setItem(storageKey, "light");
  }, []);

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme: "light",
      resolvedTheme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <ThemeContext.Provider value={themeValue}>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme="light"
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
