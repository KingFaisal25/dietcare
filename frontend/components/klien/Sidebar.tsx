"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiHome, FiBookOpen, FiTrendingUp, FiMessageSquare,
  FiCalendar, FiFileText, FiUser, FiLogOut,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { useAuthStore } from "@/lib/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";

const MAIN_LINKS = [
  { href: "/klien-dashboard", label: "Dashboard",  icon: FiHome },
  { href: "/diary",           label: "Food Diary", icon: FiBookOpen },
  { href: "/progress",        label: "Progress",   icon: FiTrendingUp },
  { href: "/meal-plan",       label: "Meal Plan",  icon: MdRestaurant },
];

const CONSULTATION_LINKS = [
  { href: "/konsultasi", label: "Pesan",    icon: FiMessageSquare, badge: 2 },
  { href: "/laporan",    label: "Dokumen",  icon: FiFileText },
];

const ACCOUNT_LINKS = [
  { href: "/profil", label: "Profil Saya", icon: FiUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const renderLinks = (links: { href: string; label: string; icon: React.ElementType; badge?: number }[]) => (
    <div className="space-y-0.5">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300 transition-colors"}`} />
              <span>{link.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {link.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {link.badge}
                </span>
              )}
              {active && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen bg-gray-900 border-r border-white/[0.06] flex-shrink-0">
      {/* Brand */}
      <div className="flex h-16 items-center px-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">DietCare</p>
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Klien</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="relative h-9 w-9 flex-shrink-0">
            <Image
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=065f46&color=34d399&bold=true`}
              alt="Avatar"
              fill
              className="rounded-xl object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name || "Memuat..."}</p>
            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-[10px] font-bold text-emerald-400">
              {/* @ts-ignore */}
              {user?.program || "Body Goals"} · Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 scrollbar-none">
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Utama</p>
          {renderLinks(MAIN_LINKS)}
        </div>
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Konsultasi</p>
          {renderLinks(CONSULTATION_LINKS)}
        </div>
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Akun</p>
          {renderLinks(ACCOUNT_LINKS)}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-4 space-y-2">
        {/* Streak / plan info */}
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-emerald-400">Progress Program</p>
            <span className="text-[10px] font-bold text-gray-500">25%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "25%" }} />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">Hari ke-7 dari 30</p>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400 group"
        >
          <FiLogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
          Keluar
        </button>
      </div>
    </aside>
  );
}