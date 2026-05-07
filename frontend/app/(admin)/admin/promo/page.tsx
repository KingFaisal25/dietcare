'use client';

import React from 'react';

export default function PromoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Promo</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kode promo dan diskon untuk klien.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Tambah Kode Promo
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Belum Ada Promo</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Anda belum membuat kode promo apa pun. Klik tombol di atas untuk membuat promo baru.
        </p>
      </div>
    </div>
  );
}
