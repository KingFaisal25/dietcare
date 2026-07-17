"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiHome, FiBookOpen, FiTrendingUp, FiMessageSquare,
  FiFileText, FiUser, FiLogOut, FiShoppingBag, FiArrowLeft,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { useAuthStore } from "@/lib/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { gsap } from "gsap";

const MAIN_LINKS = [
  { href: "/klien-dashboard", label: "Dashboard",  icon: FiHome },
  { href: "/diary",           label: "Food Diary", icon: FiBookOpen },
  { href: "/progress",        label: "Progress",   icon: FiTrendingUp },
  { href: "/meal-plan",       label: "Meal Plan",  icon: MdRestaurant },
  { href: "/shop",            label: "Toko",       icon: FiShoppingBag },
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }
      );
      
      gsap.fromTo(
        linksRef.current.filter(el => el !== null),
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)", delay: 0.2 }
      );
    }
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const renderLinks = (links: { href: string; label: string; icon: React.ElementType; badge?: number }[], startIndex: number) => (
    <div className="space-y-1">
      {links.map((link, i) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            ref={el => { linksRef.current[startIndex + i] = el; }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2, ease: "power2.out" });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
            }}
            className={`group relative flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-emerald-100 shadow-sm border border-emerald-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                active
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span>{link.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {link.badge && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[10px] font-black text-white shadow-sm shadow-red-200">
                  {link.badge}
                </span>
              )}
              {active && (
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-200" />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside 
      ref={sidebarRef}
      className="hidden md:flex flex-col w-[270px] h-screen bg-white border-r border-slate-100 flex-shrink-0"
    >
      {/* User card at top */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-br from-slate-50 to-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-50">
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=065f46&color=34d399&bold=true`}
              alt="Avatar"
              fill
              className="rounded-2xl object-cover shadow-lg shadow-emerald-200"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-sm shadow-emerald-300">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-lg font-extrabold text-slate-900 truncate leading-tight">{user?.name || "Selamat Datang!"}</p>
            <p className="text-xs text-slate-500 font-semibold truncate">{user?.email || "user@dietcaresalma.com"}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-xl bg-white text-[11px] font-extrabold text-emerald-700 border border-emerald-100 shadow-sm">
              {/* @ts-ignore */}
              {user?.program || "Body Goals"} · Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {/* Kembali ke Beranda */}
        <div>
          <p className="px-4 mb-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Navigasi</p>
          <Link
            href="/"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2, ease: "power2.out" });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
            }}
            className="group relative flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-slate-200">
                <FiArrowLeft className="w-4.5 h-4.5" />
              </div>
              <span>Kembali ke Beranda</span>
            </div>
          </Link>
        </div>

        <div>
          <p className="px-4 mb-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Menu Utama</p>
          {renderLinks(MAIN_LINKS, 0)}
        </div>
        <div>
          <p className="px-4 mb-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Konsultasi</p>
          {renderLinks(CONSULTATION_LINKS, MAIN_LINKS.length)}
        </div>
        <div>
          <p className="px-4 mb-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Pengaturan Akun</p>
          {renderLinks(ACCOUNT_LINKS, MAIN_LINKS.length + CONSULTATION_LINKS.length)}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-5 space-y-4 bg-gradient-to-t from-slate-50 to-white">
        {/* Streak / plan info */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-5 shadow-lg shadow-emerald-200 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold opacity-90">Progress Program</p>
            <span className="text-lg font-black">25%</span>
          </div>
          <div className="h-3 rounded-full bg-white/20 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-white shadow-sm" style={{ width: "25%" }} />
          </div>
          <p className="text-[11px] font-medium opacity-80">Hari ke-7 dari 30</p>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2, ease: "power2.out" });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: "power2.out" });
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-200">
            <FiLogOut className="w-4.5 h-4.5" />
          </div>
          Keluar
        </button>
      </div>
    </aside>
  );
}
