'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { FiLock, FiEye } from 'react-icons/fi';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900">Kebijakan Privasi</h1>
          <p className="text-gray-500 font-medium italic">Terakhir diperbarui: 1 April 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 flex items-center gap-4 bg-white border-none shadow-md">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl">
              <FiLock />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Data Aman</h4>
              <p className="text-xs text-gray-500">Enkripsi standar industri</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 bg-white border-none shadow-md">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
              <FiEye />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Transparansi</h4>
              <p className="text-xs text-gray-500">Tahu data apa yang kami ambil</p>
            </div>
          </Card>
        </div>

        <Card className="p-8 md:p-12 prose prose-green max-w-none shadow-xl">
          <p className="text-gray-600 leading-relaxed mb-8">
            Di NutriPro, privasi Anda adalah prioritas utama kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <span className="text-green-600">01.</span> Data yang Kami Kumpulkan
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>Kami mengumpulkan data berikut untuk keperluan layanan:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identitas:</strong> Nama lengkap, tanggal lahir, jenis kelamin.</li>
                <li><strong>Kontak:</strong> Alamat email, nomor WhatsApp, kota tinggal.</li>
                <li><strong>Kesehatan:</strong> Berat badan, tinggi badan, riwayat medis, alergi, dan pola makan.</li>
                <li><strong>Teknis:</strong> Alamat IP, jenis perangkat, dan data penggunaan via cookies.</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <span className="text-green-600">02.</span> Penggunaan Data
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Informasi Anda digunakan secara eksklusif untuk menyusun rekomendasi gizi yang dipersonalisasi, memantau progress kesehatan, mengirimkan pengingat jadwal, serta memproses transaksi pembayaran. Kami <strong>tidak pernah</strong> menjual data Anda ke pihak ketiga manapun.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <span className="text-green-600">03.</span> Akses dan Keamanan
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Data kesehatan sensitif Anda hanya dapat diakses oleh:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>Ahli gizi yang menangani program Anda.</li>
              <li>Tim IT terbatas untuk pemeliharaan sistem.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Kami menggunakan teknologi Secure Socket Layer (SSL) dan enkripsi database untuk memastikan data Anda tetap terlindungi dari akses yang tidak sah.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
              <span className="text-green-600">04.</span> Hak Anda (UU PDP)
            </h2>
            <p className="text-gray-600 mb-4">Sebagai pemilik data, Anda memiliki hak untuk:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <strong>Akses & Koreksi:</strong> Meminta salinan data atau memperbaiki kesalahan informasi.
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <strong>Penghapusan:</strong> Meminta penghapusan akun dan data secara permanen.
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">Hubungi Data Protection Officer (DPO) kami:</p>
            <p className="font-bold text-gray-700">dpo@dietcare.id</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPage;
