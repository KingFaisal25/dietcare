'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { ShopProduct } from '@/types/shop';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiSearch, FiX } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const CATS = ['makanan-utama', 'salad', 'snack', 'minuman', 'sarapan', 'sup'];

function Modal({ product, token, onClose, onSave }: {
  product: ShopProduct | null; token: string;
  onClose: () => void; onSave: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: String(product?.price ?? ''),
    calories: String(product?.calories ?? ''),
    protein: String(product?.protein ?? ''),
    fat: String(product?.fat ?? ''),
    carbs: String(product?.carbs ?? ''),
    category: product?.category ?? 'makanan-utama',
    is_healthy: product?.is_healthy ?? true,
    is_nutritionist_recommended: product?.is_nutritionist_recommended ?? false,
    nutritionist_label: product?.nutritionist_label ?? '',
    stock: String(product?.stock ?? '100'),
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, String(v)));
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);
      if (product) fd.append('_method', 'PUT');
      const url = product
        ? `${API}/admin/shop/products/${product.id}`
        : `${API}/admin/shop/products`;
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? 'Gagal');
      onSave();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg text-gray-900">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><FiX /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {err && <p className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{err}</p>}

          {/* Name + Price */}
          <div className="grid grid-cols-2 gap-3">
            {[['Nama Produk *', 'name', 'text'], ['Harga (Rp) *', 'price', 'number']].map(([lbl, key, typ]) => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">{lbl}</label>
                <input type={typ} required value={f[key as keyof typeof f] as string}
                  onChange={e => setF(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400" />
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Deskripsi</label>
            <textarea rows={2} value={f.description}
              onChange={e => setF(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400" />
          </div>

          {/* Nutrition Grid */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kandungan Gizi</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[['Kalori (kcal)', 'calories'], ['Protein (g)', 'protein'], ['Lemak (g)', 'fat'], ['Karbo (g)', 'carbs']].map(([lbl, key]) => (
                <div key={key}>
                  <label className="text-xs text-gray-600 mb-1 block">{lbl}</label>
                  <input type="number" step="0.1" value={f[key as keyof typeof f] as string}
                    onChange={e => setF(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Category + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Kategori</label>
              <select value={f.category} onChange={e => setF(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400">
                {CATS.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Stok</label>
              <input type="number" value={f.stock} onChange={e => setF(p => ({ ...p, stock: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-5">
            {([['is_healthy', '🥗 Healthy'], ['is_nutritionist_recommended', '⭐ Rekomendasi']] as const).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer" onClick={() => setF(p => ({ ...p, [key]: !p[key] }))}>
                <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${f[key] ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${f[key] ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-xs font-medium text-gray-700">{lbl}</span>
              </label>
            ))}
          </div>

          {f.is_nutritionist_recommended && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Label Rekomendasi</label>
              <input type="text" value={f.nutritionist_label} placeholder="mis. Tinggi Protein"
                onChange={e => setF(p => ({ ...p, nutritionist_label: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400" />
            </div>
          )}

          {/* Image */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Foto Produk</label>
            <input ref={fileRef} type="file" accept="image/*"
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">Batal</button>
            <button type="submit" disabled={busy}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm disabled:opacity-50 shadow-md hover:shadow-lg transition-all">
              {busy ? 'Menyimpan...' : product ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminShopProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ShopProduct | null>(null);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/admin/shop/products`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setProducts(d.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function del(id: number) {
    if (!confirm('Nonaktifkan produk ini?')) return;
    await fetch(`${API}/admin/shop/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  async function toggleRec(p: ShopProduct) {
    await fetch(`${API}/admin/shop/products/${p.id}/recommend`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: p.nutritionist_label }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Produk Shop</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} produk terdaftar</p>
        </div>
        <button onClick={() => { setSelected(null); setModal('add'); }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-all">
          <FiPlus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 border border-white/[0.06] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Produk', 'Kategori', 'Harga', 'Kalori', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded-lg w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-600"><div className="text-4xl mb-2">🥗</div><p>Belum ada produk</p></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-emerald-900/40 flex-shrink-0">
                        <img src={p.image_url} alt={p.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=065f46&color=34d399&size=36`; }} />
                      </div>
                      <div>
                        <p className="font-medium text-white text-xs max-w-[130px] truncate">{p.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.is_healthy && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Healthy</span>}
                          {p.is_nutritionist_recommended && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">⭐ Gizi</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 capitalize">{p.category.replace(/-/g, ' ')}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-emerald-400">{fmt(p.price)}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{p.calories} kcal</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{p.stock}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setSelected(p); setModal('edit'); }}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-emerald-400 transition-all" title="Edit">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleRec(p)}
                        className={`p-1.5 rounded-lg transition-all ${p.is_nutritionist_recommended ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:bg-white/5 hover:text-blue-400'}`}
                        title="Toggle rekomendasi gizi">
                        <FiStar className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(p.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all" title="Nonaktifkan">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          product={modal === 'edit' ? selected : null}
          token={token ?? ''}
          onClose={() => { setModal(null); setSelected(null); }}
          onSave={() => { setModal(null); setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
