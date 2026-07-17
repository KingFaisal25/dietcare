'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FiArrowLeft, FiPlus, FiTrash2, FiSave,
  FiLoader, FiCheckCircle
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ProgramForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  duration_days: string;
  max_consultations: string;
  features: string[];
  is_active: boolean;
}

const EMPTY_FORM: ProgramForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  duration_days: '',
  max_consultations: '',
  features: [],
  is_active: true,
};

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export default function NewProgramPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [slugLocked, setSlugLocked] = useState(true);

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      ...(slugLocked ? { slug: toSlug(value) } : {}),
    }));
    setErrors((e) => ({ ...e, name: '' }));
  };

  const handleSlugChange = (value: string) => {
    setSlugLocked(false);
    setForm((prev) => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
    setErrors((e) => ({ ...e, slug: '' }));
  };

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (form.features.includes(trimmed)) {
      toast.error('Fitur sudah ada dalam daftar');
      return;
    }
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama program wajib diisi';
    if (!form.slug.trim()) e.slug = 'Slug wajib diisi';
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi';
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) e.price = 'Harga harus lebih dari 0';
    const dur = parseInt(form.duration_days, 10);
    if (isNaN(dur) || dur <= 0) e.duration_days = 'Durasi harus lebih dari 0 hari';
    const cons = parseInt(form.max_consultations, 10);
    if (isNaN(cons) || cons <= 0) e.max_consultations = 'Max konsultasi harus lebih dari 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Periksa kembali isian formulir');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/admin/programs', {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        duration_days: parseInt(form.duration_days, 10),
        max_consultations: parseInt(form.max_consultations, 10),
        features: form.features,
        is_active: form.is_active,
      });
      toast.success('Program berhasil dibuat!');
      router.push('/admin/programs');
    } catch (error: any) {
      if (error?.response?.status === 422) {
        const serverErrors = error.response.data?.errors || {};
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(serverErrors)) {
          mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
        }
        setErrors(mapped);
        toast.error('Periksa kembali isian formulir');
      } else {
        toast.error('Gagal membuat program baru. Coba lagi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 rounded-2xl border text-sm font-medium bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-neutral-200'
    }`;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-neutral-500 hover:text-neutral-900">
              <FiArrowLeft className="mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 leading-tight">
              Program Baru
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-0.5">
              Buat paket program konsultasi gizi baru
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 shadow-lg shadow-brand-100 h-12"
        >
          {isSaving ? (
            <><FiLoader className="animate-spin mr-2" /> Menyimpan...</>
          ) : (
            <><FiSave className="mr-2" /> Simpan Program</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-sm rounded-[32px] bg-white space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Informasi Umum</h2>

            {/* Nama Program */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Nama Program *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="cth. Body Transformation 30 Hari"
                className={fieldClass('name')}
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Slug URL *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="cth. body-transformation-30-hari"
                className={fieldClass('slug')}
              />
              {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug}</p>}
              <p className="text-xs text-neutral-400 font-medium">Link publik: /program/{form.slug || 'slug'}</p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Deskripsi *</label>
              <textarea
                value={form.description}
                onChange={(e) => {
                  setForm((p) => ({ ...p, description: e.target.value }));
                  setErrors((errs) => ({ ...errs, description: '' }));
                }}
                rows={5}
                placeholder="Tulis deskripsi program secara lengkap..."
                className={`${fieldClass('description')} resize-none`}
              />
              {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-sm rounded-[32px] bg-white space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Konfigurasi Program</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Harga */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700">Harga (Rp) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, price: e.target.value }));
                    setErrors((errs) => ({ ...errs, price: '' }));
                  }}
                  placeholder="cth. 350000"
                  className={fieldClass('price')}
                />
                {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
              </div>

              {/* Durasi */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-700">Durasi (Hari) *</label>
                <input
                  type="number"
                  value={form.duration_days}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, duration_days: e.target.value }));
                    setErrors((errs) => ({ ...errs, duration_days: '' }));
                  }}
                  placeholder="cth. 30"
                  className={fieldClass('duration_days')}
                />
                {errors.duration_days && <p className="text-xs text-red-500 font-medium">{errors.duration_days}</p>}
              </div>
            </div>

            {/* Maksimum Konsultasi */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Batas Konsultasi Video Call *</label>
              <input
                type="number"
                value={form.max_consultations}
                onChange={(e) => {
                  setForm((p) => ({ ...p, max_consultations: e.target.value }));
                  setErrors((errs) => ({ ...errs, max_consultations: '' }));
                }}
                placeholder="cth. 4"
                className={fieldClass('max_consultations')}
              />
              {errors.max_consultations && <p className="text-xs text-red-500 font-medium">{errors.max_consultations}</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6 border-none shadow-sm rounded-[24px] bg-white space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Status Layanan</h3>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className={`w-full py-3 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                form.is_active
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <FiCheckCircle size={16} /> {form.is_active ? 'Aktif / Ditampilkan' : 'Draft / Disembunyikan'}
            </button>
          </Card>

          {/* Fitur */}
          <Card className="p-6 border-none shadow-sm rounded-[24px] bg-white space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Fitur Program</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                placeholder="Tambah fitur..."
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl"
              >
                <FiPlus />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {form.features.map((feature, idx) => (
                <div key={idx} className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-xs font-semibold text-neutral-700">
                  <span className="truncate pr-2">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              {form.features.length === 0 && (
                <p className="text-neutral-400 text-xs italic text-center py-4">Belum ada fitur ditambahkan</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
