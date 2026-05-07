'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShopProduct } from '@/types/shop';
import { useCartStore } from '@/store/cartStore';
import {
  FiShoppingCart, FiSearch, FiStar, FiCheckCircle,
  FiPackage, FiTrendingUp, FiZap,
} from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

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
    <div className="shop-card">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-9 w-9 rounded-xl" />
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

  const stagger = `stagger-${Math.min(index + 1, 8)}`;

  return (
    <Link href={`/shop/${product.slug}`} className={`block animate-fade-up ${stagger}`}>
      <div className="shop-card h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden flex-shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1e3a2f&color=22c55e&size=200&bold=true&format=svg`;
            }}
          />
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_healthy && (
              <span className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <FiCheckCircle className="w-2.5 h-2.5" /> Healthy
              </span>
            )}
            {product.is_nutritionist_recommended && (
              <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <FiStar className="w-2.5 h-2.5" /> {product.nutritionist_label || 'Rekomendasi'}
              </span>
            )}
          </div>

          {/* Calorie badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-xl px-2.5 py-1 text-xs font-bold text-white border border-white/10">
            🔥 {product.calories} kcal
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-white text-sm leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">{product.description}</p>
          )}

          {/* Macros */}
          <div className="flex gap-1.5 mb-4">
            {[
              { label: 'P', value: product.protein + 'g', bg: 'bg-blue-500/20', text: 'text-blue-300' },
              { label: 'K', value: product.carbs + 'g',   bg: 'bg-amber-500/20', text: 'text-amber-300' },
              { label: 'L', value: product.fat + 'g',     bg: 'bg-red-500/20',   text: 'text-red-300' },
            ].map((m) => (
              <span key={m.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${m.bg} ${m.text}`}>
                {m.label} {m.value}
              </span>
            ))}
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between mt-auto">
            <p className="text-base font-extrabold text-yellow-400">{fmt(product.price)}</p>
            <button
              onClick={handleAdd}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-all duration-200 shadow-lg
                ${added
                  ? 'bg-green-500 shadow-green-500/40'
                  : 'btn-green shadow-green-500/20'
                } ${popping ? 'animate-cart-pop' : ''}`}
              title="Tambah ke keranjang"
            >
              {added ? <FiCheckCircle className="w-4 h-4" /> : <FiShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Hero Stats ──────────────────────────────────────────────── */
function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-4 mt-8">
      {[
        { icon: '🥗', val: '50+', label: 'Produk Sehat' },
        { icon: '👨‍⚕️', val: '100%', label: 'Divalidasi Gizi' },
        { icon: '⚡', val: '60 min', label: 'Pengiriman Instan' },
      ].map((s, i) => (
        <div key={i} className="text-center">
          <p className="text-2xl mb-1">{s.icon}</p>
          <p className="text-xl font-extrabold text-white">{s.val}</p>
          <p className="text-xs text-slate-400 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, recommended]);

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0d2a1a 50%,#0f172a 100%)' }}
           className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 rounded-full px-3 py-1.5 text-green-400 text-xs font-bold mb-4">
                <FiCheckCircle className="w-3.5 h-3.5" />
                Divalidasi Ahli Gizi Bersertifikat
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                Dietela Shop 🥗
              </h1>
              <p className="text-slate-400 text-base max-w-md leading-relaxed">
                Makanan sehat, bergizi, dan lezat — dikirim langsung ke pintu Anda.
                Setiap produk tervalidasi oleh ahli gizi bersertifikat.
              </p>
              <HeroStats />
            </div>

            {/* Cart CTA */}
            <div className="flex flex-col gap-3 animate-fade-up stagger-2">
              <Link
                href="/shop/cart"
                className="relative flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:-translate-y-1 hover:shadow-green-500/50"
              >
                <FiShoppingCart className="w-5 h-5" />
                Keranjang Saya
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link href="/shop/orders"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold px-6 py-3 rounded-2xl border border-white/8 transition-all text-sm">
                <FiPackage className="w-4 h-4" /> Pesanan Saya
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-up stagger-2">
        <div className="flex flex-col gap-4">
          {/* Search + Recommend */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk makanan sehat..."
                className="input-dark pl-11"
              />
            </div>
            <button
              onClick={() => setRecommended(!recommended)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                recommended
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                  : 'bg-transparent text-slate-400 border-slate-700 hover:border-blue-500/50 hover:text-blue-400'
              }`}
            >
              <FiStar className="w-4 h-4" />
              Rekomendasi Gizi
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  category === c.value
                    ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-green-500/40 hover:text-green-400'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Grid ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            {loading ? 'Memuat produk...' : (
              <span><span className="text-white font-bold">{products.length}</span> produk ditemukan</span>
            )}
          </p>
          {!loading && products.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />
              Harga terbaik hari ini
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-up">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4">
              🥗
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Produk tidak ditemukan</h3>
            <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
