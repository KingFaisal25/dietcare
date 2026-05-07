'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiBookOpen, FiClock, FiUser,
  FiAlertCircle, FiChevronLeft, FiChevronRight, FiSearch, FiX,
} from 'react-icons/fi';
import { buildApiUrl } from '@/lib/url';

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
    <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-neutral-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-neutral-100 rounded-full" />
        <div className="h-5 w-full bg-neutral-200 rounded-full" />
        <div className="h-4 w-4/5 bg-neutral-100 rounded-full" />
        <div className="h-3 w-1/3 bg-neutral-100 rounded-full mt-4" />
      </div>
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <article className="h-full flex flex-col bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Thumbnail */}
          <div className="relative h-52 overflow-hidden rounded-t-3xl shrink-0 bg-gradient-to-br from-brand-50 to-brand-100">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBookOpen className="w-12 h-12 text-brand-200" />
              </div>
            )}
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-brand-600 text-[10px] font-black uppercase tracking-widest border border-brand-100 shadow-sm">
                {post.category}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-6 space-y-3">
            <h2 className="text-base font-black text-neutral-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
              {post.title}
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed line-clamp-3 flex-1">
              {excerpt(post.content)}
            </p>

            {/* Footer meta */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-50 text-xs text-neutral-400">
              <div className="flex items-center gap-3">
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <FiClock size={11} className="text-brand-400" />
                    {formatDate(post.published_at)}
                  </span>
                )}
                {post.author && (
                  <span className="flex items-center gap-1">
                    <FiUser size={11} className="text-brand-400" />
                    {post.author.name}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-0.5 text-brand-500 font-bold group-hover:gap-1.5 transition-all">
                Baca <FiArrowRight size={12} />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
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
    <div className="flex items-center justify-center gap-2 mt-14">
      <button
        onClick={() => onPage(meta.current_page - 1)}
        disabled={meta.current_page === 1}
        className="w-10 h-10 rounded-2xl border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft size={16} />
      </button>

      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && (
              <span className="px-1 text-neutral-300 text-sm">…</span>
            )}
            <button
              onClick={() => onPage(p)}
              className={`w-10 h-10 rounded-2xl text-sm font-bold transition-all ${
                p === meta.current_page
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                  : 'border border-neutral-200 text-neutral-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
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
        className="w-10 h-10 rounded-2xl border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PER_PAGE = 12;

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(false);
    try {
      const url = buildApiUrl(
        `/public/blogs?paginate=true&limit=${PER_PAGE}&page=${p}${q ? `&search=${encodeURIComponent(q)}` : ''}`
      );
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
    fetchPosts(page, search);
  }, [fetchPosts, page, search]);

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

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-black uppercase tracking-widest">
              Blog DietCare
            </span>
            <h1 className="text-5xl md:text-[56px] font-black text-white leading-[1.1] tracking-tight">
              Tips &amp; Artikel<br />Hidup Sehat
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto font-medium">
              Panduan gizi, resep sehat, dan inspirasi hidup seimbang dari tim ahli DietCare.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mt-8">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white text-gray-900 text-sm font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 placeholder:text-neutral-400"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors">
                  <FiX size={16} />
                </button>
              )}
            </form>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-6 py-16">

        {/* Active search notice */}
        {search && (
          <div className="flex items-center gap-3 mb-8 p-4 bg-brand-50 rounded-2xl border border-brand-100">
            <FiSearch className="text-brand-500 shrink-0" />
            <p className="text-sm font-medium text-neutral-700">
              Hasil pencarian untuk: <strong className="text-brand-600">&quot;{search}&quot;</strong>
              {meta.total > 0 && <span className="text-neutral-500"> — {meta.total} artikel ditemukan</span>}
            </p>
            <button onClick={clearSearch} className="ml-auto text-neutral-400 hover:text-neutral-700 transition-colors">
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <FiAlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-neutral-900">Gagal Memuat Artikel</h3>
              <p className="text-neutral-500 text-sm mt-1">Periksa koneksi dan coba lagi.</p>
            </div>
            <button
              onClick={() => fetchPosts(page, search)}
              className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
              <FiBookOpen className="w-10 h-10 text-brand-300" />
            </div>
            <div>
              <h3 className="text-xl font-black text-neutral-900">
                {search ? 'Tidak Ada Hasil' : 'Belum Ada Artikel'}
              </h3>
              <p className="text-neutral-500 text-sm mt-1">
                {search ? `Coba kata kunci lain.` : 'Artikel belum dipublikasikan.'}
              </p>
            </div>
            {search && (
              <button onClick={clearSearch}
                className="px-6 py-3 border border-neutral-200 rounded-2xl font-bold text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">
                Hapus Pencarian
              </button>
            )}
            <Link href="/"
              className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* Posts grid */}
        {!loading && !error && posts.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            <Pagination meta={meta} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

            {/* Total info */}
            <p className="text-center text-xs text-neutral-400 mt-6">
              Menampilkan {posts.length} dari {meta.total} artikel
            </p>
          </>
        )}
      </div>
    </main>
  );
}
