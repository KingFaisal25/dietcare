'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { calculateBMI, calculateNutrition, NutritionInput, ActivityLevel, TargetType } from '@/lib/nutrition';
import { useNutritionStore } from '@/store/useNutritionStore';

// ═══════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════

interface OnboardingData {
  // Step 1 — Data Fisik
  height_cm: string;
  weight_kg: string;
  birth_date: string;
  gender: 'male' | 'female' | '';

  // Step 2 — Aktivitas & Target
  activity_level: string;
  target_type: string;
  target_weight_kg: string;

  // Step 3 — Kondisi Medis & Preferensi
  medical_conditions: string[];
  allergies: string[];
  custom_allergy: string;
  dietary_preferences: string[];
  favorite_foods: string;
}

// ═══════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════

const STEPS = ['Data Fisik', 'Aktivitas & Target', 'Kondisi Medis', 'Ringkasan'];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Tidak Aktif', desc: 'Duduk sepanjang hari, tanpa olahraga' },
  { value: 'light', label: 'Ringan', desc: 'Olahraga ringan 1-3×/minggu' },
  { value: 'moderate', label: 'Sedang', desc: 'Olahraga sedang 3-5×/minggu' },
  { value: 'active', label: 'Aktif', desc: 'Olahraga berat 6-7×/minggu' },
  { value: 'very_active', label: 'Sangat Aktif', desc: 'Atlet / pekerjaan fisik berat' },
];

const TARGET_TYPES = [
  { value: 'lose', label: 'Turun Berat Badan', icon: '📉', desc: 'Defisit kalori aman untuk menurunkan berat badan', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'gain', label: 'Naik Berat Badan', icon: '📈', desc: 'Surplus kalori untuk menambah massa tubuh', color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'maintain', label: 'Jaga Berat Badan', icon: '⚖️', desc: 'Pertahankan berat badan ideal saat ini', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'body_recomp', label: 'Perbaiki Komposisi', icon: '💪', desc: 'Kurangi lemak sambil jaga massa otot', color: 'border-purple-300 bg-purple-50 text-purple-700' },
];

const MEDICAL_CONDITIONS = [
  'GERD/Maag', 'Diabetes', 'Hipertensi', 'Kolesterol Tinggi', 'PCOS', 'Asam Urat',
];

const COMMON_ALLERGIES = [
  'Susu & Produk Dairy', 'Kacang-kacangan', 'Telur', 'Gluten/Gandum', 'Seafood', 'Kedelai',
];

