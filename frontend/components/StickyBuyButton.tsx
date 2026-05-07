"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface StickyBuyButtonProps {
  label?: string;
  href: string;
  /** Offset in pixels from top to show the button (default: 600) */
  showAfter?: number;
}

export default function StickyBuyButton({
  label = "Beli Sekarang",
  href,
  showAfter = 600,
}: StickyBuyButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  if (!visible) return null;

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <Link
          href={href}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
        >
          <ShoppingCart className="h-4 w-4" />
          {label}
        </Link>
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
        <Link
          href={href}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 hover:scale-105"
        >
          <ShoppingCart className="h-4 w-4" />
          {label}
        </Link>
      </div>
    </>
  );
}
