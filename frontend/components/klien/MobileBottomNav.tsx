"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBookOpen, FiMessageSquare, FiTrendingUp, FiShoppingBag } from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/klien-dashboard", label: "Home",     icon: FiHome },
  { href: "/shop",            label: "Shop",     icon: FiShoppingBag },
  { href: "/diary",           label: "Diary",    icon: FiBookOpen },
  { href: "/konsultasi",      label: "Chat",     icon: FiMessageSquare },
  { href: "/progress",        label: "Progress", icon: FiTrendingUp },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/[0.06] z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 relative group"
            >
              <div className={`flex items-center justify-center transition-all duration-200 ${
                isActive ? "text-emerald-400 scale-110" : "text-gray-500 group-hover:text-gray-400"
              }`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? "text-emerald-400" : "text-gray-600"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}