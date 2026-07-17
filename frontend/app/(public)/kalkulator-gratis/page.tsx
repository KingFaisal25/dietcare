'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiActivity,
  FiDroplet,
  FiZap,
  FiArrowRight,
  FiUser,
  FiCoffee,
  FiSearch,
  FiClock,
  FiDollarSign,
  FiAlertTriangle
} from 'react-icons/fi';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowRight, Check, Clock3, HeartPulse, ShieldCheck, Sparkles, Target, Trash2, X } from 'lucide-react';
import { CALCULATOR_HISTORY_EVENT, clearCalculatorHistory, loadCalculatorHistory, removeCalculatorHistory, type CalculatorHistoryRecord } from '@/lib/calculator-history';

// Import refactored calculator components
import { CompleteCalculator } from '@/components/calculators/CompleteCalculator';
import { CalorieBurnCalculator } from '@/components/calculators/CalorieBurnCalculator';
import { WaterIntakeCalculator } from '@/components/calculators/WaterIntakeCalculator';
import { MealPlanGenerator } from '@/components/calculators/MealPlanGenerator';
import { MetabolicAgeCalculator } from '@/components/calculators/MetabolicAgeCalculator';
import { FoodSearchTool } from '@/components/calculators/FoodSearchTool';
import { FastingPlanner } from '@/components/calculators/FastingPlanner';
import { BudgetDietCalculator } from '@/components/calculators/BudgetDietCalculator';
import { CheatMealChecker } from '@/components/calculators/CheatMealChecker';
import { RecipeGenerator } from '@/components/calculators/RecipeGenerator';
import { JajananChecker } from '@/components/calculators/JajananChecker';

