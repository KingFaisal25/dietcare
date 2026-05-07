'use client';

import React from 'react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan & Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">Lihat dan unduh laporan transaksi, pendapatan, dan metrik lainnya.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          Unduh Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Pendapatan Bulan Ini', value: 'Rp 0', trend: '0%' },
          { title: 'Total Transaksi', value: '0', trend: '0%' },
          { title: 'Klien Baru Aktif', value: '0', trend: '0%' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-sm font-medium text-gray-500">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Data Tidak Tersedia</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Belum ada data cukup untuk menampilkan laporan detail bulan ini.
        </p>
      </div>
    </div>
  );
}
