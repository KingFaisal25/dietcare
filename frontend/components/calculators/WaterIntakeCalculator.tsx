'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { appendCalculatorHistory } from '@/lib/calculator-history';

export function WaterIntakeCalculator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ weight_kg: 65, activity_level: 'moderate', climate: 'normal' });
  const [results, setResults] = useState<any>(null);

  const calculate = async () => {
    if (formData.weight_kg < 20 || formData.weight_kg > 300) {
      setError('Berat badan perlu diisi antara 20-300 kg.');
      return;
    }
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/water-intake', formData);
      setResults(res.data.data);
      appendCalculatorHistory({
        toolId: 'water-intake',
        title: 'Kebutuhan Air',
        summary: `${res.data.data?.water_needed?.liters ?? '-'} L per hari`,
        badges: [`${res.data.data?.water_needed?.glasses ?? '-'} gelas`, formData.climate === 'hot' ? 'Cuaca panas' : 'Harian'],
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  if(step === 1) return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); calculate(); }}>
      <h2 className="text-2xl font-bold">Kebutuhan Air Harian</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <Input label="Berat Badan (kg)" type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tingkat Aktivitas</label>
        <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={formData.activity_level} onChange={e => setFormData({...formData, activity_level: e.target.value})}>
          <option value="sedentary">Jarang Bergerak</option><option value="light">Ringan</option><option value="moderate">Sedang</option><option value="active">Sering Olahraga</option><option value="very_active">Sangat Aktif</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Cuaca / Iklim</label>
        <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={formData.climate} onChange={e => setFormData({...formData, climate: e.target.value})}>
          <option value="normal">Normal</option><option value="hot">Panas / Berkeringat</option><option value="cold">Dingin / AC Terus</option>
        </select>
      </div>

      <Button className="min-h-12 w-full" type="submit" disabled={isLoading}>{isLoading ? 'Menghitung...' : 'Hitung'}</Button>
    </form>
  );

  return (
    <div className="text-center space-y-4">
       <p className="text-5xl font-black text-brand-600">{results?.water_needed?.liters} L</p>
       <p className="text-slate-600">Atau sekitar <span className="font-bold text-lg">{results?.water_needed?.glasses}</span> gelas</p>

       <div className="mt-6 text-left">
         <p className="font-medium text-slate-800 mb-2">Tips Jadwal Minum:</p>
         <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
           {results?.schedule?.map((s: any, i: number) => (
             <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-brand-50 p-3 text-sm">
               <span className="font-bold text-brand-700">{s.time}</span>
               <span className="text-slate-600">{s.note} ({s.glasses} gelas)</span>
             </div>
           ))}
         </div>
       </div>

       <Button variant="outline" className="w-full mt-4" onClick={() => setStep(1)}>Hitung Lagi</Button>
    </div>
  );
}
