'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900">Syarat & Ketentuan</h1>
          <p className="text-gray-500 font-medium italic">Terakhir diperbarui: 1 April 2026</p>
        </div>

        <Card className="p-8 md:p-12 prose prose-green max-w-none shadow-xl">
          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">1. Definisi</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Pengguna:</strong> Setiap individu yang mengakses website NutriPro atau menggunakan layanan kami.</li>
              <li><strong>Program:</strong> Layanan konsultasi gizi berbayar dengan durasi tertentu yang dipilih pengguna.</li>
              <li><strong>Layanan:</strong> Seluruh fitur yang tersedia di platform NutriPro termasuk kalkulator, artikel, dan konsultasi.</li>
              <li><strong>Ahli Gizi:</strong> Tenaga kesehatan profesional tersertifikasi yang bermitra dengan NutriPro.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">2. Ketentuan Layanan</h2>
            <p className="text-gray-600 leading-relaxed">
              Dengan menggunakan layanan NutriPro, Anda menyatakan bahwa Anda berusia minimal 18 tahun atau memiliki izin dari orang tua/wali. Anda setuju untuk memberikan data yang akurat dan jujur demi keamanan dan efektivitas konsultasi.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">3. Kebijakan Pembayaran & Refund</h2>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-4">
              <p className="text-green-800 font-bold">Kami berkomitmen pada kepuasan Anda dengan kebijakan berikut:</p>
              <ul className="list-disc pl-6 space-y-3 text-green-700 font-medium">
                <li><strong>Refund 100%:</strong> Jika program belum dimulai sama sekali (ahli gizi belum ditentukan/di-assign).</li>
                <li><strong>Refund 50%:</strong> Jika program baru berjalan kurang dari 7 hari kalender sejak assignment ahli gizi.</li>
                <li><strong>Tanpa Refund:</strong> Jika program sudah berjalan lebih dari 7 hari kalender.</li>
              </ul>
              <p className="text-xs text-green-600 italic">*Biaya administrasi bank/platform ditanggung oleh pengguna saat proses refund.</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">4. Disclaimer Medis</h2>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-orange-800">
              <p className="font-bold mb-2">PENTING:</p>
              <p className="leading-relaxed">
                Layanan gizi kami bersifat edukatif dan suportif. NutriPro bukan pengganti diagnosa medis, pengobatan, atau saran dokter spesialis. Jika Anda memiliki kondisi medis akut, segera konsultasikan dengan dokter sebelum memulai program gizi apapun.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">5. Privasi Data</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami menjamin kerahasiaan data kesehatan Anda. Data hanya dapat diakses oleh ahli gizi yang menangani Anda dan administrator sistem untuk keperluan layanan. Detail lengkap dapat dibaca di halaman <a href="/kebijakan-privasi" className="text-green-600 font-bold hover:underline">Kebijakan Privasi</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4 border-b-2 border-green-600 w-fit pb-1">6. Hukum yang Berlaku</h2>
            <p className="text-gray-600 leading-relaxed">
              Syarat dan ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. Segala perselisihan akan diupayakan melalui musyawarah untuk mufakat sebelum menempuh jalur hukum.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">Pertanyaan mengenai legalitas? Hubungi kami di:</p>
            <p className="font-bold text-gray-700">admin@dietcare.id</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;
