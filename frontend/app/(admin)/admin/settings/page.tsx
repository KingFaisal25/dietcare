'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FiUser, FiSettings, FiMail, FiCreditCard, FiBell,
  FiBarChart2, FiSave, FiSend, FiToggleLeft, FiToggleRight,
  FiLoader, FiCheckCircle,
} from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface SystemSettings {
  site_name: string;
  whatsapp_number: string;
  admin_email: string;
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
}

const EMPTY_PROFILE: ProfileForm = { name: '', email: '', phone: '' };

const EMPTY_SYSTEM: SystemSettings = {
  site_name: '',
  whatsapp_number: '',
  admin_email: '',
  hours_weekday: '',
  hours_saturday: '',
  hours_sunday: '',
};

// ─── Shared field style ───────────────────────────────────────────────────────

const field = (err?: string) =>
  `w-full px-4 py-3 rounded-2xl border text-sm font-medium bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all ${
    err ? 'border-red-400 bg-red-50' : 'border-neutral-200'
  }`;

// ─── Profil Admin Tab ─────────────────────────────────────────────────────────

function ProfileTab() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/me');
      const u = res.data?.data ?? res.data;
      setForm({
        name: u.name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
      });
    } catch {
      toast.error('Gagal memuat data profil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    else if (form.name.length > 255) e.name = 'Nama maksimal 255 karakter';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (form.phone && form.phone.length > 30) e.phone = 'Nomor telepon maksimal 30 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await api.put('/admin/profile', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      });
      toast.success('Profil berhasil diperbarui');
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
        toast.error('Gagal menyimpan profil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <FiUser className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <h2 className="text-base font-black text-neutral-900">Profil Admin</h2>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">
            Informasi akun yang digunakan untuk login dan korespondensi
          </p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center text-brand-600 font-black text-2xl select-none">
          {form.name ? form.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-800">{form.name || 'Admin'}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{form.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            id="admin-name"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="cth.  Nurjanah"
            className={field(errors.name)}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">
            Alamat Email <span className="text-red-500">*</span>
          </label>
          <input
            id="admin-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="admin@dietcare.id"
            className={field(errors.email)}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
          <p className="text-xs text-neutral-400 mt-1">
            Digunakan untuk login dan menerima notifikasi sistem
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">
            Nomor Telepon / WhatsApp
            <span className="text-neutral-400 font-normal ml-1">(opsional)</span>
          </label>
          <input
            id="admin-phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="cth. 6281234567890"
            className={field(errors.phone)}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-brand-100"
        >
          {isSaving ? (
            <><FiLoader className="animate-spin mr-2" />Menyimpan...</>
          ) : (
            <><FiSave className="mr-2" />Simpan Profil</>
          )}
        </Button>
      </div>
    </Card>
  );
}

// ─── Umum Tab ────────────────────────────────────────────────────────────────

function UmumTab() {
  const [form, setForm] = useState<SystemSettings>(EMPTY_SYSTEM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/settings');
      // API returns settings grouped: { general: [{key, value}, ...], ... }
      // Flatten into key→value map
      const data: Record<string, string> = {};
      const grouped = res.data;
      for (const group of Object.values(grouped)) {
        if (Array.isArray(group)) {
          for (const item of group as { key: string; value: string }[]) {
            data[item.key] = item.value ?? '';
          }
        }
      }
      setForm({
        site_name: data['site_name'] ?? '',
        whatsapp_number: data['whatsapp_number'] ?? '',
        admin_email: data['admin_email'] ?? '',
        hours_weekday: data['hours_weekday'] ?? '',
        hours_saturday: data['hours_saturday'] ?? '',
        hours_sunday: data['hours_sunday'] ?? '',
      });
    } catch {
      toast.error('Gagal memuat pengaturan sistem');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/admin/settings', {
        settings: {
          site_name:        { value: form.site_name,        group: 'general' },
          whatsapp_number:  { value: form.whatsapp_number,  group: 'general' },
          admin_email:      { value: form.admin_email,      group: 'general' },
          hours_weekday:    { value: form.hours_weekday,    group: 'general' },
          hours_saturday:   { value: form.hours_saturday,   group: 'general' },
          hours_sunday:     { value: form.hours_sunday,     group: 'general' },
        },
      });
      toast.success('Pengaturan umum berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof SystemSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white p-8 space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <FiSettings className="w-4 h-4 text-brand-600" />
        </div>
        <h2 className="text-base font-black text-neutral-900">Pengaturan Umum</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">Nama Website</label>
          <input id="site-name" type="text" value={form.site_name} onChange={set('site_name')}
            placeholder="DietCare" className={field()} />
        </div>
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">Nomor WhatsApp Utama</label>
          <input id="whatsapp-number" type="tel" value={form.whatsapp_number} onChange={set('whatsapp_number')}
            placeholder="6281234567890" className={field()} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">Email Admin</label>
          <input id="admin-email-setting" type="email" value={form.admin_email} onChange={set('admin_email')}
            placeholder="admin@dietcare.id" className={field()} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-neutral-700 mb-3">Jam Operasional Layanan</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 font-bold mb-1.5">Senin – Jumat</label>
            <input id="hours-weekday" type="text" value={form.hours_weekday} onChange={set('hours_weekday')}
              placeholder="08:00 – 17:00" className={field()} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 font-bold mb-1.5">Sabtu</label>
            <input id="hours-saturday" type="text" value={form.hours_saturday} onChange={set('hours_saturday')}
              placeholder="09:00 – 15:00" className={field()} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 font-bold mb-1.5">Minggu</label>
            <input id="hours-sunday" type="text" value={form.hours_sunday} onChange={set('hours_sunday')}
              placeholder="Libur" className={field()} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-brand-100"
        >
          {isSaving ? (
            <><FiLoader className="animate-spin mr-2" />Menyimpan...</>
          ) : (
            <><FiSave className="mr-2" />Simpan Pengaturan</>
          )}
        </Button>
      </div>
    </Card>
  );
}

