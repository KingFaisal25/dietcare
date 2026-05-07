'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowRight, FiTag } from 'react-icons/fi';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const S = { background: '#0f172a' } as const;
const CARD = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 } as const;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const router = useRouter();
  const [removing, setRemoving] = useState<number | null>(null);

  const subtotal = totalPrice();
  const deliveryFee = 15000;

  function handleRemove(id: number) {
    setRemoving(id);
    setTimeout(() => { removeItem(id); setRemoving(null); }, 300);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={S}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
             style={{ background: '#1e293b' }}>🛒</div>
        <h2 className="text-2xl font-bold text-white">Keranjang kosong</h2>
        <p className="text-slate-400 text-sm">Tambahkan produk sehat favoritmu!</p>
        <Link href="/shop"
          className="btn-green px-6 py-3 text-sm flex items-center gap-2 mt-2">
          <FiShoppingCart className="w-4 h-4" /> Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={S}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: '#0f172a' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop" className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-green-400 transition-all">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Keranjang Belanja</h1>
            <p className="text-xs text-slate-500">{items.length} produk dipilih</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-5">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id}
              className="p-4 flex gap-4 animate-fade-up transition-all duration-300"
              style={{
                ...CARD,
                opacity: removing === item.product.id ? 0 : 1,
                transform: removing === item.product.id ? 'translateX(-20px) scale(0.95)' : undefined,
              }}>
              {/* Image */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                   style={{ background: '#273449' }}>
                <img src={item.product.image_url} alt={item.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.product.name)}&background=1e3a2f&color=22c55e&size=80`; }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product.slug}`}>
                  <h3 className="font-bold text-white text-sm leading-snug hover:text-green-400 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">🔥 {item.product.calories} kcal / porsi</p>
                <p className="text-sm font-extrabold text-yellow-400 mt-1.5">{fmt(item.product.price)}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-end justify-between gap-2">
                <button onClick={() => handleRemove(item.product.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 rounded-xl px-2 py-1 border border-white/[0.06]"
                     style={{ background: '#273449' }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-extrabold text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-300">{fmt(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}

          <button onClick={clearCart}
            className="text-xs text-slate-600 hover:text-red-400 font-medium transition-colors flex items-center gap-1.5 mt-1">
            <FiTrash2 className="w-3.5 h-3.5" /> Hapus semua produk
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="p-5 sticky top-24 space-y-4" style={CARD}>
            <h2 className="font-bold text-white text-sm">Ringkasan Pesanan</h2>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-xs text-slate-500">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="flex-shrink-0 font-medium text-slate-400">{fmt(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] pt-3 space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ongkos kirim (estimasi)</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="rounded-2xl p-3 border border-green-500/20" style={{ background: 'rgba(34,197,94,0.08)' }}>
              <div className="flex justify-between font-extrabold text-base">
                <span className="text-white">Total</span>
                <span className="text-yellow-400">{fmt(subtotal + deliveryFee)}</span>
              </div>
              <p className="text-[10px] text-green-400/70 mt-0.5">*Ongkir final ditentukan saat checkout</p>
            </div>

            <button onClick={() => router.push('/shop/checkout')}
              className="w-full btn-green py-3.5 text-sm flex items-center justify-center gap-2">
              Checkout <FiArrowRight className="w-4 h-4" />
            </button>

            <Link href="/shop"
              className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-green-400 font-medium transition-colors">
              <FiArrowLeft className="w-4 h-4" /> Lanjutkan Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
