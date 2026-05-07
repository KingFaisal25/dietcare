"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  CalendarRange, ChevronLeft, LayoutDashboard,
  LogOut, Menu, Salad, Users, UserCircle, X, Bell, Search,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/authStore";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/nutritionist/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { href: "/nutritionist/clients",   label: "Manajemen Klien", icon: Users },
  { href: "/nutritionist/schedule",  label: "Jadwal Saya",     icon: CalendarRange },
  { href: "/nutritionist/profil",    label: "Profil Ahli Gizi",icon: UserCircle },
] as const;

export default function NutritionistLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[color:var(--border-color)] bg-[var(--background-elevated)] backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <Link href="/nutritionist/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Salad className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">DietCare</p>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Ahli Gizi</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-neutral-500 transition-all hover:bg-brand-50 hover:text-brand-600 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border-color)] bg-[var(--background-soft)] p-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Gizi")}&background=065f46&color=34d399&bold=true`}
              alt={user?.name}
              className="h-9 w-9 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-0">{user?.name || "Ahli Gizi"}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Nutritionist</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 scrollbar-none">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Menu Utama</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300 transition-colors"}`} />
                <span>{item.label}</span>
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </Link>
            );
          })}

          <div className="pt-4">
            <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Lainnya</p>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
              Kembali ke Beranda
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-[color:var(--border-color)] p-4">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 group"
          >
            <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[color:var(--border-color)] bg-[var(--background-elevated)] px-4 backdrop-blur-lg lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600">
              <Salad className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-white">DietCare</p>
          </div>
          <div className="ml-auto">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] text-neutral-500 transition-all hover:text-brand-600">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-[color:var(--border-color)] bg-[var(--background-elevated)] px-6 backdrop-blur-lg lg:flex">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari klien, jadwal..."
              className="w-full rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] text-neutral-500 transition-all hover:text-brand-600">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>
            <div className="flex items-center gap-2.5 border-l border-[color:var(--border-color)] pl-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Gizi")}&background=065f46&color=34d399&bold=true`}
                alt="Profile"
                className="h-8 w-8 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-0">{user?.name || "Ahli Gizi"}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Nutritionist</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 bg-[var(--background)]">
          <Scene3DBackground subtle />
          {children}
        </main>
      </div>
    </div>
  );
}
