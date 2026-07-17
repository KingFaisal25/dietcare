'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  FiTag, FiPlus, FiSearch, FiEdit2, FiTrash2,
  FiLoader, FiX, FiSave, FiPercent, FiDollarSign, FiCalendar
} from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PromoCode {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  max_uses?: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_purchase: '',
  max_discount: '',
  max_uses: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
};

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function PromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/promo?page=${page}&search=${search}`);
      setPromos(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
    } catch {
      toast.error('Gagal memuat data promo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, [page, search]);

  const openCreate = () => {
    setEditingPromo(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setForm({
      code: promo.code,
      name: promo.name,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_purchase: promo.min_purchase ? String(promo.min_purchase) : '',
      max_discount: promo.max_discount ? String(promo.max_discount) : '',
      max_uses: promo.max_uses ? String(promo.max_uses) : '',
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      is_active: promo.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.discount_value) {
      toast.error('Kode, nama, dan nilai diskon wajib diisi');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : null,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
      };
      if (editingPromo) {
        await api.put(`/admin/promo/${editingPromo.id}`, payload);
        toast.success('Kode promo berhasil diperbarui');
      } else {
        await api.post('/admin/promo', payload);
        toast.success('Kode promo berhasil dibuat');
      }
      closeModal();
      fetchPromos();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan promo';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    if (!confirm(`Hapus kode promo "${promo.code}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/admin/promo/${promo.id}`);
      toast.success('Kode promo berhasil dihapus');
      fetchPromos();
    } catch {
      toast.error('Gagal menghapus kode promo');
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      await api.put(`/admin/promo/${promo.id}`, { is_active: !promo.is_active });
      toast.success(`Promo ${!promo.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchPromos();
    } catch {
      toast.error('Gagal mengubah status promo');
    }
  };

  const isExpired = (promo: PromoCode) => {
    if (!promo.valid_until) return false;
    return new Date(promo.valid_until) < new Date();
  };

  const getStatusBadge = (promo: PromoCode) => {
    if (isExpired(promo)) return <Badge variant="danger">Kadaluarsa</Badge>;
    if (!promo.is_active) return <Badge variant="default">Nonaktif</Badge>;
    return <Badge variant="success">Aktif</Badge>;
  };

  return (
    <div className="p-6 space-y-6 bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Manajemen Promo</h1>
          <p className="text-neutral-500 text-sm font-medium">Kelola kode diskon dan voucher untuk klien</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-100"
        >
          <FiPlus className="mr-2" /> Buat Kode Promo
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-none shadow-sm rounded-2xl bg-white">
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Cari kode promo..."
            className="pl-12 bg-neutral-50 border-neutral-200 rounded-xl text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-none shadow-sm rounded-[32px] bg-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <FiLoader className="w-10 h-10 text-brand-500 animate-spin" />
              <p className="text-neutral-400 font-bold italic">Memuat data promo...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase font-black tracking-widest border-b border-neutral-100">
                  <tr>
                    <th className="px-8 py-5">Kode</th>
                    <th className="px-8 py-5">Nama</th>
                    <th className="px-8 py-5">Diskon</th>
                    <th className="px-8 py-5">Penggunaan</th>
                    <th className="px-8 py-5">Berlaku</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-sm">
                  {promos.length > 0 ? promos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-black text-neutral-900 font-mono bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-100 text-xs uppercase">
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-neutral-900">{promo.name}</p>
                        {promo.description && (
                          <p className="text-xs text-neutral-400 mt-0.5 max-w-[200px] truncate">{promo.description}</p>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-brand-600">
                          {promo.discount_type === 'percent'
                            ? `${promo.discount_value}%`
                            : formatRupiah(promo.discount_value)
                          }
                        </span>
                        {promo.min_purchase && (
                          <p className="text-xs text-neutral-400">Min: {formatRupiah(promo.min_purchase)}</p>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-neutral-700">
                          {promo.used_count} / {promo.max_uses ?? '∞'}
                        </span>
                        {promo.max_uses && promo.used_count >= promo.max_uses && (
                          <Badge variant="danger" className="ml-2 text-[9px]">Habis</Badge>
                        )}
                      </td>
                      <td className="px-8 py-5 text-neutral-500 font-medium text-xs">
                        {promo.valid_from ? new Date(promo.valid_from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        {' – '}
                        {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-8 py-5">{getStatusBadge(promo)}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(promo)}
                            title={promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className={`p-2 rounded-xl transition-all text-sm font-bold ${
                              promo.is_active
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-neutral-400 hover:bg-neutral-100'
                            }`}
                          >
                            {promo.is_active ? '●' : '○'}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(promo)}
                            className="h-9 px-3 rounded-xl font-bold text-brand-600 hover:bg-brand-50"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(promo)}
                            className="h-9 px-3 rounded-xl font-bold text-red-500 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-neutral-200">
                            <FiTag className="w-8 h-8 text-neutral-300" />
                          </div>
                          <p className="text-neutral-400 font-bold">Belum ada kode promo.</p>
                          <Button onClick={openCreate} className="bg-brand-500 text-white font-bold rounded-xl">
                            <FiPlus className="mr-2" /> Buat Kode Promo Pertama
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="p-6 border-t border-neutral-100 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        page === i + 1
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-100'
                          : 'bg-white text-neutral-400 border border-neutral-100 hover:bg-neutral-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPromo ? 'Edit Kode Promo' : 'Buat Kode Promo Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Kode Promo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="cth. DIET20"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm font-mono font-bold bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Nama Promo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="cth. Diskon Ramadhan"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi singkat kode promo (opsional)"
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Tipe Diskon</label>
              <div className="flex gap-2">
                {(['percent', 'fixed'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, discount_type: t }))}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      form.discount_type === t
                        ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-100'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {t === 'percent' ? <><FiPercent size={14} /> Persen</> : <><FiDollarSign size={14} /> Nominal</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Nilai Diskon <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))}
                placeholder={form.discount_type === 'percent' ? 'cth. 20' : 'cth. 50000'}
                min={0}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Min. Pembelian (Rp)</label>
              <input
                type="number"
                value={form.min_purchase}
                onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))}
                placeholder="opsional"
                min={0}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                {form.discount_type === 'percent' ? 'Maks. Diskon (Rp)' : 'Maks. Penggunaan'}
              </label>
              <input
                type="number"
                value={form.discount_type === 'percent' ? form.max_discount : form.max_uses}
                onChange={e => setForm(p => ({
                  ...p,
                  ...(form.discount_type === 'percent' ? { max_discount: e.target.value } : { max_uses: e.target.value })
                }))}
                placeholder="opsional"
                min={0}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                <FiCalendar className="inline mr-1" /> Berlaku Dari
              </label>
              <input
                type="date"
                value={form.valid_from}
                onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                <FiCalendar className="inline mr-1" /> Berlaku Hingga
              </label>
              <input
                type="date"
                value={form.valid_until}
                onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 text-sm bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <input
              id="promo-active"
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-5 h-5 rounded accent-brand-500"
            />
            <label htmlFor="promo-active" className="text-sm font-bold text-neutral-700 cursor-pointer">
              Aktifkan kode promo ini sekarang
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-brand-100"
            >
              {isSaving
                ? <><FiLoader className="animate-spin mr-2 inline" />Menyimpan...</>
                : <><FiSave className="mr-2 inline" />{editingPromo ? 'Simpan Perubahan' : 'Buat Promo'}</>
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
