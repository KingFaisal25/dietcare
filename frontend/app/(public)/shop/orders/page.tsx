'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { ShopOrder } from '@/types/shop';
import { FiArrowLeft, FiShoppingBag, FiChevronRight, FiPackage } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BG   = { background: '#0f172a' } as const;
const CARD = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 } as const;

const STATUS: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Menunggu',   bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
  diproses:   { label: 'Diproses',   bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  dikirim:    { label: 'Dikirim',    bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa' },
  sampai:     { label: 'Sampai',     bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  dibatalkan: { label: 'Dibatalkan', bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
};

function dateFmt(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/shop/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setOrders(d.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4" style={BG}>
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Login diperlukan</h2>
        <Link href="/login" className="btn-green px-6 py-3 text-sm">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={BG}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: '#0f172a' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop" className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-green-400 transition-all">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Pesanan Saya</h1>
            <p className="text-xs text-slate-500">Riwayat belanja Dietela Shop</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="p-4 animate-fade-up" style={CARD}>
                <div className="flex gap-3 mb-3">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#1e293b' }}>
              <FiShoppingBag className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white">Belum ada pesanan</h3>
            <p className="text-sm text-slate-500">Mulai belanja produk sehat di Dietela Shop.</p>
            <Link href="/shop" className="btn-green px-6 py-3 text-sm flex items-center gap-2">
              <FiShoppingBag className="w-4 h-4" /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const st = STATUS[order.status] ?? { label: order.status, bg: 'rgba(255,255,255,0.05)', text: '#94a3b8' };
              return (
                <Link key={order.id} href={`/shop/orders/${order.order_number}`}
                  className={`block p-4 hover:-translate-y-0.5 transition-all duration-200 animate-fade-up stagger-${Math.min(i+1,8)}`}
                  style={CARD}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-extrabold text-white">{order.order_number}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{dateFmt(order.created_at)}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: st.bg, color: st.text }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Item thumbnails */}
                  <div className="flex gap-2 mb-3 items-center">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                           style={{ background: '#273449' }}>
                        <img src={item.product?.image_url ?? ''} alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1e3a2f&color=22c55e&size=40`; }} />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0"
                           style={{ background: '#273449' }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                    <div className="flex-1 flex items-center justify-end gap-2">
                      <p className="text-xs text-slate-500">{order.items.length} produk</p>
                      <FiChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                    <div className="flex gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-lg font-semibold text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {order.delivery_type === 'instant' ? '⚡ Instan' : '📅 Terjadwal'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg font-semibold text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {order.payment_method === 'cod' ? '💵 COD' : order.payment_method === 'transfer' ? '🏦 Transfer' : '📱 E-Wallet'}
                      </span>
                    </div>
                    <p className="font-extrabold text-yellow-400 text-sm">{fmt(order.total)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
