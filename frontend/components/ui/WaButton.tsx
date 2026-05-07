'use client';

import React from 'react';
import { getWaLink, WA_MSG_DEFAULT } from '@/lib/wa';

/**
 * WaButton — Tombol WhatsApp reusable dengan berbagai varian
 *
 * Variant:
 *   - 'default'  → Tombol outline hijau WA standar
 *   - 'solid'    → Tombol hijau WA solid (lebih mencolok)
 *   - 'inline'   → Tombol kecil untuk di dalam kartu program
 *   - 'pricing'  → Tombol untuk halaman pricing
 *   - 'ghost'    → Tombol transparan, teks hijau saja
 */

type WaButtonVariant = 'default' | 'solid' | 'inline' | 'pricing' | 'ghost';

export interface WaButtonProps {
  /** Pesan yang dikirim via WA (sudah encode otomatis) */
  message?: string;
  /** Override nomor WA default dari env */
  phoneNumber?: string;
  /** Teks yang tampil di tombol */
  label?: string;
  /** Varian tampilan tombol */
  variant?: WaButtonVariant;
  /** Tampilkan ikon WA */
  showIcon?: boolean;
  /** Class tambahan */
  className?: string;
}

const WA_ICON = (
  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  </svg>
);

const VARIANT_STYLES: Record<WaButtonVariant, string> = {
  default:
    'border-2 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/5 hover:border-[#25D366]/60 px-5 py-2.5 rounded-xl text-sm font-semibold',
  solid:
    'bg-[#25D366] text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20ba5a] hover:shadow-lg px-5 py-2.5 rounded-xl text-sm font-semibold',
  inline:
    'border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/5 hover:border-[#25D366]/50 px-3 py-1.5 rounded-lg text-xs font-semibold',
  pricing:
    'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#25D366]/15',
  ghost:
    'text-[#25D366] hover:text-[#20ba5a] hover:bg-[#25D366]/5 px-3 py-2 rounded-lg text-sm font-medium',
};

const VARIANT_LABELS: Record<WaButtonVariant, string> = {
  default: 'Konsultasi via WhatsApp',
  solid: 'Chat WhatsApp Sekarang',
  inline: 'Tanya via WA dulu',
  pricing: 'Konsultasi gratis sebelum beli',
  ghost: 'Tanya via WA',
};

export function WaButton({
  message = WA_MSG_DEFAULT,
  phoneNumber,
  label,
  variant = 'default',
  showIcon = true,
  className = '',
}: WaButtonProps) {
  const link = getWaLink(message, phoneNumber);
  const displayLabel = label || VARIANT_LABELS[variant];

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 transition-all ${VARIANT_STYLES[variant]} ${className}`}
    >
      {showIcon && WA_ICON}
      {displayLabel}
    </a>
  );
}
