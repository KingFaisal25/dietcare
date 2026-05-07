'use client';

import React, { useEffect, useState } from 'react';
import { getWaLink } from '@/lib/wa';

/**
 * WaFloatingButton — Tombol floating WhatsApp
 *
 * Muncul di pojok kanan bawah semua halaman setelah scroll 200px.
 * Animasi fade-in/slide-up saat muncul, dan menghilang kembali
 * saat user scroll ke atas.
 */
export function WaFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Cek posisi awal jika halaman sudah di-scroll
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waLink = getWaLink(
    'Halo kak, saya mau konsultasi gizi gratis. Boleh bantu rekomendasikan program yang cocok untuk saya?'
  );

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Konsultasi Gratis via WhatsApp"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-400 hover:bg-[#20ba5a] hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-105 active:scale-95 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-12 opacity-0 pointer-events-none'
      } ${isHovered ? 'pr-5 pl-4 py-3' : 'p-3.5'}`}
    >
      {/* WhatsApp Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={isHovered ? 22 : 26}
        height={isHovered ? 22 : 26}
        fill="currentColor"
        viewBox="0 0 16 16"
        className="shrink-0 transition-all duration-200"
      >
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
      </svg>

      {/* Label — tampil saat hover */}
      {isHovered && (
        <span className="text-sm font-semibold whitespace-nowrap animate-in fade-in duration-200">
          Konsultasi Gratis
        </span>
      )}
    </a>
  );
}
