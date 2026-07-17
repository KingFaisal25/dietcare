'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export function BudgetDietCalculator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState(30000);
  const [results, setResults] = useState<any>(null);

  const calculate = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/budget-diet', { budget });
      setResults(res.data.data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  if(step === 1) return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Menu Diet Sesuai Budget</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <Input label="Budget Makan Per Hari (Rp)" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
      <p className="text-xs text-slate-500">*Minimal Rp 15.000 / hari</p>
      <Button className="w-full" onClick={calculate} disabled={isLoading}>{isLoading ? 'Mencari Menu...' : 'Cari Menu'}</Button>
    </div>
  );

  return (
    <div className="text-left space-y-4">
       <div className="flex justify-between items-center border-b pb-4">
         <div>
           <p className="text-sm text-slate-500">Tier Anda</p>
           <h2 className="text-xl font-bold text-emerald-600">{results?.tier}</h2>
         </div>
         <div className="text-right">
           <p className="text-sm text-slate-500">Budget</p>
           <p className="font-bold">{results?.budget_per_day}</p>
         </div>
       </div>

       <div>
         <p className="font-bold text-slate-700 mb-2">Rekomendasi Bahan Makanan:</p>
         <div className="space-y-2 text-sm">
           <div className="bg-white p-3 border rounded-lg">
             <span className="text-blue-600 font-semibold block mb-1">Protein</span>
             {results?.recommendations?.protein}
           </div>
           <div className="bg-white p-3 border rounded-lg">
             <span className="text-amber-600 font-semibold block mb-1">Karbohidrat</span>
             {results?.recommendations?.karbohidrat}
           </div>
           <div className="bg-white p-3 border rounded-lg">
             <span className="text-emerald-600 font-semibold block mb-1">Sayur</span>
             {results?.recommendations?.sayur}
           </div>
         </div>
       </div>

       <div>
         <p className="font-bold text-slate-700 mb-2">Contoh Menu Sehari:</p>
         <p className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm leading-relaxed border border-emerald-100">
           {results?.example_menu}
         </p>
       </div>

       <div className="text-center mt-6">
         <p className="text-sm font-medium text-slate-600 mb-4">{results?.message}</p>
         <Button className="w-full" variant="outline" onClick={() => setStep(1)}>Ubah Budget</Button>
       </div>
    </div>
  );
}
