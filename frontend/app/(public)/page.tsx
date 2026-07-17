'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiCheckCircle, FiStar, FiUsers,
  FiCalendar, FiMessageCircle, FiTrendingDown, FiShield, FiPlay,
  FiTarget, FiAward, FiBookOpen, FiClock, FiAlertCircle, FiActivity
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { buildApiUrl } from '@/lib/url';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';

interface PublicBlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  image_url: string | null;
  images: string[];
  published_at: string | null;
  author: { name: string } | null;
}

interface HomeNutritionist {
  id: number;
  name: string;
  slug: string;
  title: string | null;
  photo: string | null;
}

export default function HomePage() {
  const [nutritionists, setNutritionists] = useState<HomeNutritionist[]>([]);
  const [blogs, setBlogs] = useState<PublicBlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(false);
  const [nutritionistsError, setNutritionistsError] = useState(false);

  useEffect(() => {
    setNutritionistsError(false);
    fetch(buildApiUrl('/public/nutritionists'))
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => {
        // Backend returns { success, message, data: { items: [...], total, filters } }
        const items = data.data?.items || [];
        setNutritionists(items.slice(0, 6));
      })
      .catch(err => {
        console.warn('Nutritionist list unavailable:', err);
        setNutritionistsError(true);
      });
  }, []);

  const testimonials = [
    { name: 'Sari Rahmawati', role: 'Program Body Goals', quote: 'Setelah 1 bulan, berat turun 4 kg dan badan terasa jauh lebih ringan. Ahli gizinya sangat suportif!', image: 21 },
    { name: 'Dimas Pratama', role: 'Konsultasi Gizi', quote: 'Saya jadi lebih paham cara mengatur porsi makan tanpa merasa harus mengikuti diet yang menyiksa.', image: 12 },
    { name: 'Nadia Putri', role: 'Meal Plan Personal', quote: 'Menu yang diberikan praktis dan sesuai kebiasaan saya. Perubahan kecilnya terasa nyata setiap minggu.', image: 32 },
  ];

  useEffect(() => {
    setBlogsLoading(true);
    setBlogsError(false);
    fetch(buildApiUrl('/public/blogs?limit=7'))
      .then(res => {
        if (!res.ok) throw new Error('Blog fetch failed');
        return res.json();
      })
      .then(data => setBlogs(data.data || []))
      .catch(() => setBlogsError(true))
      .finally(() => setBlogsLoading(false));
  }, []);


  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <Scene3DBackground subtle />
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* ===== FRUIT BACKGROUND — fills right 70% of hero, fades left ===== */}
        <div
          className="absolute top-0 right-0 h-full pointer-events-none"
          style={{
            width: '70%',
            backgroundImage: "url('/api/local-image?file=bg%201.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          {/* Left gradient fade — dissolves fruit into white near text */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 15%, rgba(255,255,255,0.1) 38%, transparent 60%)' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 22%)' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 22%, transparent 45%)' }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-[55%] space-y-8 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
                  <FiCheckCircle className="inline mr-2" /> Dipercaya 10.000+ Klien
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-[72px] font-black leading-[1.05] text-slate-900 tracking-tighter">
                Transformasi <span className="text-green-600">Kesehatan</span> Anda Bersama Ahli Gizi.
              </h1>

              <p className="text-lg lg:text-xl text-slate-500 max-w-[540px] leading-relaxed mx-auto lg:mx-0 font-medium">
                Capai target tubuh ideal melalui program nutrisi personal yang dirancang khusus oleh ahli gizi tersertifikasi.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link href="/kalkulator-gratis">
                  <Button size="xl" className="w-full sm:w-auto px-12 font-black group shadow-2xl shadow-green-900/20">
                    Coba Kalkulator Gratis <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/ahli-gizi">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto px-10 font-black border-slate-100">
                    Konsultasi Ahli Gizi
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-slate-50">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: FiCheckCircle, title: 'Gratis dicoba', text: 'Tanpa login' },
                    { icon: FiShield, title: 'Privasi aman', text: 'Data seperlunya' },
                    { icon: FiActivity, title: 'Praktis', text: 'Mudah dipahami' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-2xl border border-slate-100 bg-white/75 p-3 shadow-sm">
                      <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                      <p className="mt-2 text-[11px] font-black text-slate-900">{title}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start text-amber-400 gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className="fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    <span className="text-slate-900 font-black">4.9 ★</span> dari 2.300+ Klien Puas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual — Doctor photo + Stat Card below */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="lg:w-[45%] flex flex-col items-center justify-end gap-4"
            >
              <div className="relative w-full max-w-[440px] rounded-[2.5rem] border border-white/80 bg-white/65 p-4 shadow-[0_24px_70px_rgba(22,163,74,.16)] backdrop-blur-2xl sm:p-6">
                <div className="absolute -right-3 top-8 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-lg">Gratis · Tanpa login</div>
                <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-emerald-100">Ringkasan kesehatan</p><p className="mt-1 text-xl font-black">Langkah pertamamu</p></div><FiActivity className="h-8 w-8 text-emerald-100" aria-hidden="true" /></div>
                  <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/15 p-4 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">BMI</p><p className="mt-2 text-3xl font-black">22.5</p><p className="mt-1 text-xs text-emerald-100">Seimbang</p></div><div className="rounded-2xl bg-white/15 p-4 backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Kalori</p><p className="mt-2 text-3xl font-black">2.100</p><p className="mt-1 text-xs text-emerald-100">kkal / hari</p></div></div>
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"><span className="text-xs font-bold text-emerald-100">Kebutuhan air</span><span className="text-sm font-black">2.4 L / hari</span></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4"><div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Insight personal</p><p className="mt-1 text-sm font-semibold text-slate-600">Hasil mudah dipahami dan bisa kamu jadikan langkah awal.</p></div><FiArrowRight className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /></div>
              </div>

              {/* Stat Card — directly below the photo */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-stretch justify-between rounded-2xl overflow-hidden whitespace-nowrap w-full max-w-[440px]"
                style={{
                  background: 'rgba(255,255,255,0.90)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 8px 32px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex-1 text-center py-4 px-3">
                  <p className="text-xl font-black text-green-600 leading-none">Gratis</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Mulai tanpa login</p>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                <div className="flex-1 text-center py-4 px-3">
                  <p className="text-xl font-black text-slate-800 leading-none">3 langkah</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Data ke insight</p>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                <div className="flex-1 text-center py-4 px-3">
                  <p className="text-xl font-black text-emerald-600 leading-none">24/7</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Akses kapan saja</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STARTING PATH */}
      <section className="relative overflow-hidden bg-emerald-50/60 px-6 py-20">
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Mulai dari sini</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Dari data sederhana menjadi langkah yang lebih jelas</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Tidak perlu menebak harus mulai dari mana. Ikuti alur singkat ini sesuai kebutuhanmu.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { number: '01', icon: FiActivity, title: 'Kenali kondisi tubuh', text: 'Gunakan kalkulator gratis untuk mendapatkan gambaran BMI, kalori, dan hidrasi.', href: '/kalkulator-gratis', action: 'Mulai cek gratis' },
              { number: '02', icon: FiTrendingDown, title: 'Pahami insight', text: 'Baca penjelasan hasil dan pilih kebiasaan kecil yang paling mungkin kamu jalankan.', href: '/blog', action: 'Baca panduan' },
              { number: '03', icon: FiMessageCircle, title: 'Dapatkan dukungan', text: 'Jika membutuhkan arahan personal, lanjutkan dengan konsultasi bersama ahli gizi.', href: '/ahli-gizi', action: 'Temukan ahli gizi' },
            ].map(({ number, icon: Icon, title, text, href, action }) => (
              <Link key={number} href={href} className="group rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                <div className="flex items-start justify-between"><span className="text-3xl font-black text-emerald-100 transition group-hover:text-emerald-200">{number}</span><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span></div>
                <h3 className="mt-7 text-xl font-black text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">{action} <FiArrowRight className="transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FITUR UNGGULAN */}
      <section className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
              Keunggulan DietCare
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Pendekatan Modern untuk <br /> <span className="text-green-600">Hasil yang Maksimal</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">Kami menggabungkan ilmu gizi terkini dengan teknologi untuk pengalaman transformasi kesehatan terbaik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <FiUsers />, title: 'Ahli Gizi Berlisensi', desc: 'Konsultasi personal bersama lulusan Gizi berpengalaman yang memiliki STR resmi.', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: <FiCalendar />, title: 'Meal Plan Kustom', desc: 'Penyusunan menu makan yang dipersonalisasi sesuai kondisi kesehatan dan target Anda.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: <FiMessageCircle />, title: 'Dukungan Chat 24/7', desc: 'Akses tanya jawab gizi kapan saja melalui platform interaktif kami.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: <FiShield />, title: 'Metode Science-Based', desc: 'Program yang disusun berdasarkan bukti ilmiah tanpa penggunaan obat diet berbahaya.', color: 'text-red-600', bg: 'bg-red-50' },
              { icon: <FiTrendingDown />, title: 'Pelacakan Visual', desc: 'Pantau perkembangan tubuh Anda melalui dashboard analitik yang intuitif.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: <FiPlay />, title: 'Edukasi Eksklusif', desc: 'Akses materi edukasi, resep sehat, dan tips gaya hidup dari tim ahli kami.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="group"
              >
                <TiltCard className="bg-white rounded-[2.5rem] p-10 border border-slate-100 h-full shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-500">
                  <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-4 group-hover:text-green-700 transition-colors">{feature.title}</h4>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">{feature.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARA KERJA */}
      <section className="py-24 bg-slate-50/50 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-24 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-slate-200">
              Alur Konsultasi
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">4 Langkah Menuju <span className="text-green-600">Tubuh Ideal</span></h2>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-slate-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-10 relative z-10">
              {[
                { step: '01', icon: <FiTarget />, title: 'Analisis Profil', desc: 'Lengkapi data kesehatan dan tentukan target ideal Anda.' },
                { step: '02', icon: <FiCalendar />, title: 'Atur Jadwal', desc: 'Pilih waktu konsultasi yang sesuai dengan agenda Anda.' },
                { step: '03', icon: <FiMessageCircle />, title: 'Konsultasi Aktif', desc: 'Diskusi mendalam dan penyusunan strategi nutrisi personal.' },
                { step: '04', icon: <FiAward />, title: 'Hasil Terukur', desc: 'Monitoring berkala dan capai transformasi kesehatan Anda.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl shadow-green-900/20 mb-8 group-hover:rotate-12 transition-transform">
                    {item.step}
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm w-full group-hover:shadow-xl group-hover:border-green-100 transition-all duration-500">
                    <div className="text-green-600 mb-6 flex justify-center">{React.cloneElement(item.icon as React.ReactElement, { size: 32 })}</div>
                    <h4 className="text-lg font-black text-slate-900 mb-3">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION KALKULATOR GRATIS (Viral Marketing CTA) */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 to-slate-900 px-6 relative overflow-hidden text-white">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800/50 text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-emerald-700/50 backdrop-blur-md">
                100% Gratis Tanpa Login
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Cek Kesehatanmu <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Dalam 30 Detik!
                </span>
              </h2>
              <p className="text-emerald-100/80 text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                Gunakan 8+ fitur kalkulator gizi pintar kami. Hitung BMI, TDEE, kalori terbakar, jadwal puasa, hingga menu diet sesuai budget.
              </p>

              <div className="grid grid-cols-2 gap-4 text-emerald-200 text-sm font-semibold max-w-md mx-auto lg:mx-0 pt-4">
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> BMI & TDEE</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Menu 3 Hari</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Kebutuhan Air</div>
                <div className="flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Usia Tubuh</div>
              </div>

              <div className="pt-8">
                <Link href="/kalkulator-gratis">
                  <Button variant="white" size="xl" className="px-10 font-black text-emerald-900 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
                    Coba Kalkulator Sekarang <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full max-w-lg mx-auto">
              <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-emerald-900/50 bg-white/5 backdrop-blur-xl p-8 aspect-square flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="w-32 h-32 mb-8 relative">
                   <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[40px] opacity-50 animate-pulse" />
                   <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-emerald-900/50 border border-white/20 relative z-10">
                      <FiActivity className="text-white w-16 h-16 -rotate-12" />
                   </div>
                </div>
                <h3 className="text-2xl font-black mb-2">Smart Tools</h3>
                <p className="text-emerald-200/70 text-center font-medium px-4">
                  Didukung oleh algoritma gizi terbaru untuk hasil yang akurat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION PROGRAM */}
      <section className="py-32 bg-white px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
                Program DietCare
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Solusi Gizi untuk <span className="text-green-600">Setiap Tahapan</span></h2>
            </div>
            <Link href="/harga">
              <Button variant="secondary" size="lg" className="font-black">Lihat Semua Program <FiArrowRight className="ml-2" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: 'Body Goals',
                desc: 'Fokus pada penurunan atau peningkatan berat badan secara sehat tanpa rasa lapar berlebih.',
                price: 'Rp 299rb',
                color: 'bg-green-600',
                badge: 'Terlaris',
                icon: <FiTarget size={32} />
              },
              {
                name: 'Body for Baby',
                desc: 'Nutrisi optimal untuk persiapan kehamilan, masa kehamilan, dan pasca melahirkan (ASI).',
                price: 'Rp 349rb',
                color: 'bg-blue-600',
                badge: 'Populer',
                icon: <FiCheckCircle size={32} />
              },
              {
                name: 'Clinicare',
                desc: 'Manajemen diet terapeutik untuk kondisi medis khusus seperti Diabetes, Hipertensi, dan PCOS.',
                price: 'Rp 399rb',
                color: 'bg-red-500',
                badge: 'Specialist',
                icon: <FiActivity size={32} />
              },
            ].map((program, i) => (
              <TiltCard key={i} className={`group relative min-h-[480px] rounded-[3rem] overflow-hidden p-10 flex flex-col justify-end text-white border-none shadow-2xl transition-all duration-500`}>
                <div className={`absolute inset-0 ${program.color} z-0`} />
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0"
                  style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 24px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0" />

                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                      {program.icon}
                    </div>
                    {program.badge && (
                      <span className="inline-block px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                        {program.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-3xl font-black tracking-tight">{program.name}</h4>
                    <p className="text-white/90 text-base leading-relaxed font-medium">{program.desc}</p>
                  </div>
                  <div className="pt-8 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Mulai dari</p>
                      <p className="text-2xl font-black">{program.price}</p>
                    </div>
                    <Link href={`/program/${program.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Button variant="white" size="md" className="rounded-2xl w-14 h-14 p-0 group-hover:w-auto group-hover:px-8 transition-all duration-500 overflow-hidden shadow-none">
                        <span className="hidden group-hover:inline mr-2 whitespace-nowrap">Detail</span>
                        <FiArrowRight size={20} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL */}
      <section className="py-24 bg-slate-50/50 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-6 mb-20 text-center space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-slate-200">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kisah Sukses <span className="text-green-600">Klien Kami</span></h2>
        </div>

        <div className="relative mx-auto max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
          <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused]" aria-label="Testimoni pengguna">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <article key={`${testimonial.name}-${index}`} className="mx-3 w-[min(86vw,390px)] shrink-0 rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:mx-4 sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl bg-emerald-50 ring-4 ring-emerald-50/70"><Image src={`https://i.pravatar.cc/100?img=${testimonial.image}`} alt={`Foto ${testimonial.name}`} width={48} height={48} /></div>
                    <div><h5 className="font-black text-slate-900">{testimonial.name}</h5><p className="mt-0.5 text-xs font-semibold text-emerald-700">{testimonial.role}</p></div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">5.0</span>
                </div>
                <div className="mb-4 flex gap-0.5 text-amber-400" aria-label="Rating 5 dari 5">{[1, 2, 3, 4, 5].map((star) => <FiStar key={star} className="h-4 w-4 fill-current" aria-hidden="true" />)}</div>
                <p className="text-base font-medium leading-7 text-slate-600">“{testimonial.quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ARTIKEL BLOG */}
      <section className="py-32 bg-white px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
                Edukasi & Tips
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Inspirasi <span className="text-green-600">Hidup Sehat</span> Terkini</h2>
              <p className="text-slate-500 text-lg font-medium max-w-md">Pelajari tips gizi, resep sehat, dan panduan diet langsung dari para ahli.</p>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="font-black border-slate-100 shrink-0 shadow-sm">
                Lihat Semua Artikel <FiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Blogs grid */}
          {!blogsLoading && !blogsError && blogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {blogs.slice(0, 3).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <article className="h-full flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                      <div className="relative h-64 overflow-hidden bg-slate-50">
                        {post.image_url ? (
                          <Image src={post.image_url} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-50"><FiBookOpen className="w-16 h-16 text-green-200" /></div>
                        )}
                        <div className="absolute top-5 left-5">
                          <span className="px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-xl">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-10 flex flex-col flex-1">
                        <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-green-600 transition-colors line-clamp-2">{post.title}</h4>
                        <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                            <FiClock className="text-green-500" /> {new Date(post.published_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                          <span className="text-green-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Baca <FiArrowRight /></span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. AHLI GIZI SECTION */}
      <section className="py-24 bg-slate-50/50 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
              Tim Pakar Kami
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Konsultasi dengan <span className="text-green-600">Ahli Pilihan</span></h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">Didampingi oleh ahli gizi berlisensi yang siap membantu Anda mencapai target kesehatan dengan pendekatan berbasis sains.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {nutritionists.map((nut) => (
              <motion.div
                key={nut.id}
                whileHover={{ y: -10 }}
                className="group flex flex-col items-center text-center space-y-4"
              >
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src={nut.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nut.name)}&background=f0fdf6&color=16a361&size=200`}
                    alt={nut.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-green-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                    <Link href={`/ahli-gizi/${nut.slug}`}>
                      <Button size="sm" variant="white" className="rounded-full font-bold text-[10px]">Lihat Profil</Button>
                    </Link>
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 truncate w-full px-2">{nut.name}</h5>
                  <p className="text-green-600 text-xs font-black uppercase tracking-widest">{nut.title || 'Ahli Gizi'}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/ahli-gizi">
              <Button size="lg" variant="outline" className="font-black border-slate-200 hover:border-green-600 hover:text-green-600 transition-all">
                Lihat Semua Tim Pakar <FiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="relative bg-slate-900 rounded-[4rem] p-12 md:p-24 overflow-hidden text-center text-white shadow-2xl shadow-slate-200">
            <div className="absolute top-0 left-0 w-full h-full -z-10">
              <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-3xl mx-auto space-y-10 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">Siap Untuk Memulai <br /> <span className="text-green-500">Perubahan Anda?</span></h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed">Bergabunglah dengan ribuan orang lainnya yang telah berhasil mengubah gaya hidup menjadi lebih sehat dan bahagia bersama DietCare.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register">
                  <Button size="xl" className="w-full sm:w-auto px-12 font-black shadow-2xl shadow-green-900/40">Daftar Sekarang</Button>
                </Link>
                <Link href="/kalkulator-gratis">
                  <Button variant="ghost" size="xl" className="w-full sm:w-auto text-white hover:bg-white/10 font-black">🧮 Coba Kalkulator Gratis</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
