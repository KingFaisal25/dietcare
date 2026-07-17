'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { ShopProduct } from '@/types/shop';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiSearch, FiX } from 'react-icons/fi';
import { gsap } from 'gsap';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const CATS = ['makanan-utama', 'salad', 'snack', 'minuman', 'sarapan', 'sup'];

function Modal({ product, onClose, onSave }: {
  product: ShopProduct | null;
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
      Object.entries(f).forEach(([k, v]) => {
        if (typeof v === 'boolean') {
          fd.append(k, v ? '1' : '0');
        } else {
          fd.append(k, String(v));
        }
      });
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);
      if (product) fd.append('_method', 'PUT');
      
      const url = product
        ? `/admin/shop/products/${product.id}`
        : '/admin/shop/products';
        
      const res = await api.post(url, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSave();
    } catch (e: any) {
      setErr(e.response?.data?.message ?? e.message ?? 'Gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-xl text-gray-900">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Kelola informasi produk kesehatan</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-6">
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-red-700">{err}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Informasi Dasar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={f.name}
                  onChange={e => setF(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                  placeholder="Contoh: Salad Ayam Panggang"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required 
                  value={f.price}
                  onChange={e => setF(p => ({ ...p, price: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                  placeholder="50000"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Stok</label>
                <input 
                  type="number" 
                  value={f.stock}
                  onChange={e => setF(p => ({ ...p, stock: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1.5 block">Deskripsi Produk</label>
              <textarea 
                rows={3} 
                value={f.description}
                onChange={e => setF(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none placeholder:text-gray-400"
                placeholder="Deskripsi lengkap tentang produk, bahan-bahan, dan manfaat kesehatan..."
              />
            </div>
          </div>

          {/* Category & Nutrition */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kategori & Gizi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Kategori</label>
                <select 
                  value={f.category} 
                  onChange={e => setF(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all appearance-none"
                >
                  {CATS.map(c => (
                    <option key={c} value={c} className="text-gray-900">
                      {c.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calories */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Kalori (kcal)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={f.calories}
                  onChange={e => setF(p => ({ ...p, calories: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                  placeholder="350"
                />
              </div>
            </div>

            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[['Protein (g)', 'protein'], ['Lemak (g)', 'fat'], ['Karbo (g)', 'carbs']].map(([lbl, key]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-900 mb-1.5 block">{lbl}</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={f[key as keyof typeof f] as string}
                    onChange={e => setF(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Features & Image */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Fitur & Gambar</h3>
            
            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([['is_healthy', '🥗 Healthy'], ['is_nutritionist_recommended', '⭐ Rekomendasi Ahli Gizi']] as const).map(([key, lbl]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lbl.split(' ')[0]}</span>
                    <span className="text-sm font-medium text-gray-900">{lbl.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setF(p => ({ ...p, [key]: !p[key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${f[key] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${f[key] ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Recommendation Label */}
            {f.is_nutritionist_recommended && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-1.5 block">Label Rekomendasi</label>
                <input 
                  type="text" 
                  value={f.nutritionist_label} 
                  placeholder="Contoh: Tinggi Protein, Rendah Gula, Sumber Serat"
                  onChange={e => setF(p => ({ ...p, nutritionist_label: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1.5 block">Foto Produk</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  id="product-image"
                />
                <label htmlFor="product-image" className="cursor-pointer">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Klik untuk upload gambar</p>
                  <p className="text-xs text-gray-500">Format: JPG, PNG, WebP (max 5MB)</p>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={busy}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminShopProductsPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ShopProduct | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/shop/products');
      setProducts(res.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // GSAP Animations for product grid
  useEffect(() => {
    if (!loading && filtered.length > 0 && gridRef.current) {
      // Reset opacity for animation
      gsap.set(gridRef.current.children, { opacity: 0, y: 20 });
      
      // Stagger animation for product cards
      gsap.to(gridRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.1
      });
    }
  }, [loading, filtered.length]);

  // Animation for search input focus
  const handleSearchFocus = () => {
    gsap.to('.search-container', {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleSearchBlur = () => {
    gsap.to('.search-container', {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  async function del(id: number) {
    if (!confirm('Nonaktifkan produk ini?')) return;
    try {
      await api.delete(`/admin/shop/products/${id}`);
      load();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleRec(p: ShopProduct) {
    try {
      await api.patch(`/admin/shop/products/${p.id}/recommend`, {
        label: p.nutritionist_label,
      });
      load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Shop</h1>
          <p className="text-gray-600 text-sm mt-0.5">{products.length} produk terdaftar</p>
        </div>
        <button 
          onClick={() => { setSelected(null); setModal('add'); }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md transition-all add-product-btn"
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.05,
              duration: 0.2,
              ease: "power2.out"
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              duration: 0.2,
              ease: "power2.out"
            });
          }}
        >
          <FiPlus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      <div className="relative max-w-sm search-container">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Cari produk..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded-lg w-16"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🥗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada produk</h3>
          <p className="text-gray-600 mb-6">Mulai dengan menambahkan produk pertama Anda</p>
          <button onClick={() => { setSelected(null); setModal('add'); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md transition-all">
            <FiPlus className="w-4 h-4" /> Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
             <div 
               key={p.id} 
               className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group product-card"
               onMouseEnter={(e) => {
                 gsap.to(e.currentTarget, {
                   y: -5,
                   duration: 0.3,
                   ease: "power2.out"
                 });
               }}
               onMouseLeave={(e) => {
                 gsap.to(e.currentTarget, {
                   y: 0,
                   duration: 0.3,
                   ease: "power2.out"
                 });
               }}
             >
              {/* Product Image */}
              <div className="relative aspect-square bg-emerald-50 overflow-hidden">
                <img 
                  src={p.image_url} 
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=065f46&color=34d399&size=400`; }}
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(p); setModal('edit'); }}
                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 hover:text-emerald-600 hover:bg-white transition-all shadow-sm" title="Edit">
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleRec(p)}
                      className={`p-1.5 rounded-lg backdrop-blur-sm shadow-sm transition-all ${p.is_nutritionist_recommended ? 'bg-blue-50 text-blue-600' : 'bg-white/90 text-gray-700 hover:text-blue-600 hover:bg-white'}`}
                      title="Toggle rekomendasi gizi">
                      <FiStar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Category Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full capitalize">
                    {p.category.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{p.name}</h3>
                  <div className="text-xs font-bold text-emerald-600 ml-2">{fmt(p.price)}</div>
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description || 'Tidak ada deskripsi'}</p>
                
                {/* Nutrition Info */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-900">{p.calories}</div>
                    <div className="text-[10px] text-gray-500">Kalori</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-900">{p.protein}g</div>
                    <div className="text-[10px] text-gray-500">Protein</div>
                  </div>
                </div>
                
                {/* Tags and Stock */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {p.is_healthy && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Healthy</span>}
                    {p.is_nutritionist_recommended && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">⭐ Gizi</span>}
                  </div>
                  <div className="text-xs text-gray-600">
                    Stok: <span className={`font-bold ${Number(p.stock) < 10 ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button onClick={() => del(p.id)}
                  className="mt-3 w-full py-2 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  Nonaktifkan Produk
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          product={modal === 'edit' ? selected : null}
          onClose={() => { setModal(null); setSelected(null); }}
          onSave={() => { setModal(null); setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
