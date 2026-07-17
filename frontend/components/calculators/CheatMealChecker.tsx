'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export function CheatMealChecker() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ tdee: 2000, eaten_calories: 1200, cheat_food_calories: 500 });
  const [results, setResults] = useState<any>(null);

  const calculate = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/cheat-meal', formData);
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
      <h2 className="text-2xl font-bold">Boleh Cheat Meal Nggak Ya?</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <Input label="Target Kalori / TDEE (kkal)" type="number" value={formData.tdee} onChange={e => setFormData({...formData, tdee: Number(e.target.value)})} />
      <Input label="Kalori yang Sudah Masuk Hari Ini" type="number" value={formData.eaten_calories} onChange={e => setFormData({...formData, eaten_calories: Number(e.target.value)})} />
      <Input label="Estimasi Kalori Cheat Meal" type="number" value={formData.cheat_food_calories} onChange={e => setFormData({...formData, cheat_food_calories: Number(e.target.value)})} />
      <p className="text-xs text-slate-500 italic">*Cek kalori cheat meal-mu di tab "Cari Makanan"</p>
      <Button className="w-full" onClick={calculate} disabled={isLoading}>{isLoading ? 'Mengecek...' : 'Cek Sekarang!'}</Button>
    </div>
  );

  const isSafe = results?.calories_over === 0;

  return (
    <div className="text-center space-y-4">
       <h2 className={`text-3xl font-black ${isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
         {results?.status}
       </h2>

       <p className="text-lg font-medium text-slate-700 mt-2">{results?.message}</p>

       <div className={`mt-6 p-4 rounded-xl border ${isSafe ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
         <p className={`font-bold ${isSafe ? 'text-emerald-800' : 'text-red-800'}`}>
           {results?.action_required}
         </p>
       </div>

       <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
         <div className="bg-slate-50 p-3 rounded-lg border">
           <p className="text-slate-500">Sisa Kalori Sebelum</p>
           <p className="font-bold text-lg text-slate-800">{results?.calories_left_before} kkal</p>
         </div>
         <div className="bg-slate-50 p-3 rounded-lg border">
           <p className="text-slate-500">Kelebihan Kalori</p>
           <p className={`font-bold text-lg ${results?.calories_over > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
             {results?.calories_over} kkal
           </p>
         </div>
       </div>

       <Button variant="outline" className="w-full mt-4" onClick={() => setStep(1)}>Cek Makanan Lain</Button>
    </div>
  );
}
