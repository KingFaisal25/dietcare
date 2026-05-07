'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FiArrowLeft, FiPlus, FiTrash2, FiSave, FiSettings,
  FiLoader, FiCheckCircle, FiAlertCircle, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Slug helper ─────────────────────────────────────────────────────────────

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

// ─── Currency formatter ───────────────────────────────────────────────────────

const formatRupiah = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const programId = resolvedParams.id;
  const router = useRouter();
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [slugLocked, setSlugLocked] = useState(true); // Slug derived from name unless manually edited

  // ── Fetch program data ────────────────────────────────────────────────────

  const fetchProgram = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/programs/${programId}`);
      const p = res.data;
      setForm({
        name: p.name ?? '',
        slug: p.slug ?? '',
        description: p.description ?? '',
        price: p.price != null ? String(p.price) : '',
        duration_days: p.duration_days != null ? String(p.duration_days) : '',
        max_consultations: p.max_consultations != null ? String(p.max_consultations) : '',
        features: Array.isArray(p.features) ? p.features : [],
        is_active: !!p.is_active,
      });
    } catch {
      toast.error('Gagal memuat data program');
      router.push('/admin/programs');
    } finally {
      setIsLoading(false);
    }
  }, [programId, router]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  // ── Auto-slug from name (only when slug is still "locked") ────────────────

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

  // ── Feature management ────────────────────────────────────────────────────

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

  // ── Validation ────────────────────────────────────────────────────────────

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

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Periksa kembali isian formulir');
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/admin/programs/${programId}`, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        duration_days: parseInt(form.duration_days, 10),
        max_consultations: parseInt(form.max_consultations, 10),
        features: form.features,
        is_active: form.is_active,
      });
      toast.success('Program berhasil diperbarui!');
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
        toast.error('Gagal menyimpan perubahan. Coba lagi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Field helpers ─────────────────────────────────────────────────────────

  const fieldClass = (field: string) =>
    `w-full px-4 py-3 rounded-2xl border text-sm font-medium bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-neutral-200'
    }`;

  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <FiLoader className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-neutral-400 font-bold italic">Memuat data program...</p>
      </div>
    );
  }

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
              Edit Program
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-0.5">
              {form.name || `Program #${programId}`}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 shadow-lg shadow-brand-100 h-12"
        >
          {isSaving ? (
            <><FiLoader className="animate-spin mr-2" />Menyimpan...</>
          ) : (
            <><FiSave className="mr-2" />Simpan Perubahan</>
          )}
        </Button>
      </div>

      {/* ── Section 1: Info Umum ─────────────────────────────────────────── */}
      <Card className="rounded-3xl border-none shadow-sm bg-white p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <FiSettings className="w-4 h-4 text-brand-600" />
          </div>
          <h2 className="text-base font-black text-neutral-900">Informasi Umum</h2>
        </div>

        {/* Name + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Nama Program <span className="text-red-500">*</span>
            </label>
            <input
              id="program-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="cth. Body Goals"
              className={fieldClass('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm select-none">/</span>
              <input
                id="program-slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="body-goals"
                className={`${fieldClass('slug')} pl-7`}
              />
            </div>
            {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug}</p>}
            <p className="text-xs text-neutral-400 mt-1">
              {slugLocked ? 'Otomatis dari nama. ' : ''}
              <button type="button" onClick={() => setSlugLocked(!slugLocked)} className="text-brand-500 underline">
                {slugLocked ? 'Edit manual' : 'Kunci otomatis'}
              </button>
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            id="program-description"
            value={form.description}
            onChange={(e) => {
              setForm((p) => ({ ...p, description: e.target.value }));
              setErrors((er) => ({ ...er, description: '' }));
            }}
            rows={4}
            placeholder="Jelaskan program ini secara singkat untuk calon klien..."
            className={`${fieldClass('description')} resize-none leading-relaxed`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Price + Duration + Max Consultations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Harga (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="program-price"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => {
                setForm((p) => ({ ...p, price: e.target.value }));
                setErrors((er) => ({ ...er, price: '' }));
              }}
              placeholder="279900"
              className={fieldClass('price')}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1 font-medium">{errors.price}</p>}
            {form.price && !isNaN(parseFloat(form.price)) && (
              <p className="text-xs text-neutral-400 mt-1">{formatRupiah(form.price)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Durasi (Hari) <span className="text-red-500">*</span>
            </label>
            <input
              id="program-duration"
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(e) => {
                setForm((p) => ({ ...p, duration_days: e.target.value }));
                setErrors((er) => ({ ...er, duration_days: '' }));
              }}
              placeholder="30"
              className={fieldClass('duration_days')}
            />
            {errors.duration_days && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.duration_days}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Max Konsultasi <span className="text-red-500">*</span>
            </label>
            <input
              id="program-max-consultations"
              type="number"
              min={1}
              value={form.max_consultations}
              onChange={(e) => {
                setForm((p) => ({ ...p, max_consultations: e.target.value }));
                setErrors((er) => ({ ...er, max_consultations: '' }));
              }}
              placeholder="4"
              className={fieldClass('max_consultations')}
            />
            {errors.max_consultations && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.max_consultations}</p>
            )}
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between py-4 px-5 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div>
            <p className="text-sm font-bold text-neutral-800">Status Program</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {form.is_active
                ? 'Program aktif dan terlihat oleh klien'
                : 'Program tidak aktif (tersembunyi dari publik)'}
            </p>
          </div>
          <button
            id="program-status-toggle"
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              form.is_active
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                : 'bg-neutral-200 text-neutral-500'
            }`}
          >
            {form.is_active ? (
              <><FiToggleRight className="w-5 h-5" /> Aktif</>
            ) : (
              <><FiToggleLeft className="w-5 h-5" /> Non-aktif</>
            )}
          </button>
        </div>
      </Card>

      {/* ── Section 2: Fitur Program ─────────────────────────────────────── */}
      <Card className="rounded-3xl border-none shadow-sm bg-white p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <FiCheckCircle className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">Fitur Program</h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              Daftar keunggulan yang akan tampil di halaman publik
            </p>
          </div>
        </div>

        {/* Add Feature Input */}
        <div className="flex gap-3">
          <input
            id="new-feature-input"
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={handleFeatureKeyDown}
            placeholder="cth. Personalized Meal Plan — tekan Enter untuk tambah"
            className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 text-sm font-medium bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
          />
          <Button
            type="button"
            onClick={addFeature}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl h-12 px-5 shrink-0"
          >
            <FiPlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Feature List */}
        {form.features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl gap-2">
            <FiAlertCircle className="w-8 h-8 text-neutral-300" />
            <p className="text-sm text-neutral-400 font-medium">Belum ada fitur. Tambahkan di atas.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {form.features.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 group px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-brand-200 hover:bg-brand-50/30 transition-all"
              >
                <FiCheckCircle className="text-brand-500 flex-shrink-0 w-4 h-4" />
                <span className="flex-1 text-sm font-medium text-neutral-700">{feat}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Hapus fitur"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-neutral-400">
          {form.features.length} fitur terdaftar
        </p>
      </Card>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between py-5 px-6 bg-white rounded-3xl border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge
            variant={form.is_active ? 'success' : 'default'}
            className="font-bold text-[10px] uppercase tracking-wider"
          >
            {form.is_active ? 'Aktif' : 'Non-aktif'}
          </Badge>
          <span className="text-xs text-neutral-400 font-medium">
            {form.name || 'Program'}
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/programs">
            <Button variant="outline" className="rounded-xl font-bold border-neutral-200">
              Batal
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 shadow-lg shadow-brand-100"
          >
            {isSaving ? (
              <><FiLoader className="animate-spin mr-2" />Menyimpan...</>
            ) : (
              <><FiSave className="mr-2" />Simpan Perubahan</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