const DIETARY_PREFERENCES = [
  'Tidak makan daging sapi', 'Tidak makan daging babi', 'Tidak makan seafood',
  'Vegetarian', 'Vegan', 'Halal only',
];

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    height_cm: '',
    weight_kg: '',
    birth_date: '',
    gender: '',
    activity_level: '',
    target_type: '',
    target_weight_kg: '',
    medical_conditions: [],
    allergies: [],
    custom_allergy: '',
    dietary_preferences: [],
    favorite_foods: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const setNutritionData = useNutritionStore(state => state.setNutritionData);

  // ── Hitung usia dari tanggal lahir ─────────────
  const calculatedAge = useMemo(() => {
    if (!formData.birth_date) return 0;
    const today = new Date();
    const birth = new Date(formData.birth_date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, [formData.birth_date]);

  // ── Hitung BMI preview langsung ─────────────────
  const bmiPreview = useMemo(() => {
    const w = parseFloat(formData.weight_kg);
    const h = parseFloat(formData.height_cm);
    return calculateBMI(w, h);
  }, [formData.weight_kg, formData.height_cm]);

  // ── Update field ─────────────────────────────────
  const updateField = useCallback((field: keyof OnboardingData, value: OnboardingData[keyof OnboardingData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [errors]);

  // ── Toggle multi-checkbox ────────────────────────
  const toggleArrayField = useCallback((field: 'medical_conditions' | 'allergies' | 'dietary_preferences', value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      if (value === 'Tidak Ada' && field === 'medical_conditions') {
        return { ...prev, [field]: arr.includes(value) ? [] : [value] };
      }
      const filtered = arr.filter(v => v !== 'Tidak Ada');
      return {
        ...prev,
        [field]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value],
      };
    });
  }, []);

  // ── Validasi per step ────────────────────────────
  const validateStep = useCallback((step: number): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!formData.height_cm || parseFloat(formData.height_cm) < 100 || parseFloat(formData.height_cm) > 250) errs.height_cm = 'Tinggi badan harus antara 100-250 cm';
      if (!formData.weight_kg || parseFloat(formData.weight_kg) < 20 || parseFloat(formData.weight_kg) > 300) errs.weight_kg = 'Berat badan harus antara 20-300 kg';
      if (!formData.birth_date) errs.birth_date = 'Tanggal lahir wajib diisi';
      else if (calculatedAge < 10 || calculatedAge > 100) errs.birth_date = 'Usia harus antara 10-100 tahun';
      if (!formData.gender) errs.gender = 'Jenis kelamin wajib dipilih';
    } else if (step === 1) {
      if (!formData.activity_level) errs.activity_level = 'Pilih tingkat aktivitas fisik';
      if (!formData.target_type) errs.target_type = 'Pilih target diet Anda';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData, calculatedAge]);

  // ── Navigasi step ────────────────────────────────
  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  // ── Submit ke API ────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const allAllergies = [...formData.allergies];
    if (formData.custom_allergy.trim()) {
      allAllergies.push(formData.custom_allergy.trim());
    }

    const payload = {
      weight_kg: parseFloat(formData.weight_kg),
      height_cm: parseFloat(formData.height_cm),
      age: calculatedAge,
      gender: formData.gender,
      activity_level: formData.activity_level,
      target_type: formData.target_type,
      target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
      medical_conditions: formData.medical_conditions.filter(c => c !== 'Tidak Ada'),
      allergies: allAllergies,
      dietary_preferences: formData.dietary_preferences,
    };

    try {
      await api.post('/client/onboarding', payload);
      
      // Save nutrition data to store
      if (formData.gender && formData.activity_level && formData.target_type) {
        setNutritionData({
          weight_kg: parseFloat(formData.weight_kg),
          height_cm: parseFloat(formData.height_cm),
          age: calculatedAge,
          gender: formData.gender as 'male' | 'female',
          activity_level: formData.activity_level as ActivityLevel,
          target_type: formData.target_type as TargetType,
        });
      }

      router.push('/klien-dashboard');
    } catch (error) {
      const apiError = error as AxiosError<{ message?: string }>;
      const msg = apiError.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Estimasi kalori lokal untuk preview step 4 ───
  const localEstimate = useMemo(() => {
    const w = parseFloat(formData.weight_kg);
    const h = parseFloat(formData.height_cm);
    if (!w || !h || !formData.gender || !formData.activity_level || !calculatedAge || !formData.target_type) return null;

    return calculateNutrition({
      weight_kg: w,
      height_cm: h,
      age: calculatedAge,
      gender: formData.gender as 'male' | 'female',
      activity_level: formData.activity_level as ActivityLevel,
      target_type: formData.target_type as TargetType,
    });
  }, [formData, calculatedAge]);

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">DC</div>
              <span className="font-bold text-gray-900">DietCare <span className="text-primary"></span></span>
            </div>
            <span className="text-sm text-gray-400">Step {currentStep + 1} dari {STEPS.length}</span>
          </div>

          {/* ── Progress Bar ─────────────────────────── */}
          <div className="flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/70' : 'bg-gray-200'
                }`} />
                <span className={`text-[10px] font-medium hidden sm:block transition-colors ${
                  i <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form Container ──────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">

            {/* ═══════════ STEP 1: Data Fisik ═══════════ */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Data Fisik Anda 📏</h2>
                  <p className="mt-1 text-sm text-gray-500">Informasi dasar untuk menghitung kebutuhan gizi Anda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="height_cm"
                    label="Tinggi Badan (cm)"
                    type="number"
                    placeholder="165"
                    value={formData.height_cm}
                    onChange={e => updateField('height_cm', e.target.value)}
                    error={errors.height_cm}
                    icon={<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a1 1 0 01-1-1V4.414L5.707 7.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 4.414V17a1 1 0 01-1 1z" clipRule="evenodd" /></svg>}
                  />
                  <Input
                    id="weight_kg"
                    label="Berat Badan (kg)"
                    type="number"
                    placeholder="70"
                    value={formData.weight_kg}
                    onChange={e => updateField('weight_kg', e.target.value)}
                    error={errors.weight_kg}
                    icon={<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4z" clipRule="evenodd" /></svg>}
                  />
                </div>

                {/* BMI Preview */}
                {bmiPreview && (
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 transition-all">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                      <span className={`text-lg font-bold ${bmiPreview.color}`}>{bmiPreview.bmi}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">BMI Anda saat ini</p>
                      <p className={`font-semibold ${bmiPreview.color}`}>{bmiPreview.category}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
                    <input
                      type="date"
                      id="birth_date"
                      value={formData.birth_date}
                      onChange={e => updateField('birth_date', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-primary/20 ${errors.birth_date ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.birth_date && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.birth_date}</p>}
                    {calculatedAge > 0 && <p className="mt-1 text-xs text-gray-400">Usia: {calculatedAge} tahun</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin</label>
                    <div className="flex gap-3">
                      {([['male', 'Pria', '👨'], ['female', 'Wanita', '👩']] as const).map(([val, label, icon]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateField('gender', val)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                            formData.gender === val
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-lg">{icon}</span> {label}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.gender}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ STEP 2: Aktivitas & Target ═══════════ */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Aktivitas & Target 🎯</h2>
                  <p className="mt-1 text-sm text-gray-500">Tentukan level aktivitas dan tujuan diet Anda.</p>
                </div>

                {/* Activity Level Dropdown custom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Aktivitas Fisik</label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateField('activity_level', level.value)}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          formData.activity_level === level.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          formData.activity_level === level.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {level.label[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${formData.activity_level === level.value ? 'text-primary' : 'text-gray-900'}`}>{level.label}</p>
                          <p className="text-xs text-gray-400 truncate">{level.desc}</p>
                        </div>
                        {formData.activity_level === level.value && (
                          <svg className="h-5 w-5 text-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.activity_level && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.activity_level}</p>}
                </div>

                {/* Target Type Cards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Diet</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TARGET_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateField('target_type', t.value)}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          formData.target_type === t.value
                            ? `border-primary bg-primary/5`
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <span className={`text-sm font-semibold ${formData.target_type === t.value ? 'text-primary' : 'text-gray-800'}`}>{t.label}</span>
                        <span className="text-[11px] text-gray-400 leading-tight">{t.desc}</span>
                        {formData.target_type === t.value && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.target_type && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.target_type}</p>}
                </div>

                <Input
                  id="target_weight"
                  label="Target Berat Badan Ideal (kg) — opsional"
                  type="number"
                  placeholder="55"
                  value={formData.target_weight_kg}
                  onChange={e => updateField('target_weight_kg', e.target.value)}
                />
              </div>
            )}

            {/* ═══════════ STEP 3: Kondisi Medis ═══════════ */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Kondisi Medis & Preferensi 🏥</h2>
                  <p className="mt-1 text-sm text-gray-500">Informasi ini membantu ahli gizi menyesuaikan program Anda.</p>
                </div>

                {/* Kondisi Medis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apakah Anda memiliki kondisi medis berikut?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...MEDICAL_CONDITIONS, 'Tidak Ada'].map(condition => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => toggleArrayField('medical_conditions', condition)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          formData.medical_conditions.includes(condition)
                            ? condition === 'Tidak Ada'
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          formData.medical_conditions.includes(condition)
                            ? condition === 'Tidak Ada' ? 'bg-green-500 border-green-500' : 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}>
                          {formData.medical_conditions.includes(condition) && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{condition}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alergi Makanan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alergi Makanan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {COMMON_ALLERGIES.map(allergy => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleArrayField('allergies', allergy)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          formData.allergies.includes(allergy)
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          formData.allergies.includes(allergy) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                        }`}>
                          {formData.allergies.includes(allergy) && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{allergy}</span>
                      </button>
                    ))}
                  </div>
                  <Input
                    id="custom_allergy"
                    placeholder="Alergi lainnya (ketik di sini)"
                    value={formData.custom_allergy}
                    onChange={e => updateField('custom_allergy', e.target.value)}
                  />
                </div>

                {/* Pantangan / Preferensi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pantangan / Preferensi Makanan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DIETARY_PREFERENCES.map(pref => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => toggleArrayField('dietary_preferences', pref)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          formData.dietary_preferences.includes(pref)
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          formData.dietary_preferences.includes(pref) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                        }`}>
                          {formData.dietary_preferences.includes(pref) && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{pref}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Makanan Favorit */}
                <div>
                  <label htmlFor="fav_foods" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Makanan Favorit <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    id="fav_foods"
                    rows={3}
                    placeholder="Contoh: nasi goreng, ayam bakar, salad buah..."
                    value={formData.favorite_foods}
                    onChange={e => updateField('favorite_foods', e.target.value)}
                    className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            )}

            {/* ═══════════ STEP 4: Ringkasan ═══════════ */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Ringkasan Program Anda ✨</h2>
                  <p className="mt-1 text-sm text-gray-500">Periksa data Anda dan lihat rekomendasi gizi personal.</p>
                </div>

                {/* Data Summary */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tinggi / Berat</span>
                    <span className="text-sm font-medium text-gray-900">{formData.height_cm} cm / {formData.weight_kg} kg</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Usia / Gender</span>
                    <span className="text-sm font-medium text-gray-900">{calculatedAge} tahun / {formData.gender === 'male' ? 'Pria' : 'Wanita'}</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Aktivitas</span>
                    <span className="text-sm font-medium text-gray-900">{ACTIVITY_LEVELS.find(a => a.value === formData.activity_level)?.label || '-'}</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Target</span>
                    <span className="text-sm font-medium text-gray-900">{TARGET_TYPES.find(t => t.value === formData.target_type)?.label || '-'}</span>
                  </div>
                  {formData.medical_conditions.length > 0 && formData.medical_conditions[0] !== 'Tidak Ada' && (
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Kondisi Medis</span>
                      <span className="text-sm font-medium text-gray-900">{formData.medical_conditions.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Calculation Results */}
                {localEstimate && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'BMI', value: localEstimate.bmi ?? '-', sub: localEstimate.bmiCategory ?? '', color: localEstimate.bmiColor ?? 'text-gray-600' },
                        { label: 'BMR', value: `${localEstimate.bmr}`, sub: 'kkal/hari', color: 'text-gray-800' },
                        { label: 'TDEE', value: `${localEstimate.tdee}`, sub: 'kkal/hari', color: 'text-gray-800' },
                        { label: 'Target Kalori', value: `${localEstimate.targetCalories}`, sub: 'kkal/hari', color: 'text-primary' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                          <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                          <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Estimation Banner */}
                    {localEstimate.weeklyChange !== 0 && (
                      <div className={`rounded-xl border px-5 py-4 ${
                        localEstimate.weeklyChange < 0
                          ? 'border-blue-200 bg-blue-50'
                          : localEstimate.weeklyChange > 0
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-green-200 bg-green-50'
                      }`}>
                        <p className={`text-sm font-semibold ${
                          localEstimate.weeklyChange < 0 ? 'text-blue-800' : localEstimate.weeklyChange > 0 ? 'text-orange-800' : 'text-green-800'
                        }`}>
                          📊 Estimasi Progres
                        </p>
                        <p className={`mt-1 text-sm ${
                          localEstimate.weeklyChange < 0 ? 'text-blue-700' : localEstimate.weeklyChange > 0 ? 'text-orange-700' : 'text-green-700'
                        }`}>
                          Dengan program ini, Anda diperkirakan {localEstimate.weeklyChange < 0 ? 'turun' : 'naik'}{' '}
                          <span className="font-bold">{Math.abs(localEstimate.weeklyChange)} kg/minggu</span> atau{' '}
                          <span className="font-bold">{Math.abs(Math.round(localEstimate.weeklyChange * 4.3 * 100) / 100)} kg dalam 30 hari</span>.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Error */}
                {submitError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── Navigation Buttons ──────────────────── */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:px-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Kembali
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} size="lg" className="min-w-[140px] shadow-lg shadow-primary/20">
                Lanjut
                <svg className="ml-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                size="lg"
                className="min-w-[180px] shadow-lg shadow-primary/20"
              >
                🚀 Konfirmasi & Mulai Program
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
