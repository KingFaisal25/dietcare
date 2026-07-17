'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { ShopOrder } from '@/types/shop';
import { FiSearch, FiEye, FiRefreshCw, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { gsap } from 'gsap';

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
  pending:    'bg-amber-100 text-amber-700',
  diproses:   'bg-blue-100 text-blue-700',
  dikirim:    'bg-violet-100 text-violet-700',
  sampai:     'bg-emerald-100 text-emerald-700',
  dibatalkan: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', diproses: 'Diproses',
  dikirim: 'Dikirim', sampai: 'Sampai', dibatalkan: 'Dibatalkan',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminShopOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [detail, setDetail] = useState<ShopOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter and pagination logic moved above useEffect
  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filtered.slice(startIndex, startIndex + itemsPerPage);

  async function load() {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await api.get(`/admin/shop/orders${params}`);
      setOrders(res.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    if (!loading && tableRef.current) {
      gsap.set(tableRef.current.querySelectorAll('.order-row'), { opacity: 0, y: 15 });
      gsap.to(tableRef.current.querySelectorAll('.order-row'), {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.1
      });
    }
  }, [loading, filtered.length]);

  const handleSearchFocus = () => {
    gsap.to('.search-container', { scale: 1.02, duration: 0.2, ease: 'power2.out' });
  };

  const handleSearchBlur = () => {
    gsap.to('.search-container', { scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  async function updateStatus(order: ShopOrder, status: string) {
    setUpdating(order.id);
    try {
      await api.patch(`/admin/shop/orders/${order.id}/status`, { status });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Shop</h1>
          <p className="text-gray-600 text-sm mt-0.5">{orders.length} pesanan ditemukan</p>
        </div>
        <button 
          onClick={load} 
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow"
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.03, duration: 0.15 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm search-container">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Cari no. pesanan / nama..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button 
              key={s.value} 
              onClick={() => { setFilter(s.value); setCurrentPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow ${
                filter === s.value 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400'
              }`}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -2, duration: 0.2 })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.2 })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['No. Pesanan', 'Pelanggan', 'Produk', 'Total', 'Pembayaran', 'Pengiriman', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded-lg w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-500"><div className="text-4xl mb-4">📦</div><p className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan</p><p className="text-gray-600">Pesanan baru akan muncul di sini</p></td></tr>
              ) : currentOrders.map((o) => (
                <tr key={o.id} className="order-row hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-gray-900">{o.order_number}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(o.created_at)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-medium text-gray-900">{o.customer_name}</p>
                    <p className="text-[10px] text-gray-500">{o.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-1">
                      {o.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-7 h-7 rounded-lg border border-gray-300 overflow-hidden bg-emerald-50 flex-shrink-0">
                          <img src={item.product?.image_url ?? ''} alt="" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=065f46&color=34d399&size=28`} />
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-[9px] text-gray-700 font-bold flex-shrink-0">
                          +{o.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{o.items.length} item</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-emerald-600">{fmt(o.total)}</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg font-medium">
                      {o.payment_method === 'cod' ? '💵 COD' : o.payment_method === 'transfer' ? '🏦 Transfer' : '📱 E-Wallet'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[10px] text-gray-700 font-medium">{o.delivery_type === 'instant' ? '⚡ Instan' : '📅 Terjadwal'}</p>
                    {o.delivery_time && <p className="text-[10px] text-gray-500 capitalize">{o.delivery_time}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setDetail(o)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all" 
                        title="Detail"
                        onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.15 })}
                        onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      {NEXT_STATUS[o.status] && (
                        <button
                          onClick={() => updateStatus(o, NEXT_STATUS[o.status])}
                          disabled={updating === o.id}
                          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all disabled:opacity-50 shadow-sm hover:shadow"
                          title="Proses ke status berikutnya"
                        >
                          {updating === o.id ? '...' : `→ ${STATUS_LABEL[NEXT_STATUS[o.status]]}`}
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(o, 'dibatalkan')}
                          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm hover:shadow"
                        >
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
        
        {!loading && filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              Menampilkan {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filtered.length)} dari {filtered.length} pesanan
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDetail(null)}>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <p className="font-bold text-gray-900 font-mono">{detail.order_number}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[detail.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABEL[detail.status] ?? detail.status}
                </span>
              </div>
              <button 
                onClick={() => setDetail(null)} 
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5 text-sm">
                <p className="text-xs font-bold text-gray-700 uppercase mb-2">Penerima</p>
                <p className="text-gray-900 font-medium">{detail.customer_name}</p>
                <p className="text-gray-600 text-xs">{detail.address}</p>
                <p className="text-gray-600 text-xs">{detail.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-2">Produk</p>
                <div className="space-y-2">
                  {detail.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0 border border-gray-200">
                        <img src={item.product?.image_url ?? ''} alt="" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=065f46&color=34d399&size=40`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-[10px] text-gray-500">×{item.quantity} × {fmt(item.unit_price)}</p>
                      </div>
                      <p className="text-xs font-bold text-emerald-600">{fmt(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>{fmt(detail.subtotal)}</span></div>
                <div className="flex justify-between"><span>Ongkos Kirim</span><span>{fmt(detail.delivery_fee)}</span></div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                  <span>Total</span><span className="text-emerald-600">{fmt(detail.total)}</span>
                </div>
              </div>
              {detail.tracking_code && (
                <p className="text-xs text-blue-700 font-mono bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  🚚 Kode Tracking: {detail.tracking_code}
                </p>
              )}
              {detail.notes && (
                <p className="text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">📝 {detail.notes}</p>
              )}
              {NEXT_STATUS[detail.status] && (
                <button
                  onClick={() => { updateStatus(detail, NEXT_STATUS[detail.status]); setDetail(null); }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                >
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
