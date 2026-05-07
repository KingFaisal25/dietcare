"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome, FiUsers, FiShoppingBag, FiPackage, FiSettings,
  FiMenu, FiX, FiLogOut, FiUserPlus, FiPieChart, FiTag,
  FiFileText, FiBell, FiSearch, FiShoppingCart, FiTruck,
} from "react-icons/fi";
import { useAuthStore } from "@/lib/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const ADMIN_LINKS = [
  { href: "/admin/dashboard",        label: "Dashboard",           icon: FiHome },
  { href: "/admin/users",            label: "Manajemen User",      icon: FiUsers },
  { href: "/admin/blogs",            label: "Konten Blog",         icon: FiFileText },
  { href: "/admin/orders",           label: "Pesanan & Transaksi", icon: FiShoppingBag },
  { href: "/admin/programs",         label: "Program & Paket",     icon: FiPackage },
  { href: "/admin/promo",            label: "Kode Promo",          icon: FiTag },
  { href: "/admin/assign",           label: "Penugasan Gizi",      icon: FiUserPlus },
];

const SHOP_LINKS = [
  { href: "/admin/shop/products", label: "Produk Shop",    icon: FiShoppingCart },
  { href: "/admin/shop/orders",   label: "Pesanan Shop",   icon: FiTruck },
];

const SECONDARY_LINKS = [
  { href: "/admin/reports",  label: "Laporan Bisnis",   icon: FiPieChart },
  { href: "/admin/settings", label: "Pengaturan Sistem", icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`} />
        <span>{label}</span>
        {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[color:var(--border-color)] bg-[var(--background-elevated)] backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.06]">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">DietCare</p>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-neutral-500 transition-all hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5 lg:hidden">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-none">
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Menu Utama</p>
            <div className="space-y-0.5">
              {ADMIN_LINKS.map(l => <NavLink key={l.href} {...l} />)}
            </div>
          </div>
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Dietela Shop</p>
            <div className="space-y-0.5">
              {SHOP_LINKS.map(l => <NavLink key={l.href} {...l} />)}
            </div>
          </div>
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Sistem</p>
            <div className="space-y-0.5">
              {SECONDARY_LINKS.map(l => <NavLink key={l.href} {...l} />)}
            </div>
          </div>
        </div>

        {/* User & Logout */}
        <div className="border-t border-[color:var(--border-color)] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-[color:var(--border-color)] bg-[var(--background-soft)] p-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=065f46&color=34d399&bold=true`}
              alt="Admin"
              className="h-9 w-9 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-0">{user?.name || "Admin"}</p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">{user?.email || "admin@dietcare.com"}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-500 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut className="w-4 h-4" />
            Keluar Panel
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-[color:var(--border-color)] bg-[var(--background-elevated)] px-6 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-neutral-500 transition-all hover:bg-brand-50 hover:text-brand-600 lg:hidden">
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-sm relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari sesuatu..."
              className="w-full rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-neutral-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {/* Notification bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-color)] bg-[var(--background)] text-neutral-500 transition-all hover:text-brand-600">
              <FiBell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 border-l border-[color:var(--border-color)] pl-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=065f46&color=34d399&bold=true`}
                alt="Admin"
                className="h-8 w-8 rounded-xl object-cover"
              />
              <div className="hidden md:block">
                <p className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-0">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 overflow-y-auto bg-[var(--background)] p-6">
          <Scene3DBackground subtle />
          {children}
        </main>
      </div>
    </div>
  );
}
