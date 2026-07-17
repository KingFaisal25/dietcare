'use client';

import React, { useState } from 'react';
import { Activity, HeartPulse, Scale, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { appendCalculatorHistory } from '@/lib/calculator-history';

type CompleteResults = {
  bmi?: {
    value?: number;
    category?: string;
  };
  target_calories?: {
    value?: number;
    description?: string;
  };
};

export function CompleteCalculator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: 65,
    height_cm: 170,
    age: 25,
    gender: 'pria',
    activity_level: 'sedang',
    goal: 'jaga'
  });
  const [results, setResults] = useState<CompleteResults | null>(null);
  const [error, setError] = useState('');

  const validate = () => {
    if (formData.weight_kg < 20 || formData.weight_kg > 300) return 'Berat badan perlu diisi antara 20-300 kg.';
    if (formData.height_cm < 100 || formData.height_cm > 250) return 'Tinggi badan perlu diisi antara 100-250 cm.';
    if (formData.age < 13 || formData.age > 100) return 'Usia perlu diisi antara 13-100 tahun.';
    return '';
  };

  const calculate = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const payload = {
        weight_kg: formData.weight_kg,
        height_cm: formData.height_cm,
        age: formData.age,
        gender: formData.gender === 'pria' ? 'male' : 'female',
        activity_level:
          formData.activity_level === 'jarang' ? 'sedentary' :
          formData.activity_level === 'ringan' ? 'light' :
          formData.activity_level === 'sedang' ? 'moderate' :
          formData.activity_level === 'berat' ? 'active' : 'very_active',
        goal:
          formData.goal === 'turun' ? 'lose' :
          formData.goal === 'naik' ? 'gain' : 'maintain'
      };

      const res = await api.post('/public/calculate/complete', payload);
      setResults(res.data.data);
      appendCalculatorHistory({
        toolId: 'complete',
        title: 'BMI & TDEE',
        summary: `BMI ${res.data.data?.bmi?.value ?? '-'} • Target ${res.data.data?.target_calories?.value ?? '-'} kkal/hari`,
        badges: [res.data.data?.bmi?.category ?? 'BMI', formData.goal === 'turun' ? 'Turun BB' : formData.goal === 'naik' ? 'Naik BB' : 'Maintain'],
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan atau koneksi bermasalah.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600" aria-hidden="true">
                <Scale className="h-5 w-5" />
              </div>
              <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Langkah 1 dari 2 · Kenali kondisi tubuh</p>
              <h2 className="text-2xl font-black text-slate-900">Dapatkan gambaran kesehatanmu</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Hanya butuh sekitar 1 menit. Hasilnya membantu kamu memahami BMI, kebutuhan energi, dan arah tujuan dengan lebih jelas.
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
              <p className="font-black uppercase tracking-[0.24em] text-emerald-700">Yang kamu dapat</p>
              <p className="mt-2">Ringkasan personal yang mudah dipahami, bukan sekadar angka.</p>
            </div>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4"><HeartPulse className="h-5 w-5 text-emerald-600" aria-hidden="true" /><p className="mt-3 text-sm font-black text-slate-900">Pahami BMI</p><p className="mt-1 text-xs leading-5 text-slate-600">Lihat gambaran berat badan secara proporsional.</p></div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4"><Activity className="h-5 w-5 text-amber-600" aria-hidden="true" /><p className="mt-3 text-sm font-black text-slate-900">Atur energi</p><p className="mt-1 text-xs leading-5 text-slate-600">Dapatkan estimasi kalori harian untuk rutinitasmu.</p></div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4"><Sparkles className="h-5 w-5 text-teal-600" aria-hidden="true" /><p className="mt-3 text-sm font-black text-slate-900">Pilih arah</p><p className="mt-1 text-xs leading-5 text-slate-600">Sesuaikan hasil dengan tujuan yang realistis.</p></div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div><h3 className="text-lg font-black text-slate-900">Data dasar</h3><p className="mt-1 text-sm text-slate-500">Gunakan data terbaru agar hasil lebih relevan.</p></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Privat & gratis</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          <Input label="Berat (kg)" type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />
          <Input label="Tinggi (cm)" type="number" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: Number(e.target.value)})} />
          <Input label="Usia" type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Jenis Kelamin</label>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
              <option value="pria">Pria</option>
              <option value="wanita">Wanita</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Tingkat Aktivitas</label>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" value={formData.activity_level} onChange={e => setFormData({...formData, activity_level: e.target.value})}>
               <option value="jarang">Jarang Olahraga</option>
               <option value="ringan">Ringan (1-3x/minggu)</option>
               <option value="sedang">Sedang (3-5x/minggu)</option>
               <option value="berat">Berat (tiap hari)</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">Tujuan</label>
            <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
               <option value="turun">Turun Berat Badan</option>
               <option value="jaga">Jaga Berat Badan</option>
               <option value="naik">Naik Berat Badan</option>
            </select>
          </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
              <HeartPulse className="h-4 w-4" />
              BMI
            </div>
            <p className="mt-2 text-sm text-slate-600">Mengukur status berat badan relatif terhadap tinggi badan.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
              <Activity className="h-4 w-4" />
              TDEE
            </div>
            <p className="mt-2 text-sm text-slate-600">Mengestimasi kebutuhan energi harian berdasarkan aktivitas.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
              <Sparkles className="h-4 w-4" />
              Target
            </div>
            <p className="mt-2 text-sm text-slate-600">Mengarahkan hasil sesuai tujuan turun, jaga, atau naik berat badan.</p>
          </div>
        </div>

        <Button className="min-h-14 w-full text-sm" type="submit" disabled={isLoading}>
          {isLoading ? 'Menyiapkan hasil...' : 'Lihat hasil personal saya'}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900">Hasil Anda</h2>
        <p className="mt-2 text-sm text-slate-500">Ringkasan ini disusun agar mudah dipindai di mobile maupun desktop.</p>
      </div>
      <div className="grid gap-4 text-center md:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <p className="mb-1 text-sm font-semibold text-slate-500">BMI</p>
          <p className="text-3xl font-black text-slate-900">{results?.bmi?.value}</p>
          <div className="mt-2"><Badge variant="outline">{results?.bmi?.category}</Badge></div>
        </div>
        <div className="rounded-[28px] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5">
          <p className="mb-1 text-sm font-semibold text-brand-800">Target Kalori</p>
          <p className="text-3xl font-black text-brand-600">{results?.target_calories?.value}</p>
          <p className="mt-2 text-xs text-brand-700">kkal/hari</p>
        </div>
      </div>
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 shadow-sm">
        <p>{results?.target_calories?.description}</p>
      </div>
      <Button className="min-h-12 w-full" variant="outline" onClick={() => setStep(1)}>Hitung Ulang</Button>
    </div>
  );
}
