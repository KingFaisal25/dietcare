'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export function MealPlanGenerator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ target_calories: 2000, goal: 'maintain' });
  const [results, setResults] = useState<any>(null);

  const generate = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/meal-plan', formData);
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
      <h2 className="text-2xl font-bold">Contoh Menu 3 Hari</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <Input label="Target Kalori Harian" type="number" value={formData.target_calories} onChange={e => setFormData({...formData, target_calories: Number(e.target.value)})} />
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tujuan</label>
        <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
           <option value="lose">Turun Berat Badan</option>
           <option value="maintain">Jaga Berat Badan</option>
           <option value="gain">Naik Berat Badan</option>
        </select>
      </div>
      <Button className="w-full" onClick={generate} disabled={isLoading}>{isLoading ? 'Membuat Menu...' : 'Buat Menu'}</Button>
    </div>
  );

  return (
    <div className="space-y-4">
       <h2 className="text-xl font-bold text-slate-800 text-center">Menu Anda ({results?.target_calories} kkal)</h2>

       <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pb-2">
         {results?.days?.map((d:any, i:number) => (
           <div key={i} className="p-4 border border-slate-200 rounded-xl bg-white">
             <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-lg">{d.day}</h3>
               <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">~{d.total_calories} kkal</span>
             </div>
             <div className="space-y-2">
               {d.meals.map((m: any, j: number) => (
                 <div key={j} className="flex gap-3 text-sm border-t border-slate-50 pt-2 mt-2">
                   <div className="text-xl">{m.emoji}</div>
                   <div className="flex-1">
                     <p className="font-medium">{m.type} <span className="text-slate-400 text-xs ml-1">{m.time}</span></p>
                     {m.items.map((item: any, k: number) => (
                       <p key={k} className="text-slate-600">{item.name} ({item.portion})</p>
                     ))}
                   </div>
                   <div className="text-right text-slate-500 font-medium">
                     {m.calories}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         ))}
       </div>

       <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
         <p className="text-xs text-amber-800 text-center font-medium">{results?.note}</p>
       </div>

       <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Ubah Kalori</Button>
    </div>
  );
}
