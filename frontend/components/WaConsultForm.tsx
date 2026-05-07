'use client';

import React, { useState } from 'react';
import { getWaLink } from '@/lib/wa';

/**
 * WaConsultForm — Form konsultasi dengan pesan WhatsApp pre-filled
 *
 * User mengisi nama, berat badan, dan tujuan diet.
 * Saat klik tombol, otomatis buka WhatsApp dengan pesan
 * yang sudah terisi dari data form.
 *
 * Bisa di-embed di landing page, halaman program, dll.
 */

const DIET_GOALS = [
  { value: '', label: 'Pilih tujuan diet...' },
  { value: 'menurunkan berat badan', label: 'Turun Berat Badan' },
  { value: 'menaikkan berat badan', label: 'Naik Berat Badan' },
  { value: 'menjaga berat badan ideal', label: 'Jaga Berat Badan' },
  { value: 'mengontrol gula darah (diabetes)', label: 'Kontrol Diabetes' },
  { value: 'mengelola PCOS', label: 'Mengelola PCOS' },
  { value: 'diet untuk kehamilan/menyusui', label: 'Diet Kehamilan / Menyusui' },
  { value: 'membentuk otot', label: 'Membentuk Otot' },
  { value: 'memperbaiki pola makan', label: 'Perbaiki Pola Makan' },
];

interface WaConsultFormProps {
  /** Judul di atas form */
  title?: string;
  /** Deskripsi di bawah judul */
  description?: string;
  /** Class tambahan untuk wrapper */
  className?: string;
}

export function WaConsultForm({
  title = 'Konsultasi Gratis via WhatsApp',
  description = 'Isi data singkat di bawah, lalu langsung chat dengan ahli gizi kami.',
  className = '',
}: WaConsultFormProps) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  const isValid = name.trim() && weight.trim() && goal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const message = `Halo kak, saya ${name.trim()}. Berat badan saya ${weight} kg. Saya ingin ${goal}. Boleh minta rekomendasikan program yang cocok?`;
    const link = getWaLink(message);
    window.open(link, '_blank');
  };

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10">
          <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Nama */}
        <div>
          <label htmlFor="wa-name" className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
          <input
            id="wa-name"
            type="text"
            placeholder="Masukkan nama Anda"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>

        {/* Berat Badan */}
        <div>
          <label htmlFor="wa-weight" className="block text-sm font-medium text-gray-700 mb-1.5">Berat Badan (kg)</label>
          <input
            id="wa-weight"
            type="number"
            placeholder="Contoh: 70"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>

        {/* Tujuan Diet */}
        <div>
          <label htmlFor="wa-goal" className="block text-sm font-medium text-gray-700 mb-1.5">Tujuan Diet</label>
          <select
            id="wa-goal"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-primary/20"
          >
            {DIET_GOALS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20ba5a] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
          Chat WhatsApp Sekarang
        </button>
      </form>
    </div>
  );
}
