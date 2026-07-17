'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiArrowRight, FiBookOpen, FiClock, FiUser,
  FiAlertCircle, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiTrendingUp, FiHash
} from 'react-icons/fi';
import { buildApiUrl } from '@/lib/url';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
interface BlogPost {
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

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function excerpt(content: string, len = 130): string {
  const plain = content.replace(/<[^>]*>/g, '');
  return plain.length > len ? plain.slice(0, len) + '…' : plain;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[var(--background-elevated)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden animate-pulse shadow-sm">
      <div className="h-64 bg-[var(--background-soft)]" />
      <div className="p-8 space-y-4">
        <div className="h-4 w-24 bg-[var(--background-soft)] rounded-lg" />
        <div className="h-7 w-full bg-[var(--border-color)] rounded-lg" />
        <div className="h-4 w-4/5 bg-[var(--background-soft)] rounded-lg" />
        <div className="pt-4 flex justify-between">
          <div className="h-4 w-1/3 bg-[var(--background-soft)] rounded-lg" />
          <div className="h-4 w-12 bg-[var(--background-soft)] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.1,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  const handleMouseEnter = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1.08,
        duration: 0.7,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  return (
    <div ref={cardRef} className="group">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <TiltCard
          className="h-full flex flex-col bg-[var(--background-elevated)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden"
        >
          {/* Thumbnail */}
          <div ref={imageRef} className="relative h-64 overflow-hidden bg-[var(--background-soft)]">
            {(post.image_url || post.images?.[0]) ? (
              <Image
                src={post.image_url || post.images[0]}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
                <FiBookOpen className="w-16 h-16 text-green-500/30 dark:text-green-400/30" />
              </div>
            )}

            {/* Category badge - Floating */}
            <div className="absolute top-5 left-5 z-10">
              <span className="px-4 py-1.5 rounded-xl bg-[var(--background-elevated)]/95 backdrop-blur-md text-green-600 text-[11px] font-black uppercase tracking-[0.2em] border border-green-200/30 shadow-xl">
                {post.category}
              </span>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-green-600/10 dark:bg-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-8">
            <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight mb-4 group-hover:text-green-600 transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed line-clamp-3 mb-8 flex-1">
              {excerpt(post.content)}
            </p>

            {/* Footer meta */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] text-[13px] text-[var(--muted-foreground)]">
              <div className="flex items-center gap-4">
                {post.published_at && (
                  <span className="flex items-center gap-1.5">
                    <FiClock size={14} className="text-green-600" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                {post.author && (
                  <span className="flex items-center gap-1.5">
                    <FiUser size={14} className="text-green-600" />
                    {post.author.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-green-600 font-bold group-hover:gap-2 transition-all">
                Baca <FiArrowRight size={14} />
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
    </div>
  );
}

// ─── Featured Post ────────────────────────────────────────────────────────────
function FeaturedPost({ post }: { post: BlogPost }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 1.5,
        ease: "power1.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 1,
        ease: "power2.out",
      });
    }
  };

  return (
    <div ref={containerRef} className="mb-20">
      <Link href={`/blog/${post.slug}`} className="block group">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-[3rem] overflow-hidden bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
              <div ref={imageRef} className="w-full h-full">
                {(post.image_url || post.images?.[0]) ? (
                  <Image
                    src={post.image_url || post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover opacity-90 dark:opacity-80"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600" />
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent lg:from-transparent lg:to-transparent" />
            </div>

            <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-[11px] font-black uppercase tracking-[0.2em] border border-green-100 dark:border-green-800">
                  <FiTrendingUp className="w-3.5 h-3.5" /> Terpopuler
                </span>
                <span className="text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-[0.2em]">• {post.category}</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--foreground)] leading-[1.1] mb-6 group-hover:text-green-600 transition-colors tracking-tighter">
                {post.title}
              </h2>
              <p className="text-[var(--muted-foreground)] text-lg md:text-xl leading-relaxed mb-10 line-clamp-3">
                {excerpt(post.content, 200)}
              </p>

              <div className="flex items-center gap-6 pt-8 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                    {post.author?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="text-[var(--foreground)] font-bold text-sm">{post.author?.name || 'DietCare Expert'}</p>
                    <p className="text-[var(--muted-foreground)] text-xs">{formatDate(post.published_at)}</p>
                  </div>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-2 text-green-600 font-black group-hover:gap-4 transition-all uppercase tracking-[0.2em] text-sm">
                  Baca Selengkapnya <FiArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, onPage }: { meta: Meta; onPage: (p: number) => void }) {
  if (meta.last_page <= 1) return null;
  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  const visible = pages.filter(p =>
    p === 1 || p === meta.last_page ||
    (p >= meta.current_page - 1 && p <= meta.current_page + 1)
  );

  return (
    <div className="flex items-center justify-center gap-3 mt-20">
      <button
        onClick={() => onPage(meta.current_page - 1)}
        disabled={meta.current_page === 1}
        className="w-12 h-12 rounded-2xl border border-[var(--border-color)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300/50 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft size={20} />
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && (
              <span className="px-2 text-[var(--border-color)] font-bold">...</span>
            )}
            <button
              onClick={() => onPage(p)}
              className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${
                p === meta.current_page
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/20'
                  : 'border border-[var(--border-color)] text-[var(--muted-foreground)] hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300/50 hover:text-green-600'
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onPage(meta.current_page + 1)}
        disabled={meta.current_page === meta.last_page}
        className="w-12 h-12 rounded-2xl border border-[var(--border-color)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300/50 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const heroRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const cats = ['Semua', ...new Set(posts.map(p => p.category))];
    return cats;
  }, [posts]);

  const fetchPosts = useCallback(async (p: number, q: string, cat: string) => {
    setLoading(true);
    setError(false);
    try {
      let queryStr = `paginate=true&limit=${PER_PAGE}&page=${p}`;
      if (q) queryStr += `&search=${encodeURIComponent(q)}`;
      if (cat !== 'Semua') queryStr += `&category=${encodeURIComponent(cat)}`;

      const url = buildApiUrl(`/public/blogs?${queryStr}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setPosts(data.data || []);
      setMeta(data.meta || { current_page: p, last_page: 1, per_page: PER_PAGE, total: (data.data || []).length });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page, search, activeCategory);
  }, [fetchPosts, page, search, activeCategory]);

  // GSAP Animations on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const heroElements = heroRef.current?.querySelectorAll('.hero-child');
      if (heroElements) {
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            delay: 0.2
          }
        );
      }

      // Search Bar Glow
      gsap.to(searchRef.current, {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const filteredPosts = posts;
  const featuredPost = filteredPosts.length > 0 && page === 1 && !search && activeCategory === 'Semua' ? filteredPosts[0] : null;
  const displayPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-32 relative overflow-hidden transition-colors duration-500">
      <Scene3DBackground subtle />

      {/* ── Hero Section - Minimalist & Modern ───────────────────────────── */}
      <section ref={heroRef} className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 text-center">
          <span className="hero-child inline-block px-4 py-1.5 rounded-full bg-green-500/10 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6 border border-green-500/20 dark:border-green-800/30">
            Insight & Edukasi
          </span>

          <h1 className="hero-child text-5xl md:text-7xl font-black text-[var(--foreground)] leading-[1.05] mb-8 tracking-tighter">
            Kesehatan Dimulai dari <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">Pengetahuan</span>
          </h1>

          <p className="hero-child text-[var(--muted-foreground)] text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            Jelajahi panduan gizi terpercaya, resep sehat, dan tips gaya hidup berkelanjutan dari tim ahli gizi kami.
          </p>

          {/* Search bar - Floating Glass */}
          <form onSubmit={handleSearch} ref={searchRef} className="hero-child relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-green-500/15 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[var(--background-elevated)] rounded-[2rem] shadow-2xl border border-[var(--border-color)] p-2 pl-8">
              <FiSearch className="text-[var(--muted-foreground)] mr-4" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari artikel, resep, atau topik gizi..."
                className="flex-grow bg-transparent text-[var(--foreground)] text-lg font-bold focus:outline-none placeholder:text-[var(--muted-foreground)]/50 placeholder:font-medium"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <FiX size={20} />
                </button>
              )}
              <Button
                type="submit"
                className="h-14 px-10 rounded-[1.5rem] font-black text-base bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl shadow-green-500/20 ml-2"
              >
                Cari
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Category Filter - Sticky ─────────────────────────────────────── */}
      <div
        ref={categoryRef}
        className="sticky top-20 z-40 bg-[var(--background-elevated)]/80 backdrop-blur-xl border-b border-[var(--border-color)] py-6 mb-16"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span className="text-[var(--muted-foreground)] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 shrink-0">
              <FiHash className="w-3 h-3" /> Kategori
            </span>
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/20'
                      : 'bg-[var(--background-soft)] text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Featured Post */}
        {featuredPost && <FeaturedPost post={featuredPost} />}

        {/* Active search/category notice */}
        {(search || activeCategory !== 'Semua') && (
          <div className="flex items-center gap-4 mb-12 p-6 bg-[var(--background-soft)] rounded-3xl border border-[var(--border-color)]">
            <div className="w-12 h-12 bg-[var(--background-elevated)] rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
              <FiSearch size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-1">Menampilkan Hasil</p>
              <p className="text-lg font-black text-[var(--foreground)]">
                {search ? `"${search}"` : ''}
                {search && activeCategory !== 'Semua' ? ' di ' : ''}
                {activeCategory !== 'Semua' ? `Kategori: ${activeCategory}` : ''}
                <span className="text-[var(--muted-foreground)] font-medium ml-2">({meta.total} artikel)</span>
              </p>
            </div>
            <button
              onClick={() => { clearSearch(); setActiveCategory('Semua'); }}
              className="ml-auto p-3 hover:bg-[var(--background-elevated)] rounded-2xl text-[var(--muted-foreground)] hover:text-red-500 transition-all"
            >
              <FiX size={24} />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayPosts.length === 0 && (
          <div className="py-32 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-[var(--background-soft)] rounded-[2.5rem] flex items-center justify-center text-[var(--border-color)] mx-auto mb-8">
              <FiBookOpen size={48} />
            </div>
            <h3 className="text-3xl font-black text-[var(--foreground)] mb-4">Belum Ada Artikel</h3>
            <p className="text-[var(--muted-foreground)] text-lg mb-10 leading-relaxed">
              Kami sedang menyiapkan konten berkualitas untuk topik ini. Silakan cek kembali dalam waktu dekat.
            </p>
            <Button
              onClick={() => { clearSearch(); setActiveCategory('Semua'); }}
              variant="outline"
              className="h-14 px-10 rounded-2xl"
            >
              Lihat Semua Artikel
            </Button>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-32 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-8">
              <FiAlertCircle size={48} />
            </div>
            <h3 className="text-3xl font-black text-[var(--foreground)] mb-4">Gagal Memuat Data</h3>
            <p className="text-[var(--muted-foreground)] text-lg mb-10 leading-relaxed">
              Terjadi masalah saat menghubungkan ke server. Mohon periksa koneksi internet Anda.
            </p>
            <Button onClick={() => fetchPosts(page, search, activeCategory)} className="h-14 px-10 rounded-2xl">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && displayPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {displayPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination meta={meta} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </main>
  );
}