// ─── Static tab placeholders ──────────────────────────────────────────────────

function PlaceholderCard({ label }: { label: string }) {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white p-8">
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
        <FiCheckCircle className="w-10 h-10 text-neutral-300" />
        <p className="text-sm font-bold text-neutral-400">Pengaturan {label} — coming soon</p>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profil',     label: 'Profil Admin',  icon: <FiUser /> },
  { id: 'umum',       label: 'Umum',          icon: <FiSettings /> },
  { id: 'email',      label: 'Email SMTP',    icon: <FiMail /> },
  { id: 'pembayaran', label: 'Pembayaran',    icon: <FiCreditCard /> },
  { id: 'notifikasi', label: 'Notifikasi',    icon: <FiBell /> },
  { id: 'seo',        label: 'SEO & Tracking',icon: <FiBarChart2 /> },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profil');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 leading-tight">Konfigurasi Sistem</h1>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Pengaturan global platform, profil admin, email, dan pembayaran
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-60 flex-shrink-0">
          <Card className="p-2 space-y-0.5 rounded-3xl border-none shadow-sm bg-white">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-100'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profil'     && <ProfileTab />}
          {activeTab === 'umum'       && <UmumTab />}
          {activeTab === 'email'      && <EmailPlaceholder />}
          {activeTab === 'pembayaran' && <PlaceholderCard label="Pembayaran" />}
          {activeTab === 'notifikasi' && <PlaceholderCard label="Notifikasi" />}
          {activeTab === 'seo'        && <PlaceholderCard label="SEO & Tracking" />}
        </div>
      </div>
    </div>
  );
}

// ─── Email tab (static — kept for reference, no API yet) ─────────────────────

function EmailPlaceholder() {
  const [isSending, setIsSending] = useState(false);

  const testEmail = async () => {
    setIsSending(true);
    try {
      await api.post('/admin/settings/test-email', {});
      toast.success('Email percobaan berhasil dikirim');
    } catch {
      toast.error('Gagal mengirim email percobaan');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white p-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <FiMail className="w-4 h-4 text-brand-600" />
          </div>
          <h2 className="text-base font-black text-neutral-900">Pengaturan SMTP Email</h2>
        </div>
        <Button
          variant="outline"
          onClick={testEmail}
          disabled={isSending}
          className="rounded-2xl font-bold border-neutral-200 text-sm h-10"
        >
          {isSending
            ? <><FiLoader className="animate-spin mr-2" />Mengirim...</>
            : <><FiSend className="mr-2" />Test Kirim Email</>
          }
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { id: 'smtp-host', label: 'SMTP Host',     placeholder: 'smtp.mailtrap.io' },
          { id: 'smtp-port', label: 'SMTP Port',     placeholder: '2525' },
          { id: 'smtp-user', label: 'SMTP Username', placeholder: 'user_xxxxx' },
          { id: 'smtp-from-name',  label: 'Dari Nama',  placeholder: 'DietCare Admin' },
          { id: 'smtp-from-email', label: 'Dari Email', placeholder: 'noreply@dietcare.id' },
        ].map((f) => (
          <div key={f.id}>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">{f.label}</label>
            <input id={f.id} type="text" placeholder={f.placeholder} className={field()} />
          </div>
        ))}
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-1.5">SMTP Password</label>
          <input id="smtp-password" type="password" placeholder="••••••••" className={field()} />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <h4 className="text-sm font-black text-neutral-700">Template Email</h4>
        {['Welcome Email', 'Konfirmasi Order', 'Penugasan Ahli Gizi'].map((t) => (
          <div key={t} className="flex justify-between items-center px-5 py-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <span className="text-sm font-bold text-neutral-700">{t}</span>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-xl">
              Edit Template
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-brand-100">
          <FiSave className="mr-2" />Simpan SMTP
        </Button>
      </div>
    </Card>
  );
}
