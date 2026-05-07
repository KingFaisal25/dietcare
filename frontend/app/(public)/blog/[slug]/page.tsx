'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiCalendar, FiUser, FiTag,
  FiAlertCircle, FiBookOpen,
} from 'react-icons/fi';
import { buildApiUrl } from '@/lib/url';

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

/** Naively strip HTML tags so raw-text content renders as paragraphs */
function renderContent(html: string) {
  // If content looks like plain text (no tags), split on double newlines
  const hasHtml = /<[a-z][\s\S]*>/i.test(html);
  if (!hasHtml) {
    return html.split(/\n\n+/).map((para, i) => (
      <p key={i} className="mb-4 leading-[1.85] text-neutral-700">
        {para}
      </p>
    ));
  }
  // Render raw HTML (content from rich-text editors)
  return (
    <div
      className="prose prose-neutral prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ───────────────────────────────────────────────
// Loading Skeleton
// ───────────────────────────────────────────────
function BlogDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-[420px] rounded-3xl bg-neutral-100" />
      <div className="container mx-auto max-w-3xl px-6 space-y-4">
        <div className="h-4 w-32 bg-neutral-100 rounded-full" />
        <div className="h-8 w-3/4 bg-neutral-200 rounded-full" />
        <div className="h-8 w-1/2 bg-neutral-200 rounded-full" />
        <div className="h-4 w-full bg-neutral-100 rounded-full" />
        <div className="h-4 w-5/6 bg-neutral-100 rounded-full" />
        <div className="h-4 w-4/6 bg-neutral-100 rounded-full" />
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

  // ── Back link ─────────────────────────────────
  const BackLink = () => (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-brand-600 transition-colors group"
    >
      <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
      Kembali ke Beranda
    </Link>
  );

  // ── Loading ───────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-24">
        <div className="container mx-auto max-w-3xl px-6 mb-8">
          <BackLink />
        </div>
        <BlogDetailSkeleton />
      </main>
    );
  }

  // ── Not found ─────────────────────────────────
  if (notFound) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-24 flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
          <FiBookOpen className="w-10 h-10 text-brand-300" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900">Artikel Tidak Ditemukan</h1>
        <p className="text-neutral-500 max-w-sm">
          Artikel yang Anda cari tidak ada atau telah dihapus.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-colors"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </Link>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────
  if (error || !post) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-24 flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <FiAlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900">Terjadi Kesalahan</h1>
        <p className="text-neutral-500 max-w-sm">
          Gagal memuat artikel. Silakan coba lagi nanti.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-colors"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </Link>
      </main>
    );
  }

  // ── Success ───────────────────────────────────
  return (
    <main className="min-h-screen bg-white pb-24">
      {/* ── Hero ─────────────────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[340px] max-h-[520px] bg-neutral-900 overflow-hidden">
        {(post.image_url || post.images?.[0]) ? (
          <Image
            src={post.image_url || post.images[0]}
            alt={post.title}
            fill
            className="object-cover opacity-50"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button (top left) */}
        <div className="absolute top-28 left-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-all hover:bg-white/20 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            Beranda
          </Link>
        </div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10 container mx-auto max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-brand-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
            {post.title}
          </h1>
        </motion.div>
      </div>

      {/* ── Content area ─────────────────────── */}
      <div className="container mx-auto max-w-3xl px-6">
        {/* Metadata bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap items-center gap-4 py-6 border-b border-neutral-100 text-sm text-neutral-500"
        >
          {post.published_at && (
            <span className="flex items-center gap-1.5 font-medium">
              <FiCalendar className="text-brand-500" size={14} />
              {formatDate(post.published_at)}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1.5 font-medium">
              <FiUser className="text-brand-500" size={14} />
              {post.author.name}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-medium">
            <FiTag className="text-brand-500" size={14} />
            {post.category}
          </span>
        </motion.div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="pt-10 text-base text-neutral-700"
        >
          {renderContent(post.content)}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 pt-10 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-600 mb-1">DietCare</p>
            <p className="text-neutral-500 text-sm">
              Artikel ini ditulis oleh tim ahli gizi DietCare.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-100"
          >
            Mulai Konsultasi <FiArrowLeft className="rotate-180" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
