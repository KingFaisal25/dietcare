'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  FiUser, 
  FiArrowRight, 
  FiRefreshCw, 
  FiShare2, 
  FiCheckCircle, 
  FiZap,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend);

const CalculatorPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'pria',
    birthDate: '',
    height: 170,
    weight: 65,
    activity: 'sedang',
    goal: 'jaga'
  });

  interface Results {
    bmi: string;
    bmiCategory: string;
    bmiColor: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
    };
    idealWeight: string;
    weightGap: string;
  }

  const [results, setResults] = useState<Results | null>(null);

  const activities = [
    { id: 'jarang', label: 'Jarang Olahraga', desc: 'Kerja kantoran, duduk terus sepanjang hari', multiplier: 1.2 },
    { id: 'ringan', label: 'Olahraga Ringan', desc: 'Olahraga ringan 1-3x per minggu', multiplier: 1.375 },
    { id: 'sedang', label: 'Olahraga Sedang', desc: 'Olahraga sedang 3-5x per minggu', multiplier: 1.55 },
    { id: 'berat', label: 'Olahraga Berat', desc: 'Olahraga berat setiap hari', multiplier: 1.725 },
    { id: 'atlet', label: 'Sangat Berat', desc: 'Olahraga sangat berat / atlet profesional', multiplier: 1.9 }
  ];

  const goals = [
    { id: 'turun', label: 'Turun Berat Badan', color: 'text-red-600 bg-red-50' },
    { id: 'jaga', label: 'Jaga Berat Badan', color: 'text-blue-600 bg-blue-50' },
    { id: 'naik', label: 'Naik Berat Badan', color: 'text-green-600 bg-green-50' }
  ];

  const calculateAge = (birthday: string) => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const calculateResults = () => {
    const age = calculateAge(formData.birthDate);
    const { height, weight, gender, activity, goal } = formData;

    // 1. BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    let bmiCategory = '';
    let bmiColor = '';
    if (bmi < 18.5) { bmiCategory = 'Kurus'; bmiColor = 'text-blue-500'; }
    else if (bmi < 23) { bmiCategory = 'Normal'; bmiColor = 'text-green-600'; }
    else if (bmi < 25) { bmiCategory = 'Berisiko'; bmiColor = 'text-yellow-500'; }
    else if (bmi < 30) { bmiCategory = 'Gemuk'; bmiColor = 'text-orange-500'; }
    else { bmiCategory = 'Obesitas'; bmiColor = 'text-red-600'; }

    // 2. BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'pria' ? bmr + 5 : bmr - 161;

    // 3. TDEE
    const activityObj = activities.find(a => a.id === activity);
    const tdee = bmr * (activityObj?.multiplier || 1.2);

    // 4. Target Calories
    let targetCalories = tdee;
    if (goal === 'turun') targetCalories = tdee - 500;
    else if (goal === 'naik') targetCalories = tdee + 500;

    // 5. Macros (Standard 50/20/30)
    const carbCals = targetCalories * 0.5;
    const proteinCals = targetCalories * 0.2;
    const fatCals = targetCalories * 0.3;

    const macros = {
      carbs: Math.round(carbCals / 4),
      protein: Math.round(proteinCals / 4),
      fat: Math.round(fatCals / 9)
    };

    // 6. Ideal Weight (BMI 22)
    const idealWeight = 22 * (heightInMeters * heightInMeters);

    const res = {
      bmi: bmi.toFixed(2),
      bmiCategory,
      bmiColor,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros,
      idealWeight: idealWeight.toFixed(1),
      weightGap: (weight - idealWeight).toFixed(1)
    };

    setResults(res);
    setStep(2);
    localStorage.setItem('nutri_calc_results', JSON.stringify({ formData, results: res }));
  };

  const reset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-green-600 text-white py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Cek Kondisi Gizi Gratis</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Dapatkan analisis lengkap mengenai BMI, kebutuhan kalori harian, dan target berat badan idealmu dalam 2 menit.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 -mt-10">
        {step === 1 ? (
          <Card className="p-8 md:p-12 space-y-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input 
                  label="Nama Panggilan (Opsional)" 
                  placeholder="Contoh: " 
                  icon={<FiUser />}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData({...formData, gender: 'pria'})}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.gender === 'pria' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">👨</span>
                      <span className="font-bold">Pria</span>
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, gender: 'wanita'})}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.gender === 'wanita' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">👩</span>
                      <span className="font-bold">Wanita</span>
                    </button>
                  </div>
                </div>

                <Input 
                  label="Tanggal Lahir" 
                  type="date" 
                  icon={<FiCalendar />}
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">Tinggi Badan (cm)</label>
                    <span className="text-lg font-black text-green-600">{formData.height} cm</span>
                  </div>
                  <input 
                    type="range" min="100" max="250" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">Berat Badan (kg)</label>
                    <span className="text-lg font-black text-green-600">{formData.weight} kg</span>
                  </div>
                  <input 
                    type="range" min="30" max="200" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Target Kamu</label>
                  <div className="grid grid-cols-1 gap-2">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setFormData({...formData, goal: g.id})}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left flex items-center justify-between ${
                          formData.goal === g.id ? 'border-green-600 ring-2 ring-green-600/20' : 'border-gray-100'
                        }`}
                      >
                        <span className={formData.goal === g.id ? 'text-green-700' : 'text-gray-600'}>{g.label}</span>
                        {formData.goal === g.id && <FiCheckCircle className="text-green-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700">Tingkat Aktivitas Harian</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setFormData({...formData, activity: act.id})}
                    className={`p-4 rounded-xl border-2 transition-all text-left space-y-1 ${
                      formData.activity === act.id ? 'border-green-600 bg-green-50' : 'border-gray-50 hover:bg-white'
                    }`}
                  >
                    <p className={`text-sm font-bold ${formData.activity === act.id ? 'text-green-700' : 'text-gray-800'}`}>{act.label}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{act.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full py-6 text-lg font-black" 
              onClick={calculateResults}
              disabled={!formData.birthDate}
            >
              Lihat Hasil Analisis <FiArrowRight className="ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {results && (<>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-800">
                {formData.name ? `Halo ${formData.name}, ini hasil analisis gizi kamu:` : 'Hasil Analisis Gizi Kamu:'}
              </h2>
              <Button variant="outline" size="sm" onClick={reset}>
                <FiRefreshCw className="mr-2" /> Hitung Ulang
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BMI CARD */}
              <Card className="p-6 space-y-4 border-t-4 border-t-green-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Indeks Massa Tubuh (BMI)</p>
                    <h3 className={`text-4xl font-black mt-1 ${results.bmiColor}`}>{results.bmi}</h3>
                  </div>
                  <Badge variant="success" className="px-4 py-1 text-sm">{results.bmiCategory}</Badge>
                </div>
                
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-400" style={{ width: '18.5%' }}></div>
                  <div className="h-full bg-green-500" style={{ width: '22.5%' }}></div>
                  <div className="h-full bg-yellow-400" style={{ width: '15%' }}></div>
                  <div className="h-full bg-orange-500" style={{ width: '15%' }}></div>
                  <div className="h-full bg-red-500" style={{ width: '29%' }}></div>
                  {/* Indicator mark */}
                  <div 
                    className="absolute top-0 w-1 h-full bg-black shadow-lg" 
                    style={{ left: `${Math.min(Math.max((parseFloat(results.bmi) / 40) * 100, 5), 95)}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed">
                  Berdasarkan standar BMI Asia, kamu berada dalam kategori <strong>{results.bmiCategory}</strong>. 
                  BMI normal untuk orang dewasa Asia adalah 18.5 – 22.9.
                </p>
              </Card>

              {/* CALORIE CARD */}
              <Card className="p-6 space-y-6 border-t-4 border-t-blue-600">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kebutuhan Kalori Harian</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-center flex-1">
                      <p className="text-2xl font-black text-gray-800">{results.bmr}</p>
                      <p className="text-[10px] text-gray-400 font-bold">BMR (Istirahat)</p>
                    </div>
                    <div className="text-gray-300 mb-2">/</div>
                    <div className="text-center flex-1">
                      <p className="text-2xl font-black text-gray-800">{results.tdee}</p>
                      <p className="text-[10px] text-gray-400 font-bold">TDEE (Aktivitas)</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                    <p className="text-sm text-blue-600 font-bold mb-1">Target Kalori Kamu:</p>
                    <p className="text-4xl font-black text-blue-800">{results.targetCalories} <span className="text-lg">kkal</span></p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Estimasi {formData.goal === 'turun' ? 'turun' : formData.goal === 'naik' ? 'naik' : 'jaga'} ~0.5 kg/minggu
                    </p>
                  </div>
                </div>
              </Card>

              {/* MACROS CARD */}
              <Card className="p-6 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimasi Makronutrien</p>
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32 flex-shrink-0">
                    <Pie 
                      data={{
                        labels: ['Protein', 'Lemak', 'Karbo'],
                        datasets: [{
                          data: [20, 30, 50],
                          backgroundColor: ['#16a361', '#facc15', '#3b82f6'],
                          borderWidth: 0
                        }]
                      }}
                      options={{ plugins: { legend: { display: false } } }}
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">Protein: {results.macros.protein}g</p>
                        <p className="text-[10px] text-gray-400">{results.macros.protein * 4} kkal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">Lemak: {results.macros.fat}g</p>
                        <p className="text-[10px] text-gray-400">{results.macros.fat * 9} kkal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">Karbo: {results.macros.carbs}g</p>
                        <p className="text-[10px] text-gray-400">{results.macros.carbs * 4} kkal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* IDEAL WEIGHT CARD */}
              <Card className="p-6 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Berat Badan Ideal</p>
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-1">Target BB Ideal Kamu:</p>
                  <p className="text-4xl font-black text-gray-800">{results.idealWeight} <span className="text-lg font-bold">kg</span></p>
                </div>
                <div className={`p-3 rounded-xl text-center font-bold text-sm ${parseFloat(results.weightGap) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                  {parseFloat(results.weightGap) > 0 
                    ? `Selisih: +${results.weightGap} kg dari ideal` 
                    : `Luar biasa! Kamu sudah dalam rentang ideal.`}
                </div>
              </Card>
            </div>

            {/* CTA SECTION */}
            <Card className="bg-yellow-400 border-none p-8 md:p-10 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Kamu butuh bantuan untuk capai target ini?</h3>
                <p className="text-gray-800 max-w-xl mx-auto">
                  Kalkulator hanya memberikan angka, namun <strong>ahli gizi NutriPro</strong> akan membantu kamu menyusun menu makan dan mendampingi kamu sampai tujuan dengan cara yang menyenangkan.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  href={`https://wa.me/6281234567890?text=Halo+kak%2C+saya+baru+cek+kondisi+di+website.+BMI+saya+${results.bmi}+dan+target+saya+${formData.goal}.+Boleh+minta+rekomendasi+program%3F`}
                  target="_blank"
                >
                  <Button className="w-full md:w-auto bg-green-700 hover:bg-green-800 py-6 px-8 text-lg font-black shadow-xl">
                    Konsultasi GRATIS via WA <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link href="/harga">
                  <Button variant="outline" className="w-full md:w-auto border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-6 px-8 text-lg font-black">
                    Lihat Program & Harga
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <FiShare2 className="mr-2" /> Bagikan Hasil
              </Button>
            </div>
            </>)}
          </div>
        )}
      </div>

      {/* WHY NUTRI PRO */}
      <div className="container mx-auto max-w-4xl px-6 py-20 text-center space-y-12">
        <h2 className="text-3xl font-black text-gray-800">Mengapa Diet Bareng NutriPro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <FiCheckCircle size={32} />
            </div>
            <h4 className="font-bold text-gray-800">Ahli Gizi Tersertifikasi</h4>
            <p className="text-sm text-gray-500">Bukan influencer, tapi tenaga kesehatan profesional dengan STR aktif.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
              <FiZap size={32} />
            </div>
            <h4 className="font-bold text-gray-800">Tanpa Obat & Suplemen</h4>
            <p className="text-sm text-gray-500">Fokus pada pengaturan pola makan real food yang bisa kamu temukan di pasar.</p>
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600">
              <FiActivity size={32} />
            </div>
            <h4 className="font-bold text-gray-800">Hasil Permanen</h4>
            <p className="text-sm text-gray-500">Membentuk habit baru agar berat badan stabil dan tidak yoyo diet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
