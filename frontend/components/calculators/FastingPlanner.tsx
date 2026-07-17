'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export function FastingPlanner() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ wake_time: '06:00', method: '16_8' });
  const [results, setResults] = useState<any>(null);

  const calculate = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/fasting-plan', formData);
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
      <h2 className="text-2xl font-bold">Jadwal Puasa IF (Intermittent Fasting)</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <Input label="Jam Bangun Tidur" type="time" value={formData.wake_time} onChange={e => setFormData({...formData, wake_time: e.target.value})} />

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Metode Puasa</label>
        <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
          <option value="14_10">14:10 - Pemula (14 Jam Puasa)</option>
          <option value="16_8">16:8 - Populer (16 Jam Puasa)</option>
          <option value="18_6">18:6 - Menengah (18 Jam Puasa)</option>
          <option value="20_4">20:4 - Hardcore (20 Jam Puasa)</option>
        </select>
      </div>

      <Button className="w-full" onClick={calculate} disabled={isLoading}>{isLoading ? 'Membuat Jadwal...' : 'Buat Jadwal'}</Button>
    </div>
  );

  return (
    <div className="text-center space-y-4">
       <h2 className="text-xl font-bold text-slate-800">{results?.method_name}</h2>

       <div className="flex flex-col md:flex-row gap-4 mt-6">
         <div className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
           <p className="text-sm text-emerald-800 font-medium mb-1">Jendela Makan ({results?.eating_window?.duration})</p>
           <div className="flex justify-between items-center px-4">
             <div>
               <p className="text-xs text-slate-500">Mulai</p>
               <p className="text-2xl font-bold text-emerald-600">{results?.eating_window?.start}</p>
             </div>
             <div className="text-xl text-slate-300">→</div>
             <div>
               <p className="text-xs text-slate-500">Stop</p>
               <p className="text-2xl font-bold text-emerald-600">{results?.eating_window?.end}</p>
             </div>
           </div>
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
           <p className="text-sm text-slate-600 font-medium mb-1">Jendela Puasa ({results?.fasting_window?.duration})</p>
           <div className="flex justify-between items-center px-4 opacity-75">
             <div>
               <p className="text-2xl font-bold text-slate-600">{results?.fasting_window?.start}</p>
             </div>
             <div className="text-xl text-slate-300">→</div>
             <div>
               <p className="text-2xl font-bold text-slate-600">{results?.fasting_window?.end}</p>
             </div>
           </div>
         </div>
       </div>

       <div className="mt-6 text-left">
         <p className="font-bold text-sm text-slate-700 mb-2">Tips Penting:</p>
         <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
           {results?.tips?.map((tip: string, i: number) => (
             <li key={i}>{tip}</li>
           ))}
         </ul>
       </div>

       <Button variant="outline" className="w-full mt-4" onClick={() => setStep(1)}>Ubah Pengaturan</Button>
    </div>
  );
}
