'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export function MetabolicAgeCalculator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ age: 25, weight_kg: 65, height_cm: 170, activity_level: 'moderate' });
  const [results, setResults] = useState<any>(null);

  const calculate = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await api.post('/public/calculate/metabolic-age', formData);
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
      <h2 className="text-2xl font-bold">Usia Metabolisme Tubuh</h2>
      {error && <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Usia Asli" type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
        <Input label="Berat (kg)" type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} />
        <Input label="Tinggi (cm)" type="number" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: Number(e.target.value)})} />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Aktivitas</label>
          <select className="w-full p-3 border border-slate-200 rounded-xl bg-white" value={formData.activity_level} onChange={e => setFormData({...formData, activity_level: e.target.value})}>
            <option value="sedentary">Jarang</option>
            <option value="light">Ringan</option>
            <option value="moderate">Sedang</option>
            <option value="active">Sering</option>
            <option value="very_active">Sangat Aktif</option>
          </select>
        </div>
      </div>
      <Button className="w-full" onClick={calculate} disabled={isLoading}>{isLoading ? 'Mengecek...' : 'Cek Usia Tubuh'}</Button>
    </div>
  );

  return (
    <div className="text-center space-y-4">
       <p className="text-sm text-slate-500 font-medium">Usia Asli: {results?.actual_age} tahun</p>
       <p className="text-7xl font-black text-indigo-500 drop-shadow-md">{results?.metabolic_age}</p>
       <p className="font-bold text-xl text-slate-800">{results?.status}</p>
       <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm mt-4">
         <p>{results?.message}</p>
       </div>
       <Button variant="outline" className="w-full mt-4" onClick={() => setStep(1)}>Cek Lagi</Button>
    </div>
  );
}
