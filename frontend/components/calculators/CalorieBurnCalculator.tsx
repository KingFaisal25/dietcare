'use client';

import React, { useState } from 'react';
import { Flame, Timer, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { appendCalculatorHistory } from '@/lib/calculator-history';

type CalorieBurnResults = {
  calories_burned?: number;
  message?: string;
  food_comparisons?: Array<{ message: string }>;
};

export function CalorieBurnCalculator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ exercise_type: 'jogging', duration_minutes: 30, weight_kg: 65 });
  const [results, setResults] = useState<CalorieBurnResults | null>(null);

  const calculate = async () => {
    if (formData.duration_minutes < 5 || formData.duration_minutes > 360) {
      setError('Durasi olahraga perlu diisi antara 5-360 menit.');
      return;
    }
    if (formData.weight_kg < 20 || formData.weight_kg > 300) {
      setError('Berat badan perlu diisi antara 20-300 kg.');
      return;
    }

    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/calorie-burn', formData);
      setResults(res.data.data);
      appendCalculatorHistory({
        toolId: 'calorie-burn',
        title: 'Kalori Terbakar',
        summary: `${res.data.data?.calories_burned ?? '-'} kkal • ${formData.exercise_type} ${formData.duration_minutes} menit`,
        badges: ['Aktivitas', `${formData.duration_minutes} menit`],
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  if(step === 1) return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        calculate();
      }}
    >
      <div className="rounded-[28px] border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600" aria-hidden="true">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Kalori Terbakar</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cocok untuk memperkirakan dampak olahraga harian dengan input yang mudah dipahami.
            </p>
          </div>
        </div>
      </div>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Jenis Olahraga</label>
        <select className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" value={formData.exercise_type} onChange={e => setFormData({...formData, exercise_type: e.target.value})}>
          <option value="walking">Jalan</option><option value="jogging">Jogging</option><option value="running">Lari</option><option value="cycling">Sepeda</option><option value="swimming">Berenang</option><option value="yoga">Yoga</option><option value="badminton">Badminton</option>
        </select>
      </div>
      <Input label="Durasi (menit)" type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} />
      <Input label="Berat Badan (kg)" type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />
      <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
            <Timer className="h-4 w-4" />
            Input Cepat
          </div>
          <p className="mt-2 text-sm text-slate-600">Target sentuh besar dan aman untuk mobile serta keyboard.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
            <Trophy className="h-4 w-4" />
            Insight
          </div>
          <p className="mt-2 text-sm text-slate-600">Hasil dilengkapi perbandingan makanan agar lebih relatable.</p>
        </div>
      </div>
      <Button className="min-h-12 w-full" type="submit" disabled={isLoading}>{isLoading ? 'Menghitung...' : 'Hitung Sekarang'}</Button>
    </form>
  );

  return (
    <div className="text-center space-y-4">
       <h2 className="text-xl font-bold text-slate-600">Kalori Terbakar</h2>
       <p className="text-5xl font-black text-brand-600">{results?.calories_burned} kkal</p>
       <p className="text-sm text-slate-500 mt-2">{results?.message}</p>

       {results?.food_comparisons && results.food_comparisons.length > 0 && (
         <div className="mt-6 pt-6 border-t border-slate-100">
           <p className="text-sm font-medium text-slate-700 mb-3">Setara dengan:</p>
           <div className="space-y-2">
             {results.food_comparisons.map((fc, i: number) => (
               <div key={i} className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
                 {fc.message}
               </div>
             ))}
           </div>
         </div>
       )}

       <Button variant="outline" className="min-h-12 w-full mt-4" onClick={() => setStep(1)}>Hitung Lagi</Button>
    </div>
  );
}
