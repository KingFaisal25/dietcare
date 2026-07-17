'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { ShopOrder } from '@/types/shop';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BG   = { background: '#0f172a' } as const;
const CARD = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 } as const;
const CARD2 = { background: '#273449', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 } as const;

const FLOW = [
  { key: 'pending',  label: 'Menunggu Konfirmasi', icon: FiClock,       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  desc: 'Pesanan menunggu konfirmasi tim kami.' },
  { key: 'diproses', label: 'Sedang Diproses',      icon: FiPackage,     color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', desc: 'Pesanan sedang disiapkan oleh tim kami.' },
  { key: 'dikirim',  label: 'Dalam Pengiriman',     icon: FiTruck,       color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', desc: 'Paket sedang dalam perjalanan ke alamat Anda.' },
  { key: 'sampai',   label: 'Pesanan Sampai',        icon: FiCheckCircle, color: '#4ade80', bg: 'rgba(34,197,94,0.15)', desc: 'Paket telah tiba. Selamat menikmati! 🎉' },
];

function dateFmt(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TrackOrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }
    api.get(`/shop/orders/${orderNumber}/track`)
      .then((res) => setOrder(res.data.data ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const curIdx = FLOW.findIndex((s) => s.key === order?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={BG}>
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={BG}>
        <div className="text-5xl">📦</div>
        <h2 className="text-xl font-bold text-white">Pesanan tidak ditemukan</h2>
        <Link href="/shop/orders" className="text-green-400 hover:text-green-300 font-medium">← Lihat Semua Pesanan</Link>
      </div>
    );
  }

  const cancelled = order.status === 'dibatalkan';

  return (
    <div className="min-h-screen" style={BG}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: '#0f172a' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/shop/orders" className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-green-400 transition-all">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Lacak Pesanan</h1>
            <p className="text-xs text-slate-500 font-mono">{order.order_number}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-up">

        {/* Tracking Stepper */}
        {!cancelled ? (
          <div className="p-6" style={CARD}>
            <h2 className="font-bold text-white text-sm mb-6 flex items-center gap-2">
              <FiTruck className="w-4 h-4 text-green-400" /> Status Pengiriman
            </h2>
            <div>
              {FLOW.map((s, i) => {
                const Icon = s.icon;
                const done = i <= curIdx;
                const current = i === curIdx;
                const isLast = i === FLOW.length - 1;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${current ? 'ring-4 ring-offset-2 scale-110' : ''}`}
                           style={{
                             background: done ? s.bg : 'rgba(255,255,255,0.04)',
                             borderColor: done ? s.color : undefined,
                             boxShadow: current ? `0 0 0 4px ${s.color}20, 0 0 0 2px #0f172a` : undefined,
                           }}>
                        <Icon className="w-5 h-5" style={{ color: done ? s.color : '#475569' }} />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-10 mt-1 rounded-full transition-all duration-700"
                             style={{ background: i < curIdx ? s.color : 'rgba(255,255,255,0.06)' }} />
                      )}
                    </div>
                    <div className={`pb-8 ${isLast ? 'pb-0' : ''} pt-1`}>
                      <p className={`font-bold text-sm ${done ? 'text-white' : 'text-slate-600'}`}>{s.label}</p>
                      {done && <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>}
                      {done && s.key === 'diproses' && order.tracking_code && (
                        <p className="text-xs font-mono text-blue-400 mt-1 bg-blue-500/10 px-2 py-0.5 rounded-lg inline-block">
                          🚚 {order.tracking_code}
                        </p>
                      )}
                      {done && (
                        <p className="text-[11px] text-slate-600 mt-1">
                          {s.key === 'pending'  && dateFmt(order.created_at)}
                          {s.key === 'diproses' && dateFmt(order.processed_at)}
                          {s.key === 'dikirim'  && dateFmt(order.shipped_at)}
                          {s.key === 'sampai'   && dateFmt(order.delivered_at)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-3xl border border-red-500/25" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="font-bold text-red-400 text-lg">Pesanan Dibatalkan</h2>
            <p className="text-sm text-slate-500 mt-1">Pesanan ini telah dibatalkan.</p>
          </div>
        )}

        {/* Delivery Info */}
        <div className="p-5" style={CARD}>
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-green-400" /> Info Pengiriman
          </h3>
          <div className="space-y-2 text-sm" style={CARD2 as any}>
            <div className="p-4 space-y-2">
              <p className="font-bold text-white">{order.customer_name}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{order.address}</p>
              <p className="text-slate-400 text-xs">{order.phone}</p>
              <div className="flex gap-2 pt-1 flex-wrap">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-blue-300" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  {order.delivery_type === 'instant' ? '⚡ Instan' : '📅 Terjadwal'}
                  {order.delivery_time && ` – ${order.delivery_time}`}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-purple-300" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  {order.payment_method === 'cod' ? '💵 COD' : order.payment_method === 'transfer' ? '🏦 Transfer' : '📱 E-Wallet'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-5" style={CARD}>
          <h3 className="font-bold text-white text-sm mb-3">Produk Dipesan</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#273449' }}>
                  <img src={item.product?.image_url ?? ''} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1e3a2f&color=22c55e&size=48`; }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.product?.name ?? '–'}</p>
                  <p className="text-xs text-slate-500">×{item.quantity} × {fmt(item.unit_price)}</p>
                </div>
                <p className="text-sm font-extrabold text-yellow-400">{fmt(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] mt-4 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Ongkos Kirim</span><span>{fmt(order.delivery_fee)}</span></div>
            <div className="flex justify-between font-extrabold text-base pt-1 border-t border-white/[0.06]">
              <span className="text-white">Total</span>
              <span className="text-yellow-400">{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
