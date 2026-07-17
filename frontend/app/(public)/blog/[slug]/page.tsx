'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft, FiCalendar, FiUser, FiTag,
  FiAlertCircle, FiBookOpen, FiShare2, FiClock, FiChevronRight, FiCheckCircle
} from 'react-icons/fi';
import { buildApiUrl } from '@/lib/url';
import { Button } from '@/components/ui/Button';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
interface BlogDetail {
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

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function renderContent(html: string) {
  const hasHtml = /<[a-z][\s\S]*>/i.test(html);
  if (!hasHtml) {
    return html.split(/\n\n+/).map((para, i) => (
      <p key={i} className="mb-6 leading-[1.8] text-[var(--muted-foreground)] text-lg">
        {para}
      </p>
    ));
  }
  return (
    <div
      className="prose prose-slate prose-lg max-w-none 
      prose-headings:text-[var(--foreground)] prose-headings:font-black prose-headings:tracking-tight
      prose-p:text-[var(--muted-foreground)] prose-p:leading-relaxed
      prose-strong:text-[var(--foreground)] prose-strong:font-bold
      prose-img:rounded-[2rem] prose-img:shadow-xl
      prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
      prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:bg-green-50 dark:prose-blockquote:bg-green-900/20 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ───────────────────────────────────────────────
// Loading Skeleton
// ───────────────────────────────────────────────
function BlogDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="h-[60vh] bg-[var(--background-soft)]" />
      <div className="container mx-auto max-w-3xl px-6 space-y-8">
        <div className="flex gap-4">
          <div className="h-4 w-24 bg-[var(--background-soft)] rounded-full" />
          <div className="h-4 w-24 bg-[var(--background-soft)] rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-[var(--border-color)] rounded-2xl" />
          <div className="h-12 w-3/4 bg-[var(--border-color)] rounded-2xl" />
        </div>
        <div className="space-y-4 pt-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-[var(--background-soft)] rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Page Component
// ───────────────────────────────────────────────
export default function BlogDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';

  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setError(false);

    fetch(buildApiUrl(`/public/blogs/${slug}`))
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        if (data) setPost(data.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (loading || notFound || error || !post) return;

    const ctx = gsap.context(() => {
      // Hero elements
      const heroElements = heroRef.current?.querySelectorAll('.hero-anim');
      if (heroElements) {
        gsap.fromTo(heroElements, {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.2
        });
      }

      // Intro box
      gsap.fromTo(introRef.current, {
        opacity: 0,
        x: -20
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: introRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Content
      gsap.fromTo(contentRef.current, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Sidebar
      gsap.fromTo(sidebarRef.current, {
        opacity: 0,
        x: 20
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sidebarRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // Bottom CTA
      gsap.fromTo(bottomRef.current, {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: bottomRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    return () => ctx.revert();
  }, [loading, notFound, error, post]);

  if (loading) return <main className="min-h-screen bg-[var(--background)]"><BlogDetailSkeleton /></main>;

  if (notFound || error || !post) {
    return (
      <main className="min-h-screen bg-[var(--background)] pt-40 pb-24 flex flex-col items-center justify-center gap-8 text-center px-6">
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center ${notFound ? 'bg-[var(--background-soft)] text-[var(--border-color)]' : 'bg-red-500/10 text-red-500'}`}>
          {notFound ? <FiBookOpen size={48} /> : <FiAlertCircle size={48} />}
        </div>
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] mb-4">
            {notFound ? 'Artikel Tidak Ditemukan' : 'Terjadi Kesalahan'}
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-sm mx-auto text-lg">
            {notFound ? 'Artikel yang Anda cari tidak tersedia atau telah dipindahkan.' : 'Gagal memuat artikel. Silakan coba beberapa saat lagi.'}
          </p>
        </div>
        <Link href="/blog">
          <Button variant="outline" className="h-14 px-10 rounded-2xl font-bold">
            <FiArrowLeft className="mr-2" /> Kembali ke Blog
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-32 relative overflow-hidden transition-colors duration-500">
      <Scene3DBackground subtle />

      {/* ── Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 z-50 origin-left" />

      {/* ── Hero Section ── */}
      <section ref={heroRef} className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-slate-900">
        {(post.image_url || post.images?.[0]) ? (
          <Image
            src={post.image_url || post.images[0]}
            alt={post.title}
            fill
            className="object-cover opacity-60 scale-105"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-20">
          <div className="container mx-auto max-w-4xl px-6">
            <div>
              <div className="hero-anim flex items-center gap-3 mb-8">
                <span className="px-4 py-1.5 rounded-full bg-green-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20">
                  {post.category}
                </span>
                <span className="flex items-center gap-2 text-white/70 text-sm font-bold">
                  <FiClock className="text-green-400" /> 5 Menit Baca
                </span>
              </div>
              <h1 className="hero-anim text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-10">
                {post.title}
              </h1>

              <div className="hero-anim flex items-center justify-between py-8 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-xl">
                    {post.author?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">{post.author?.name || 'DietCare Expert'}</p>
                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest">{formatDate(post.published_at)}</p>
                  </div>
                </div>
                <button className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all group">
                  <FiShare2 size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Back Button */}
        <div className="absolute top-32 left-6 lg:left-12 z-10">
          <Link href="/blog">
            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-sm hover:bg-white hover:text-slate-900 transition-all group">
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Kembali ke Blog
            </button>
          </Link>
        </div>
      </section>

      {/* ── Content Area ── */}
      <div className="container mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16">
          <article className="pt-20">
            {/* Intro / Summary box */}
            <div
              ref={introRef}
              className="p-8 md:p-10 bg-[var(--background-soft)] rounded-[2.5rem] mb-16 border border-[var(--border-color)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
              <h3 className="text-xl font-black text-[var(--foreground)] mb-4 flex items-center gap-3">
                <FiCheckCircle className="text-green-600" /> Ringkasan Artikel
              </h3>
              <p className="text-[var(--muted-foreground)] text-lg leading-relaxed italic">
                &quot;Edukasi gizi yang tepat adalah kunci transformasi kesehatan yang berkelanjutan. Dalam artikel ini, kami membahas strategi praktis untuk mengoptimalkan pola makan Anda.&quot;
              </p>
            </div>

            <div ref={contentRef}>
              {renderContent(post.content)}
            </div>

            {/* Tags / Meta bottom */}
            <div className="mt-20 pt-10 border-t border-[var(--border-color)] flex flex-wrap gap-3">
              <span className="text-[var(--border-color)] font-black uppercase tracking-widest text-[10px] w-full mb-2">Topik Terkait</span>
              {['Kesehatan', 'Nutrisi', post.category, 'Gaya Hidup'].map(tag => (
                <span key={tag} className="px-5 py-2 rounded-xl bg-[var(--background-soft)] text-[var(--muted-foreground)] text-sm font-bold border border-[var(--border-color)]">
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar - Sticky info */}
          <aside ref={sidebarRef} className="hidden lg:block pt-20">
            <div className="sticky top-40 space-y-10 w-64">
              <div className="p-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2.5rem] text-white shadow-2xl shadow-green-500/20">
                <h4 className="text-xl font-black mb-4 leading-tight">Siap Untuk Perubahan?</h4>
                <p className="text-green-50 text-sm mb-8 leading-relaxed">Dapatkan konsultasi personal dengan tim ahli gizi DietCare.</p>
                <Link href="/register">
                  <Button className="w-full bg-white text-green-600 hover:bg-green-50 h-14 rounded-2xl font-black text-sm">
                    Mulai Sekarang
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">Bagikan Artikel</h4>
                <div className="flex flex-col gap-3">
                  {['WhatsApp', 'Twitter', 'Facebook'].map(platform => (
                    <button key={platform} className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[var(--background-soft)] text-[var(--foreground)] font-bold text-sm hover:bg-[var(--background-elevated)] transition-colors group">
                      {platform} <FiChevronRight className="text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA / Author Bio */}
        <div
          ref={bottomRef}
          className="mt-32 p-10 md:p-16 bg-slate-900 rounded-[3.5rem] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-4xl mx-auto mb-10">
              {post.author?.name?.charAt(0) || 'D'}
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Ditulis oleh {post.author?.name || 'Tim DietCare'}</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Tim ahli gizi DietCare berdedikasi untuk memberikan informasi kesehatan berbasis bukti ilmiah (science-based) yang mudah dipahami dan dipraktikkan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ahli-gizi">
                <Button className="h-16 px-12 rounded-[1.25rem] bg-green-600 hover:bg-green-700 font-black text-lg shadow-2xl shadow-green-500/20">
                  Konsultasi Gratis
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" className="h-16 px-10 text-white hover:bg-white/10 font-black text-lg">
                  Baca Artikel Lainnya
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