export default function FreeCalculatorsPage() {
  const [activeTab, setActiveTab] = useState('complete');
  const [goal, setGoal] = useState('health');
  const [history, setHistory] = useState<CalculatorHistoryRecord[]>([]);
  const heroRef = useRef(null);
  const tabsRef = useRef(null);
  const contentRef = useRef(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const closeWelcome = () => {
    sessionStorage.setItem('free-calculator-welcome-seen', '1');
    if (welcomeRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(welcomeRef.current, { autoAlpha: 0, scale: 0.96, duration: 0.2, ease: 'power2.in', onComplete: () => setShowWelcome(false) });
    } else {
      setShowWelcome(false);
    }
  };

  const startCalculator = () => {
    closeWelcome();
    window.setTimeout(() => document.getElementById('calculator-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 220);
  };

  useEffect(() => {
    const welcomeSeen = sessionStorage.getItem('free-calculator-welcome-seen');
    if (!welcomeSeen) {
      const timer = window.setTimeout(() => setShowWelcome(true), 900);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!showWelcome || !welcomeRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(welcomeRef.current, { autoAlpha: 0, scale: 0.94, y: 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' });
  }, [showWelcome]);

  useEffect(() => {
    if (!showWelcome) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWelcome();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome]);

  useEffect(() => {
    setHistory(loadCalculatorHistory());
    const syncHistory = () => setHistory(loadCalculatorHistory());
    window.addEventListener(CALCULATOR_HISTORY_EVENT, syncHistory);
    window.addEventListener('storage', syncHistory);
    return () => {
      window.removeEventListener(CALCULATOR_HISTORY_EVENT, syncHistory);
      window.removeEventListener('storage', syncHistory);
    };
  }, []);

  useEffect(() => {
    // GSAP Intro Animation
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.hero-element, [data-calculator-tabs]', { clearProps: 'all' });
        return;
      }
      gsap.fromTo(".hero-element",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );

      gsap.fromTo(tabsRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: "back.out(1.2)" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Animate content change when tab switches
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  useEffect(() => {
    if (!goalRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(goalRef.current.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' });
  }, []);

  const goalOptions = [
    { id: 'health', label: 'Mulai hidup lebih sehat', description: 'Pahami kebutuhan dasar tubuh', tab: 'complete', icon: HeartPulse },
    { id: 'weight', label: 'Atur berat badan', description: 'Cari arah kalori dan menu', tab: 'calorie', icon: Target },
    { id: 'active', label: 'Lebih aktif setiap hari', description: 'Hitung olahraga dan energi', tab: 'calorie', icon: FiActivity },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--background)] pb-20 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {showWelcome && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWelcome(); }}>
        <div ref={welcomeRef} role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl shadow-emerald-950/20 sm:p-8">
          <button type="button" onClick={closeWelcome} aria-label="Tutup penawaran kalkulator" className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"><X className="h-5 w-5" /></button>
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Sparkles className="h-7 w-7" aria-hidden="true" /></div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Gratis · Tanpa login</p>
          <h2 id="welcome-title" className="mt-2 pr-8 text-3xl font-black leading-tight text-slate-950">Kenali kebutuhan tubuhmu dalam 1 menit</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Dapatkan gambaran BMI, kebutuhan kalori, dan hidrasi sebagai langkah awal menuju pola hidup yang lebih seimbang.</p>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Hasil mudah dipahami</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Data tidak perlu disimpan ke akun</span></div>
          <button type="button" onClick={startCalculator} className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">Coba kalkulator gratis <ArrowRight className="h-5 w-5" /></button>
          <button type="button" onClick={closeWelcome} className="mt-3 min-h-11 w-full rounded-2xl px-5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200">Nanti saja</button>
        </div>
      </div>}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(29,162,113,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(29,162,113,.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 px-4 pb-10 pt-16 sm:px-6 md:pb-14 md:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
          <div className="hero-element mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            100% Gratis & Tanpa Login
          </div>

          <h1 className="hero-element mb-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl md:text-7xl">
            Kenali tubuhmu, <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              rawat dengan tepat
            </span>
          </h1>

          <p className="hero-element max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Hitung BMI, kebutuhan kalori, hidrasi, dan berbagai kebutuhan gizi dengan panduan sederhana yang mudah dipahami.
          </p>
          <div className="hero-element mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-700">
            {['Berbasis data', 'Mudah digunakan', 'Privasi terjaga'].map((item) => <span key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">✓ {item}</span>)}
          </div>
          </div>
          <div className="hero-element relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_24px_70px_rgba(29,162,113,.16)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
              <div className="flex items-center justify-between"><FiActivity className="text-3xl" aria-hidden="true" /><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Sehat itu terukur</span></div>
              <p className="mt-12 text-sm text-emerald-100">Mulai dari satu langkah kecil</p>
              <p className="mt-1 text-3xl font-black">Lebih paham. Lebih siap.</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600"><span className="rounded-xl bg-emerald-50 p-3">BMI</span><span className="rounded-xl bg-amber-50 p-3">Kalori</span><span className="rounded-xl bg-teal-50 p-3">Air</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <div className="rounded-[2rem] border border-white/80 bg-white/65 p-3 shadow-[0_24px_80px_rgba(15,23,42,.08)] backdrop-blur-2xl md:rounded-[2.5rem] md:p-7">
          <div className="mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-end sm:justify-between md:px-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Pilih kebutuhanmu</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Mulai dari data yang paling penting</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-500 sm:text-right">Semua alat gratis, praktis, dan dirancang untuk membantu keputusan harianmu.</p>
          </div>

          <div ref={goalRef} className="mb-7 rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white"><Target className="h-5 w-5" aria-hidden="true" /></div><div><h3 className="font-black text-slate-900">Apa yang ingin kamu capai?</h3><p className="text-xs text-slate-500">Kami bantu mulai dari alat yang paling relevan.</p></div></div>
            <div className="grid gap-2 md:grid-cols-3">
              {goalOptions.map((option) => { const Icon = option.icon; const selected = goal === option.id; return <button key={option.id} type="button" onClick={() => { setGoal(option.id); setActiveTab(option.tab); }} aria-pressed={selected} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${selected ? 'border-emerald-500 bg-white shadow-md shadow-emerald-900/10' : 'border-white bg-white/60 hover:border-emerald-200 hover:bg-white'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><span><span className="block text-sm font-black text-slate-900">{option.label}</span><span className="mt-1 block text-xs text-slate-500">{option.description}</span></span></button>; })}
            </div>
          </div>

          {/* Tabs - Glassmorphism Scrollable */}
          <div ref={tabsRef} data-calculator-tabs className="mb-8 rounded-[1.75rem] border border-white/80 bg-white/55 p-3 shadow-inner backdrop-blur-xl md:p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { id: 'complete', icon: FiUser, label: 'BMI & TDEE', color: 'emerald' },
                { id: 'calorie', icon: FiZap, label: 'Kalori Terbakar', color: 'orange' },
                { id: 'water', icon: FiDroplet, label: 'Kebutuhan Air', color: 'blue' },
                { id: 'mealplan', icon: FiCoffee, label: 'Menu 3 Hari', color: 'purple' },
                { id: 'food', icon: FiSearch, label: 'Cari Makanan', color: 'yellow' },
                { id: 'fasting', icon: FiClock, label: 'Jadwal Puasa', color: 'teal' },
                { id: 'jajanan', icon: FiZap, label: 'Kalori Jajanan', color: 'orange' },
                { id: 'age', icon: FiActivity, label: 'Usia Tubuh', color: 'indigo' },
                { id: 'budget', icon: FiDollarSign, label: 'Diet Hemat', color: 'emerald' },
                { id: 'recipe', icon: FiCoffee, label: 'Isi Kulkas Jadi Apa?', color: 'emerald' },
                { id: 'cheat', icon: FiAlertTriangle, label: 'Boleh Cheat?', color: 'red' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                let colorClasses = '';
                if (isActive) {
                  colorClasses = 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]';
                } else {
                  colorClasses = 'text-slate-600 hover:bg-white hover:text-emerald-700';
                }

                const iconColor = isActive ? 'text-white' : 'group-hover:scale-110 transition-transform';

                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="calculator-panel"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative min-h-14 rounded-2xl px-3 py-3 text-center text-xs font-black leading-4 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 sm:text-sm ${colorClasses}`}
                  >
                    <span className="relative z-10 flex flex-col items-center justify-center gap-1.5"><Icon className={`text-lg ${iconColor}`} aria-hidden="true" /><span>{tab.label}</span></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator Components Container */}
          <div ref={contentRef} id="calculator-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-10">
            {activeTab === 'complete' && <CompleteCalculator />}
            {activeTab === 'calorie' && <CalorieBurnCalculator />}
            {activeTab === 'water' && <WaterIntakeCalculator />}
            {activeTab === 'mealplan' && <MealPlanGenerator />}
            {activeTab === 'age' && <MetabolicAgeCalculator />}
            {activeTab === 'food' && <FoodSearchTool />}
            {activeTab === 'fasting' && <FastingPlanner />}
            {activeTab === 'budget' && <BudgetDietCalculator />}
            {activeTab === 'cheat' && <CheatMealChecker />}
            {activeTab === 'recipe' && <RecipeGenerator />}
            {activeTab === 'jajanan' && <JajananChecker />}
          </div>

          <section aria-labelledby="history-title" className="mx-auto mt-6 max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <h2 id="history-title" className="text-lg font-black text-slate-900">Riwayat perhitungan</h2>
              </div>
              {history.length > 0 && <button type="button" onClick={() => clearCalculatorHistory()} className="min-h-11 rounded-xl px-3 text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200">Hapus semua</button>}
            </div>
            {history.length === 0 ? <p className="mt-3 text-sm text-slate-600">Hasil perhitungan terbaru akan muncul di sini.</p> : <ul className="mt-4 grid gap-3" aria-live="polite">{history.map((item) => <li key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"><div><p className="font-bold text-slate-900">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.summary}</p><div className="mt-2 flex flex-wrap gap-2">{item.badges?.map((badge) => <span key={badge} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">{badge}</span>)}</div></div><button type="button" aria-label={`Hapus riwayat ${item.title}`} onClick={() => removeCalculatorHistory(item.id)} className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></li>)}</ul>}
          </section>
        </div>

        {/* Viral Banner */}
        <div className="group relative mt-16 overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 to-amber-50/80 transition-transform duration-700 group-hover:scale-105" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black text-slate-950 md:text-4xl">Siap mulai hidup lebih seimbang?</h2>
            <p className="text-lg text-slate-600">
              Dapatkan meal plan khusus, monitoring progres harian, dan konsultasi 1-on-1 dengan ahli gizi profesional tersertifikasi.
            </p>
            <div className="pt-4">
              <Link href="/register">
                <button className="mx-auto flex items-center gap-3 rounded-full bg-emerald-600 px-10 py-5 text-lg font-black text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700">
                  Daftar Program Premium <FiArrowRight className="text-xl animate-bounce" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
