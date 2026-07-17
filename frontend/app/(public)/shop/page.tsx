'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopProduct } from '@/types/shop';
import { useCartStore } from '@/store/cartStore';
import {
  FiShoppingCart, FiSearch, FiStar, FiCheckCircle,
  FiPackage, FiTrendingUp, FiZap, FiFilter, FiX, FiArrowRight, FiHeart
} from 'react-icons/fi';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const CATEGORIES = [
  { value: '', label: 'Semua', emoji: '🌿' },
  { value: 'makanan-utama', label: 'Makanan Utama', emoji: '🍱' },
  { value: 'salad', label: 'Salad', emoji: '🥗' },
  { value: 'snack', label: 'Camilan', emoji: '🥜' },
  { value: 'minuman', label: 'Minuman', emoji: '🥤' },
  { value: 'sarapan', label: 'Sarapan', emoji: '🌅' },
  { value: 'sup', label: 'Sup', emoji: '🍲' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

/* ── Skeleton ────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden animate-pulse shadow-sm">
      <div className="h-56 bg-slate-50" />
      <div className="p-6 space-y-4">
        <div className="h-4 w-3/4 bg-slate-50 rounded-lg" />
        <div className="h-3 w-1/2 bg-slate-50 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-slate-50 rounded-lg" />
          <div className="h-6 w-12 bg-slate-50 rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-6 w-24 bg-slate-100 rounded-lg" />
          <div className="h-10 w-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ── Product Card ────────────────────────────────────────────── */
function ProductCard({ product, index }: { product: ShopProduct; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const [popping, setPopping] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    setPopping(true);
    setAdded(true);
    setTimeout(() => setPopping(false), 500);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group"
    >
      <Link href={`/shop/${product.slug}`} className="block h-full">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col h-full group">
          {/* Image */}
          <div className="relative h-64 overflow-hidden bg-slate-50">
            <Image
              src={product.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f0fdf4&color=16a34a&size=400&bold=true&format=svg`}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_healthy && (
                <span className="flex items-center gap-1.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg shadow-green-900/20">
                  <FiCheckCircle className="w-3 h-3" /> Healthy
                </span>
              )}
              {product.is_nutritionist_recommended && (
                <span className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg shadow-blue-900/20">
                  <FiStar className="w-3 h-3" /> Recommended
                </span>
              )}
            </div>

            {/* Calorie badge */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-1.5 text-xs font-black text-slate-900 border border-white shadow-xl">
              🔥 {product.calories} kcal
            </div>

            {/* Wishlist button */}
            <button className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md border border-white flex items-center justify-center text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 shadow-xl">
              <FiHeart className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col flex-1">
            <div className="mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {(product as any).category_label || product.category || 'Nutrisi'}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            {/* Macros */}
            <div className="flex gap-2 mb-6">
              {[
                { label: 'P', value: product.protein + 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'K', value: product.carbs + 'g', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'L', value: product.fat + 'g', color: 'text-red-600', bg: 'bg-red-50' },
              ].map((m) => (
                <span key={m.label} className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${m.bg} ${m.color} uppercase tracking-tighter`}>
                  {m.label}: {m.value}
                </span>
              ))}
            </div>

            {/* Price + Cart */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
              <p className="text-xl font-black text-slate-900">{fmt(product.price)}</p>
              <button
                onClick={handleAdd}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl
                  ${added
                    ? 'bg-green-600 text-white shadow-green-200'
                    : 'bg-slate-900 text-white hover:bg-green-600 shadow-slate-200 hover:shadow-green-200'
                  } ${popping ? 'scale-110' : ''}`}
              >
                {added ? <FiCheckCircle className="w-5 h-5" /> : <FiShoppingCart className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [recommended, setRecommended] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (recommended) params.set('recommended', '1');
      const res = await fetch(`${API}/shop/products?${params}`);
      const data = await res.json();
      setProducts(data.data ?? []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, category, recommended]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50/50" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-50/60 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-6 border border-green-100">
                DietCare Store
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                Nutrisi Terbaik <br />
                <span className="text-green-600 text-6xl md:text-8xl">Untuk Tubuhmu</span>
              </h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
                Makanan sehat tervalidasi ahli gizi, lezat, dan dikirim langsung ke depan pintu Anda.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 text-center lg:text-left">
                {[
                  { icon: '🥗', val: '50+', label: 'Produk Sehat' },
                  { icon: '👨‍⚕️', val: '100%', label: 'Validasi Gizi' },
                  { icon: '⚡', val: '60 min', label: 'Pengiriman' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-2xl font-black text-slate-900 mb-1">{s.val}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cart & Orders CTA */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4 w-full sm:w-auto"
            >
              <Link href="/shop/cart" className="group">
                <div className="relative flex items-center justify-between gap-10 bg-green-600 hover:bg-green-700 text-white font-black px-10 py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(22,163,74,0.3)] transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <FiShoppingCart size={24} />
                    <span className="text-xl">Keranjang Saya</span>
                  </div>
                  {totalItems > 0 ? (
                    <span className="bg-white text-green-600 w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg animate-bounce">
                      {totalItems}
                    </span>
                  ) : <FiArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                </div>
              </Link>
              <Link href="/shop/orders">
                <div className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white font-bold px-10 py-5 rounded-[2rem] shadow-xl transition-all hover:-translate-y-1">
                  <FiPackage size={20} />
                  <span>Riwayat Pesanan</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Filters Section ── */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-y border-slate-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Search */}
            <div className="relative w-full lg:max-w-md group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari makanan sehat..."
                className="w-full h-16 pl-14 pr-8 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-lg font-bold placeholder:font-medium placeholder:text-slate-300 transition-all"
              />
            </div>

            {/* Recommended Toggle */}
            <button
              onClick={() => setRecommended(!recommended)}
              className={`h-16 px-8 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${
                recommended
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <FiStar size={18} className={recommended ? 'fill-white' : ''} />
              Rekomendasi Ahli Gizi
            </button>

            {/* Category Slider */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full lg:flex-1 pb-2 lg:pb-0">
              <FiFilter className="text-slate-300 shrink-0 ml-4" />
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    category === c.value
                      ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-100'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-green-200 hover:text-green-600'
                  }`}
                >
                  <span className="mr-2">{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Semua Produk</h2>
              <p className="text-slate-400 font-medium">
                {loading ? 'Menyiapkan menu sehat...' : `Ditemukan ${products.length} pilihan nutrisi terbaik`}
              </p>
            </div>
            {!loading && products.length > 0 && (
              <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-green-50 rounded-2xl border border-green-100 text-green-700 font-bold text-sm">
                <FiTrendingUp className="w-4 h-4" /> Harga terbaik hari ini
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
                <FiSearch size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Produk Tidak Ditemukan</h3>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                Maaf, menu yang Anda cari tidak tersedia. Coba gunakan kata kunci lain atau jelajahi kategori lainnya.
              </p>
              <Button onClick={() => { setSearch(''); setCategory(''); setRecommended(false); }} variant="outline" className="h-14 px-10 rounded-2xl">
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
