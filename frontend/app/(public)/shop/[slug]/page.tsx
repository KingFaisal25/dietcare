'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShopProduct } from '@/types/shop';
import { useCartStore } from '@/store/cartStore';
import { FiArrowLeft, FiShoppingCart, FiZap, FiMinus, FiPlus, FiCheckCircle, FiStar } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function NutrBar({ label, value, unit, pct, color }: {
  label: string; value: number; unit: string; pct: number; color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [popping, setPopping] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`${API}/shop/products/${slug}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, qty);
    setPopping(true);
    setAddedToCart(true);
    setTimeout(() => setPopping(false), 500);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    if (!product) return;
    addItem(product, qty);
    router.push('/shop/cart');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0f172a' }}>
        <div className="text-6xl">🫙</div>
        <h2 className="text-xl font-bold text-white">Produk tidak ditemukan</h2>
        <Link href="/shop" className="text-green-400 hover:text-green-300 font-medium">← Kembali ke Toko</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link href="/shop"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 font-medium transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Kembali ke Toko
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-up">
        <div className="rounded-3xl overflow-hidden border border-white/[0.07]" style={{ background: '#1e293b' }}>
          <div className="grid md:grid-cols-2">

            {/* Left — Image */}
            <div className="relative min-h-72 flex items-center justify-center p-8"
                 style={{ background: 'linear-gradient(135deg,#0d2a1a,#1e293b)' }}>
              {/* Glow */}
              <div className="absolute inset-0 opacity-30 pointer-events-none"
                   style={{ background: 'radial-gradient(circle at 50% 50%,rgba(34,197,94,0.2),transparent 70%)' }} />

              <img
                src={product.image_url}
                alt={product.name}
                className="relative z-10 w-full max-w-xs h-72 object-cover rounded-2xl shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1e3a2f&color=22c55e&size=400&bold=true&format=svg`;
                }}
              />

              {/* Badges */}
              <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                {product.is_healthy && (
                  <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <FiCheckCircle className="w-3 h-3" /> Healthy
                  </span>
                )}
                {product.is_nutritionist_recommended && (
                  <span className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <FiStar className="w-3 h-3" /> {product.nutritionist_label ?? 'Rekomendasi'}
                  </span>
                )}
              </div>
            </div>

            {/* Right — Info */}
            <div className="p-8 flex flex-col">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">
                {product.category.replace(/-/g, ' ')}
              </p>
              <h1 className="text-2xl font-extrabold text-white mb-3 leading-tight">{product.name}</h1>
              {product.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{product.description}</p>
              )}

              {/* Calorie highlight */}
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6 border border-green-500/20"
                   style={{ background: 'rgba(34,197,94,0.08)' }}>
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-lg">🔥</div>
                <div>
                  <p className="text-xs text-green-400 font-semibold">Total Kalori</p>
                  <p className="text-xl font-extrabold text-white">{product.calories} <span className="text-sm text-slate-400 font-medium">kcal</span></p>
                </div>
              </div>

              {/* Nutrition bars */}
              <div className="rounded-2xl p-4 mb-6 border border-white/[0.06] space-y-3"
                   style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Kandungan Gizi</p>
                <NutrBar label="Protein" value={product.protein} unit="g" pct={(product.protein / 50) * 100} color="#3b82f6" />
                <NutrBar label="Karbohidrat" value={product.carbs} unit="g" pct={(product.carbs / 100) * 100} color="#f59e0b" />
                <NutrBar label="Lemak" value={product.fat} unit="g" pct={(product.fat / 40) * 100} color="#ef4444" />
              </div>

              {/* Price + Qty */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-3xl font-extrabold text-yellow-400">{fmt(product.price)}</p>
                <div className="flex items-center gap-2 rounded-xl px-2 py-1 border border-white/[0.08]"
                     style={{ background: '#273449' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <FiMinus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-extrabold text-white">{qty}</span>
                  <button onClick={() => setQty(Math.min(50, qty + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <FiPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all duration-200 ${
                    addedToCart
                      ? 'bg-green-500/15 text-green-400 border-green-500/40'
                      : 'bg-transparent text-green-400 border-green-500/40 hover:bg-green-500/10 hover:border-green-500'
                  } ${popping ? 'animate-cart-pop' : ''}`}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  {addedToCart ? '✓ Ditambahkan!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white btn-green shadow-xl"
                >
                  <FiZap className="w-4 h-4" /> Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
