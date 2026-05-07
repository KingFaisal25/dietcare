'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, FiCheckCircle, FiStar, FiUsers, 
  FiCalendar, FiMessageCircle, FiTrendingDown, FiShield, FiPlay,
  FiTarget, FiAward, FiBookOpen, FiClock, FiAlertCircle
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
  
  useEffect(() => {
    fetch(buildApiUrl('/public/nutritionists'))
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => setNutritionists(data.data?.slice?.(0, 6) || []))
      .catch(err => console.error('Fetch error:', err));
  }, []);

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
    <main className="min-h-screen overflow-hidden ui-surface-3d text-white">
      <Scene3DBackground />
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" 
          style={{ backgroundImage: 'radial-gradient(#16a361 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-50 to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content (55%) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-[55%] space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Badge variant="success" className="py-1.5 px-4 bg-brand-50 text-brand-600 border border-brand-100 animate-pulse">
                  <FiCheckCircle className="mr-2" /> Dipercaya 10.000+ Klien
                </Badge>
              </motion.div>

              <h1 className="text-5xl lg:text-[64px] font-black leading-[1.1] text-white tracking-tight">
                Transformasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Gizi</span> Anda Bersama Ahli Terbaik.
              </h1>

              <p className="text-lg lg:text-xl text-slate-300 max-w-[480px] leading-relaxed">
                Capai target kesehatan ideal melalui program diet personal yang dirancang khusus oleh ahli gizi tersertifikasi.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-10 font-bold group">
                    Mulai Konsultasi <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/harga">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto font-bold border border-neutral-200">
                    Lihat Program
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-neutral-100">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="User" 
                        width={40} 
                        height={40} 
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center text-yellow-500 gap-0.5">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                  </div>
                  <p className="text-slate-300 font-medium">
                    <span className="text-white font-bold">4.9 ★</span> dari 2.300+ ulasan
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual (45%) */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:w-[45%] relative"
            >
              {/* Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
              
              {/* Mockup Dashboard */}
              <div className="relative bg-white rounded-3xl shadow-modal border border-neutral-100 overflow-hidden aspect-[4/3] w-full">
                <div className="bg-neutral-50 h-8 flex items-center px-4 gap-1.5 border-b border-neutral-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="p-6 space-y-6">
                  <div className="h-4 w-1/3 bg-neutral-100 rounded-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-brand-50 rounded-2xl p-4 flex flex-col justify-end gap-2">
                      <div className="h-2 w-1/2 bg-brand-200 rounded-full" />
                      <div className="h-4 w-3/4 bg-brand-500 rounded-full" />
                    </div>
                    <div className="h-24 bg-blue-50 rounded-2xl p-4 flex flex-col justify-end gap-2">
                      <div className="h-2 w-1/2 bg-blue-200 rounded-full" />
                      <div className="h-4 w-3/4 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-neutral-100 rounded-full" />
                    <div className="h-3 w-5/6 bg-neutral-100 rounded-full" />
                    <div className="h-3 w-4/6 bg-neutral-100 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-8 bg-white p-4 rounded-2xl shadow-float border border-brand-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <FiTrendingDown size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-400">Pencapaian</p>
                  <p className="text-sm font-bold text-white">✓ Berat Turun 5kg</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-6 -right-4 bg-white p-4 rounded-2xl shadow-float border border-neutral-100 flex flex-col items-center gap-2"
              >
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-neutral-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-brand-500" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">75%</div>
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kalori</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FITUR UNGGULAN */}
      <section className="py-24 bg-transparent px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Mengapa Kami</h2>
            <h3 className="text-4xl font-black text-white leading-tight">Pendekatan Modern untuk Hasil Maksimal</h3>
            <p className="text-slate-300 font-medium">Kami menggabungkan ilmu gizi dengan teknologi terkini untuk memberikan pengalaman terbaik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FiUsers />, title: 'Ahli Gizi Tersertifikasi', desc: 'Konsultasi langsung dengan lulusan Gizi berpengalaman dan bersertifikat STR.' },
              { icon: <FiCalendar />, title: 'Program Terpersonalisasi', desc: 'Program makan yang disusun khusus sesuai profil kesehatan dan target Anda.' },
              { icon: <FiMessageCircle />, title: 'Dukungan Chat 24/7', desc: 'Tanya jawab seputar nutrisi kapan saja melalui aplikasi web kami.' },
              { icon: <FiShield />, title: 'Berdasarkan Sains', desc: 'Metode yang kami gunakan terbukti secara ilmiah tanpa obat diet berbahaya.' },
              { icon: <FiTrendingDown />, title: 'Pelacakan Progress', desc: 'Visualisasikan perjalanan kesehatan Anda dengan grafik progres mingguan.' },
              { icon: <FiPlay />, title: 'Edukasi Berkelanjutan', desc: 'Dapatkan akses ke ratusan artikel dan tips kesehatan eksklusif.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="group"
              >
                <TiltCard className="glass-panel rounded-[2rem] p-8 border border-white/15 h-full">
                  <div className="w-14 h-14 bg-emerald-500/15 text-emerald-300 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-spring">
                    {React.cloneElement(feature.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARA KERJA (TIMELINE) */}
      <section className="py-24 bg-transparent px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Alur Konsultasi</h2>
            <h3 className="text-4xl font-black text-white">Cara Memulai Perjalanan Anda</h3>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-brand-200 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {[
                { step: '01', icon: <FiTarget />, title: 'Analisis Awal', desc: 'Lengkapi profil kesehatan dan tentukan target Anda.' },
                { step: '02', icon: <FiCalendar />, title: 'Pilih Jadwal', desc: 'Tentukan waktu konsultasi dengan ahli gizi pilihan.' },
                { step: '03', icon: <FiMessageCircle />, title: 'Konsultasi Aktif', desc: 'Diskusi mendalam dan penyusunan meal plan personal.' },
                { step: '04', icon: <FiAward />, title: 'Hasil Terukur', desc: 'Monitoring rutin dan raih target kesehatan ideal.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center text-xl font-black shadow-green">
                    {item.step}
                  </div>
                    <div className="glass-panel p-6 rounded-3xl border border-white/15 shadow-card w-full">
                    <div className="text-brand-500 mb-4 flex justify-center">{React.cloneElement(item.icon as React.ReactElement, { size: 28 })}</div>
                      <h4 className="font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION PROGRAM (GRADIENT CARDS) */}
      <section className="py-24 bg-transparent px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Pilihan Program</h2>
              <h3 className="text-4xl font-black text-white">Solusi Gizi untuk Setiap Tahapan Hidup</h3>
            </div>
            <Link href="/harga">
              <Button variant="secondary" className="font-bold">Lihat Semua Program <FiArrowRight className="ml-2" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-x-auto no-scrollbar pb-4">
            {[
              { 
                name: 'Body Goals', 
                desc: 'Fokus pada penurunan berat badan secara sehat tanpa rasa lapar berlebih.', 
                price: 'Rp 299rb', 
                gradient: 'from-green-500 to-brand-700',
                badge: 'Terlaris'
              },
              { 
                name: 'Body for Baby', 
                desc: 'Nutrisi optimal untuk masa kehamilan dan pasca melahirkan (menyusui).', 
                price: 'Rp 349rb', 
                gradient: 'from-blue-500 to-indigo-700',
                badge: 'Populer'
              },
              { 
                name: 'Clinicare', 
                desc: 'Manajemen diet khusus untuk kondisi medis (Diabetes, Hipertensi, PCOS).', 
                price: 'Rp 399rb', 
                gradient: 'from-orange-500 to-red-700',
                badge: 'Baru'
              },
            ].map((program, i) => (
              <TiltCard key={i} className={`group relative min-h-[420px] overflow-hidden p-8 flex flex-col justify-end text-white border-none shadow-xl duration-spring rounded-2xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} z-0`} />
                {/* Abstract Pattern overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0" 
                  style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 24px' }} 
                />
                
                <div className="relative z-10 space-y-6">
                  {program.badge && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                      {program.badge}
                    </span>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black tracking-tight">{program.name}</h4>
                    <p className="text-white/80 text-sm leading-relaxed">{program.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-white/60">Mulai dari</p>
                      <p className="text-xl font-black">{program.price}</p>
                    </div>
                    <Button variant="secondary" className="rounded-full w-12 h-12 p-0 group-hover:w-auto group-hover:px-6 transition-all duration-spring overflow-hidden">
                      <span className="hidden group-hover:inline mr-2 whitespace-nowrap">Detail</span>
                      <FiArrowRight />
                    </Button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL (MARQUEE) */}
      <section className="py-24 bg-transparent overflow-hidden">
        <div className="container mx-auto max-w-7xl px-6 mb-16 text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Testimoni</h2>
          <h3 className="text-4xl font-black text-white">Kata Mereka yang Telah Berhasil</h3>
        </div>

        <div className="space-y-8">
          {/* Row 1: Left to Right */}
          <div className="flex animate-marquee-slow hover:pause whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="inline-block mx-4 w-[380px] whitespace-normal">
                <Card className="p-6 glass-panel border border-white/15 shadow-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
                      <Image src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" width={48} height={48} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">Sari Rahmawati</h5>
                      <div className="flex text-yellow-500 text-xs">
                        {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className="fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed italic">
                    &quot;Awalnya ragu, tapi setelah 1 bulan ikut program Body Goals, berat turun 4kg dan badan terasa jauh lebih ringan. Ahli gizinya sangat ramah!&quot;
                  </p>
                </Card>
              </div>
            ))}
          </div>

          {/* Row 2: Right to Left */}
          <div className="flex animate-marquee-slow-reverse hover:pause whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="inline-block mx-4 w-[380px] whitespace-normal">
                <Card className="p-6 glass-panel border border-white/15 shadow-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
                      <Image src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="User" width={48} height={48} />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">Budi Santoso</h5>
                      <div className="flex text-yellow-500 text-xs">
                        {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className="fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed italic">
                    &quot;Menu makannya tidak membosankan dan sangat fleksibel. Sangat membantu untuk saya yang sibuk kerja kantoran.&quot;
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ARTIKEL BLOG */}
      <section className="py-24 bg-transparent px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-3 text-center lg:text-left">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Artikel &amp; Tips</h2>
              <h3 className="text-4xl font-black text-white leading-tight">
                Inspirasi Hidup Sehat Terkini
              </h3>
              <p className="text-slate-300 font-medium max-w-md">
                Temukan artikel gizi, resep sehat, dan tips diet terbaru dari ahli kami.
              </p>
            </div>
            <Link href="/blog">
              <Button variant="secondary" className="font-bold shrink-0">
                Semua Artikel <FiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Loading state */}
          {blogsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-3xl bg-neutral-100 animate-pulse ${i === 0 ? 'md:col-span-3 h-72' : 'h-64'}`}
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {!blogsLoading && blogsError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <FiAlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-slate-300 font-medium">Gagal memuat artikel. Silakan coba lagi nanti.</p>
            </div>
          )}

          {/* Empty state */}
          {!blogsLoading && !blogsError && blogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                <FiBookOpen className="w-8 h-8 text-brand-300" />
              </div>
              <p className="text-slate-300 font-medium">Belum ada artikel yang dipublikasikan.</p>
            </div>
          )}

          {/* Articles grid */}
          {!blogsLoading && !blogsError && blogs.length > 0 && (() => {
            const [featured, ...rest] = blogs;
            const formatDate = (iso: string | null) =>
              iso
                ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : '';

            return (
              <div className="space-y-6">
                {/* Featured card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${featured.slug}`} className="group block">
                    <div className="relative rounded-3xl overflow-hidden bg-neutral-900 min-h-[320px] flex flex-col justify-end shadow-xl hover:shadow-2xl transition-shadow">
                      {(featured.image_url || featured.images?.[0]) ? (
                        <Image
                          src={featured.image_url || featured.images[0]}
                          alt={featured.title}
                          fill
                          className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                          sizes="(max-width: 768px) 100vw, 80vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="relative z-10 p-8 md:p-10 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-brand-500/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest">
                            {featured.category}
                          </span>
                          <span className="flex items-center gap-1 text-white/60 text-xs">
                            <FiClock size={11} /> {formatDate(featured.published_at)}
                          </span>
                        </div>
                        <h4 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                          {featured.title}
                        </h4>
                        <p className="text-white/70 text-sm line-clamp-2 max-w-2xl">
                          {featured.content?.replace(/<[^>]*>/g, '').slice(0, 160)}…
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          {featured.author && (
                            <span className="text-white/60 text-xs font-medium">
                              oleh {featured.author.name}
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-1 text-brand-300 text-xs font-bold group-hover:gap-2 transition-all">
                            Baca Selengkapnya <FiArrowRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Grid of remaining articles */}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}
                      >
                        <Link href={`/blog/${post.slug}`} className="group block h-full">
                          <Card className="h-full overflow-hidden border border-neutral-100 shadow-card hover:shadow-float transition-all bg-white rounded-3xl flex flex-col p-0">
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-neutral-100 overflow-hidden rounded-t-3xl shrink-0">
                              {(post.image_url || post.images?.[0]) ? (
                                <Image
                                  src={post.image_url || post.images[0]}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  unoptimized
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                                  <FiBookOpen className="w-10 h-10 text-brand-300" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3">
                                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-brand-600 text-[10px] font-black uppercase tracking-widest border border-brand-100">
                                  {post.category}
                                </span>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col flex-1 p-5 space-y-3">
                              <h4 className="font-black text-white leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
                                {post.title}
                              </h4>
                              <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 flex-1">
                                {post.content?.replace(/<[^>]*>/g, '').slice(0, 120)}…
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-neutral-50 text-xs text-neutral-400">
                                <div className="flex items-center gap-1">
                                  <FiClock size={11} />
                                  <span>{formatDate(post.published_at)}</span>
                                </div>
                                {post.author && (
                                  <span className="font-medium truncate max-w-[100px]">{post.author.name}</span>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. AHLI GIZI SECTION */}

      <section className="py-24 bg-transparent px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Tim Pakar</h2>
            <h3 className="text-4xl font-black text-white">Konsultasi dengan Ahli Pilihan</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {nutritionists.map((nut) => (
              <motion.div
                key={nut.id}
                className="group flex flex-col items-center text-center space-y-4"
              >
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-card">
                  <Image 
                    src={nut.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nut.name)}&background=f0fdf6&color=16a361&size=200`}
                    alt={nut.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-brand-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                    <Link href={`/ahli-gizi/${nut.slug}`}>
                      <Button size="sm" variant="secondary" className="rounded-full font-bold text-[10px]">Profil</Button>
                    </Link>
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-white truncate w-full px-2">{nut.name}</h5>
                  <p className="text-brand-600 text-xs font-bold">{nut.title || 'Ahli Gizi'}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/ahli-gizi">
              <Button size="lg" variant="outline" className="font-bold border-brand-500 text-brand-600">
                Lihat Semua Tim <FiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="bg-brand-600 p-12 lg:p-20 text-center text-white border-none shadow-green overflow-hidden relative rounded-[3rem]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
            <div className="relative z-10 space-y-8">
              <h3 className="text-4xl lg:text-5xl font-black leading-tight">Siap Untuk Hidup Lebih Sehat?</h3>
              <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
                Daftar sekarang dan dapatkan sesi analisis gizi pertama secara gratis. Mulai transformasi Anda hari ini.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 border-none px-12 font-black shadow-xl">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/harga">
                  <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10 px-12 font-black">
                    Lihat Harga
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-slow {
          animation: marquee 40s linear infinite;
          width: fit-content;
        }
        .animate-marquee-slow-reverse {
          animation: marquee-reverse 40s linear infinite;
          width: fit-content;
        }
        .pause {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
