'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { ShopOrder } from '@/types/shop';
import { FiSearch, FiEye, FiRefreshCw } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'sampai', label: 'Sampai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

const NEXT_STATUS: Record<string, string> = {
  pending: 'diproses',
  diproses: 'dikirim',
  dikirim: 'sampai',
};

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-amber-500/15 text-amber-400',
  diproses:   'bg-blue-500/15 text-blue-400',
  dikirim:    'bg-violet-500/15 text-violet-400',
  sampai:     'bg-emerald-500/15 text-emerald-400',
  dibatalkan: 'bg-red-500/15 text-red-400',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', diproses: 'Diproses',
  dikirim: 'Dikirim', sampai: 'Sampai', dibatalkan: 'Dibatalkan',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminShopOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [detail, setDetail] = useState<ShopOrder | null>(null);

  async function load() {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const res = await fetch(`${API}/admin/shop/orders${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    setOrders(d.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(order: ShopOrder, status: string) {
    setUpdating(order.id);
    await fetch(`${API}/admin/shop/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    load();
  }

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Pesanan Shop</h1>
          <p className="text-gray-400 text-sm mt-0.5">{orders.length} pesanan ditemukan</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-gray-800 border border-white/[0.06] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari no. pesanan / nama..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-white/[0.06] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === s.value ? 'bg-emerald-500 text-white' : 'bg-gray-900 border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/20'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['No. Pesanan', 'Pelanggan', 'Produk', 'Total', 'Pembayaran', 'Pengiriman', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-600"><div className="text-4xl mb-2">📦</div><p>Belum ada pesanan</p></td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-white">{o.order_number}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(o.created_at)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-medium text-gray-200">{o.customer_name}</p>
                    <p className="text-[10px] text-gray-500">{o.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-1">
                      {o.items.slice(0, 3).map(item => (
                        <div key={item.id} className="w-7 h-7 rounded-lg border border-gray-800 overflow-hidden bg-emerald-900/40 flex-shrink-0">
                          <img src={item.product?.image_url ?? ''} alt=""
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=065f46&color=34d399&size=28`; }} />
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] text-gray-400 font-bold flex-shrink-0">
                          +{o.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{o.items.length} item</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-emerald-400">{fmt(o.total)}</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-lg">
                      {o.payment_method === 'cod' ? '💵 COD' : o.payment_method === 'transfer' ? '🏦 Transfer' : '📱 E-Wallet'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[10px] text-gray-400">{o.delivery_type === 'instant' ? '⚡ Instan' : '📅 Terjadwal'}</p>
                    {o.delivery_time && <p className="text-[10px] text-gray-500 capitalize">{o.delivery_time}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-gray-500/15 text-gray-400'}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setDetail(o)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-emerald-400 transition-all" title="Detail">
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      {NEXT_STATUS[o.status] && (
                        <button
                          onClick={() => updateStatus(o, NEXT_STATUS[o.status])}
                          disabled={updating === o.id}
                          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                          title="Proses ke status berikutnya"
                        >
                          {updating === o.id ? '...' : `→ ${STATUS_LABEL[NEXT_STATUS[o.status]]}`}
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button onClick={() => updateStatus(o, 'dibatalkan')}
                          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                          Batalkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="bg-gray-900 border border-white/[0.08] rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <p className="font-bold text-white font-mono">{detail.order_number}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[detail.status]}`}>
                  {STATUS_LABEL[detail.status]}
                </span>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="bg-white/[0.04] rounded-2xl p-4 space-y-1.5 text-sm">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Penerima</p>
                <p className="text-gray-200 font-medium">{detail.customer_name}</p>
                <p className="text-gray-400 text-xs">{detail.address}</p>
                <p className="text-gray-400 text-xs">{detail.phone}</p>
              </div>
              {/* Items */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Produk</p>
                <div className="space-y-2">
                  {detail.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-900/40 flex-shrink-0">
                        <img src={item.product?.image_url ?? ''} alt="" className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=065f46&color=34d399&size=40`; }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-200">{item.product?.name}</p>
                        <p className="text-[10px] text-gray-500">×{item.quantity} × {fmt(item.unit_price)}</p>
                      </div>
                      <p className="text-xs font-bold text-emerald-400">{fmt(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Totals */}
              <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between"><span>Subtotal</span><span>{fmt(detail.subtotal)}</span></div>
                <div className="flex justify-between"><span>Ongkos Kirim</span><span>{fmt(detail.delivery_fee)}</span></div>
                <div className="flex justify-between text-base font-bold text-white pt-1">
                  <span>Total</span><span className="text-emerald-400">{fmt(detail.total)}</span>
                </div>
              </div>
              {detail.tracking_code && (
                <p className="text-xs text-blue-400 font-mono bg-blue-500/10 px-3 py-2 rounded-xl">
                  🚚 Kode Tracking: {detail.tracking_code}
                </p>
              )}
              {detail.notes && (
                <p className="text-xs text-gray-400 bg-white/[0.03] px-3 py-2 rounded-xl">📝 {detail.notes}</p>
              )}
              {NEXT_STATUS[detail.status] && (
                <button
                  onClick={() => { updateStatus(detail, NEXT_STATUS[detail.status]); setDetail(null); }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
                  Proses → {STATUS_LABEL[NEXT_STATUS[detail.status]]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
