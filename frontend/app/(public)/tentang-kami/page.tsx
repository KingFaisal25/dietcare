'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FiStar, FiUsers, FiAward, FiClock } from 'react-icons/fi';
import Link from 'next/link';

const AboutPage = () => {
  const stats = [
    { icon: <FiUsers />, value: '500+', label: 'Klien Berhasil', color: 'bg-green-50 text-green-600' },
    { icon: <FiStar />, value: '4.9/5', label: 'Rating Rata-rata', color: 'bg-yellow-50 text-yellow-600' },
    { icon: <FiAward />, value: '15+', label: 'Ahli Gizi Tersertifikasi', color: 'bg-blue-50 text-blue-600' },
    { icon: <FiClock />, value: '5 Tahun', label: 'Pengalaman', color: 'bg-purple-50 text-purple-600' },
  ];

  const nutritionists = [
    {
      name: ', S.Gz',
      title: 'Senior Clinical Dietitian',
      specialty: 'Weight Loss & Diabetes',
      str: '1234567890',
      slug: '-sgz'
    },
    {
      name: 'Putri, M.Gizi',
      title: 'Pediatric Nutritionist',
      specialty: 'Gizi Ibu & Anak',
      str: '0987654321',
      slug: 'putri-mgizi'
    },
    {
      name: 'Dr. Kevin',
      title: 'Sport Nutritionist',
      specialty: 'Muscle Gain & Performance',
      str: '5678901234',
      slug: 'dr-kevin'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-green-50/50 -z-10 skew-y-3 origin-top-left transform scale-110"></div>
        <div className="container mx-auto max-w-6xl px-6 text-center space-y-8">
          <Badge variant="success" className="px-4 py-1">Tentang Kami</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
            Kami Ada Untuk Membantu Kamu <br />
            <span className="text-green-600">Hidup Lebih Sehat</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            NutriPro bukan sekadar penyedia program diet. Kami adalah partner perjalanan kesehatanmu, didukung oleh tim profesional yang berdedikasi untuk memberikan edukasi gizi yang tepat, aman, dan berkelanjutan.
          </p>
          <div className="pt-4">
            <div className="w-full h-64 md:h-96 rounded-3xl bg-gray-200 overflow-hidden shadow-2xl ring-8 ring-white">
              {/* Placeholder for team photo */}
              <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-bold text-xl italic">
                [Foto Tim NutriPro]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card className="p-10 space-y-4 border-none bg-green-600 text-white shadow-xl transform hover:-translate-y-2 transition-transform">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🎯</div>
            <h3 className="text-2xl font-black">Misi Kami</h3>
            <p className="opacity-90 leading-relaxed">
              Memberikan pendampingan gizi berbasis bukti ilmiah (evidence-based) yang mudah diterapkan dalam kehidupan sehari-hari tanpa ketergantungan pada obat-obatan atau suplemen.
            </p>
          </Card>
          <Card className="p-10 space-y-4 border-none bg-gray-900 text-white shadow-xl transform hover:-translate-y-2 transition-transform">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">👁️</div>
            <h3 className="text-2xl font-black">Visi Kami</h3>
            <p className="opacity-90 leading-relaxed">
              Menjadi platform konsultasi gizi terpercaya nomor satu di Indonesia yang mampu mengubah gaya hidup masyarakat menjadi lebih bugar, bahagia, dan berumur panjang.
            </p>
          </Card>
        </div>
      </section>

      {/* TRUST NUMBERS */}
      <section className="py-20 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {stat.icon}
                </div>
                <h4 className="text-3xl font-black text-gray-900">{stat.value}</h4>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUTRITIONIST TEAM */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Tim Ahli Gizi Profesional</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Konsultasi kamu ditangani langsung oleh tenaga kesehatan profesional yang memiliki Surat Tanda Registrasi (STR) aktif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {nutritionists.map((nutri, i) => (
              <Card key={i} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all">
                <div className="h-64 bg-gray-100 relative">
                  {/* Photo Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FiUsers size={64} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <Link href={`/ahli-gizi/${nutri.slug}`} className="w-full">
                      <button className="w-full py-2 bg-white text-gray-900 rounded-lg font-bold text-sm">Lihat Profil Lengkap</button>
                    </Link>
                  </div>
                </div>
                <div className="p-6 text-center space-y-2">
                  <h4 className="text-lg font-black text-gray-900">{nutri.name}</h4>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{nutri.title}</p>
                  <p className="text-sm text-gray-500">{nutri.specialty}</p>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">STR: {nutri.str}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* LEGALITY */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto max-w-6xl px-6 text-center space-y-12">
          <h3 className="text-2xl font-black text-gray-900 italic opacity-50 uppercase tracking-[0.2em]">Terakreditasi & Terpercaya</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-60">
            {/* Mock logos */}
            <div className="text-xl font-black">MTKI</div>
            <div className="text-xl font-black">PERSAGI</div>
            <div className="text-xl font-black">KOMINFO</div>
            <div className="text-xl font-black">PSE</div>
          </div>
          <div className="pt-8 space-y-2">
            <p className="text-sm font-bold text-gray-700">PT. NutriPro Diet Care Indonesia</p>
            <p className="text-xs text-gray-400">NIB: 1234567890123 | Terdaftar di Kementerian Hukum dan HAM</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
