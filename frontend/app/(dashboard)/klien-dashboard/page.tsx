"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  FiTarget,
  FiVideo,
  FiCalendar,
  FiTrendingUp,
  FiChevronRight,
  FiPlus,
  FiPieChart,
  FiActivity,
  FiArrowLeft
} from "react-icons/fi";
import { HiFire } from "react-icons/hi2";
import { FaDumbbell, FaWeight } from "react-icons/fa";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import FoodSearchModal from "@/components/diary/FoodSearchModal";
import BarcodeScanner from "@/components/diary/BarcodeScanner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { TiltCard } from "@/components/ui/TiltCard";
import { Skeleton, SkeletonCard, SkeletonAvatar } from "@/components/ui/Skeleton";

import { BodyComposition3D } from "@/components/BodyComposition3D";

// --- Tipe Data ---
interface DashboardData {
  user: {
    name: string;
    programName: string;
    currentDay: number;
    totalDays: number;
  };
  stats: {
    currentWeight: number;
    weightChange: number;
    caloriesConsumed: number;
    caloriesTarget: number;
    remainingDays: number;
    streakDays: number;
  };
  macros: {
    carbs: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
  nextConsultation: {
    nutritionistName: string;
    nutritionistPhoto: string;
    date: string;
    time: string;
    isSoon: boolean;
  } | null;
  weeklyTarget: {
    targetWeightLoss: number;
    currentWeightLoss: number;
  };
}

const dummyData: DashboardData = {
  user: {
    name: "Klien",
    programName: "Body Goals",
    currentDay: 5,
    totalDays: 30,
  },
  stats: {
    currentWeight: 68.5,
    weightChange: -1.5,
    caloriesConsumed: 1450,
    caloriesTarget: 1800,
    remainingDays: 25,
    streakDays: 7,
  },
  macros: {
    carbs: { consumed: 190, target: 225 },
    protein: { consumed: 72, target: 90 },
    fat: { consumed: 38, target: 50 },
  },
  nextConsultation: {
    nutritionistName: "Tim Ahli Gizi",
    nutritionistPhoto: "https://ui-avatars.com/api/?name=Tim+Ahli+Gizi&background=f0fdf6&color=16a361",
    date: "2026-05-10",
    time: "10:00",
    isSoon: true,
  },
  weeklyTarget: {
    targetWeightLoss: 0.5,
    currentWeightLoss: 0.2,
  }
};

export default function KlienDashboardPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [animatedDasharray, setAnimatedDasharray] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      try {
        const res = await api.get("/client/dashboard");
        return res.data.data as DashboardData;
      } catch (err) {
        throw err;
      }
    },
  });

  const calPercent = data ? Math.min((data.stats.caloriesConsumed / data.stats.caloriesTarget) * 100, 100) : 0;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedDasharray(calPercent), 100);
    return () => clearTimeout(timeout);
  }, [calPercent]);

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div><h1 className="text-xl font-black text-slate-900">Dashboard belum dapat dimuat</h1><p className="mt-2 text-sm text-slate-500">Data akun sedang tidak tersedia. Coba lagi beberapa saat.</p><Button className="mt-5" onClick={() => refetch()}>Coba lagi</Button></div>
      </div>
    );
  }

  const d = data;
  const calRemaining = d.stats.caloriesTarget - d.stats.caloriesConsumed;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 19) return "Selamat sore";
    return "Selamat malam";
  };

  const handleOpenLog = (mealType: string) => {
    setActiveMealType(mealType);
    setIsSearchOpen(true);
  };

  const handleAddSuccess = () => {
    refetch();
    toast.success("Makanan berhasil ditambahkan!");
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScannerOpen(false);
    toast.loading("Mencari produk...", { id: "barcode-search" });
    try {
      const res = await api.get(`/foods/barcode/${barcode}`);
      if (res.data.data) {
        toast.success("Produk ditemukan!", { id: "barcode-search" });
      } else {
        toast.error("Produk tidak ditemukan", { id: "barcode-search" });
      }
    } catch (err) {
      toast.error("Gagal mencari produk", { id: "barcode-search" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-24 lg:pb-12 relative overflow-hidden transition-colors duration-500">
        <Scene3DBackground subtle />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-12 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <div className="flex gap-4 p-2 bg-[var(--background-elevated)] rounded-2xl border border-[var(--border-color)] shadow-sm">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-[400px] bg-[var(--background-elevated)] rounded-[2.5rem] border border-[var(--border-color)] p-10">
              <div className="flex justify-between mb-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-12">
                <Skeleton className="h-48 w-48 rounded-full" />
                <div className="flex-1 space-y-8">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-8">
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 lg:pb-12 relative overflow-hidden transition-colors duration-500">
      <Scene3DBackground subtle />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 relative z-10">
        
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--background-elevated)] border border-[var(--border-color)] text-[var(--foreground)] font-bold text-sm hover:bg-green-500 hover:text-white hover:border-green-500 transition-all">
            <FiArrowLeft /> Kembali ke Beranda
          </Link>
        </div>

        {/* 1. GREETING & PROGRAM STATUS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[11px] font-black uppercase tracking-[0.2em] border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                {d.user.programName}
              </span>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                Day {d.user.currentDay} / {d.user.totalDays}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight leading-tight">
              {getGreeting()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">{d.user.name}</span>! 👋
            </h1>
            <p className="text-[var(--muted-foreground)] font-medium mt-4 text-lg max-w-xl">
              Kemajuan yang konsisten adalah kunci transformasi. Mari kita lihat capaian Anda hari ini.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-6 bg-[var(--background-elevated)] p-4 rounded-3xl shadow-xl border border-[var(--border-color)] backdrop-blur-xl"
          >
            <div className="px-6 py-2 border-r border-[var(--border-color)]">
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-2">Streak Aktif</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                  <HiFire size={24} className="animate-pulse" />
                </div>
                <span className="text-2xl font-black text-[var(--foreground)]">{d.stats.streakDays} Hari</span>
              </div>
            </div>
            <div className="px-6 py-2">
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-2">Sisa Program</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                  <FiCalendar size={22} />
                </div>
                <span className="text-2xl font-black text-[var(--foreground)]">{d.stats.remainingDays} <span className="text-sm text-[var(--muted-foreground)] font-bold">Hari</span></span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 2. CORE STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Energi Terpakai', val: d.stats.caloriesConsumed, target: d.stats.caloriesTarget, unit: 'kkal', icon: <HiFire size={24} />, color: 'text-orange-500', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' },
            { label: 'Asupan Protein', val: d.macros.protein.consumed, target: d.macros.protein.target, unit: 'g', icon: <FaDumbbell size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' },
            { label: 'Berat Saat Ini', val: d.stats.currentWeight, change: d.stats.weightChange, unit: 'kg', icon: <FaWeight size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
            { label: 'Progres Target', val: d.weeklyTarget.currentWeightLoss, target: d.weeklyTarget.targetWeightLoss, unit: 'kg', icon: <FiTarget size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1), duration: 0.6 }}
            >
              <TiltCard className="bg-[var(--background-elevated)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg ${stat.glow}`}>
                    {stat.icon}
                  </div>
                  <span className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
                
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-4xl font-black text-[var(--foreground)] tracking-tighter">{stat.val}</span>
                  <span className="text-sm font-bold text-[var(--muted-foreground)]">{stat.unit}</span>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border-color)] relative z-10">
                  {stat.target ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-[var(--muted-foreground)]">Target: {stat.target}</span>
                        <span className={stat.color}>{Math.round((stat.val / stat.target) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-[var(--background-soft)] rounded-full overflow-hidden p-0.5 border border-[var(--border-color)]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stat.val / stat.target) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                          className={`h-full ${stat.color.replace('text', 'bg')} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                        />
                      </div>
                    </div>
                  ) : stat.change !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${stat.change <= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {stat.change <= 0 ? '↓' : '↑'}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${stat.change <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(stat.change)} kg <span className="text-[var(--muted-foreground)] lowercase ml-1">dari awal</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* 3. MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: CALORIE & MACRO OVERVIEW (7 Columns) */}
          <div className="lg:col-span-7 space-y-10">
            <TiltCard className="bg-[var(--background-elevated)] p-12 rounded-[3rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors duration-1000" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4 relative z-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[var(--foreground)] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shadow-inner">
                      <FiPieChart size={24} />
                    </div>
                    Analisis Nutrisi
                  </h2>
                  <p className="text-sm font-medium text-[var(--muted-foreground)] ml-14">Data real-time asupan harian Anda</p>
                </div>
                <button className="px-6 py-3 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)] text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] hover:bg-green-500 hover:text-white hover:border-green-500 transition-all shadow-sm">
                  Detail Laporan
                </button>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                {/* Donut Chart with 3D shadow */}
                <div className="relative w-72 h-72 shrink-0 group/chart">
                  <div className="absolute inset-0 bg-green-500/5 rounded-full blur-3xl scale-90 group-hover/chart:scale-100 transition-transform duration-700" />
                  <svg className="w-full h-full -rotate-90 drop-shadow-[0_15px_25px_rgba(0,0,0,0.1)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" strokeWidth="10" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#greenGradient)" strokeWidth="12" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${264 * (calPercent / 100)} 264` }}
                      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-6xl font-black text-[var(--foreground)] tracking-tighter"
                    >
                      {calRemaining > 0 ? calRemaining : 0}
                    </motion.span>
                    <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em] mt-2">Kkal Sisa</span>
                  </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="flex-grow w-full space-y-8">
                  {[
                    { label: 'Karbohidrat', val: d.macros.carbs.consumed, target: d.macros.carbs.target, color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Protein', val: d.macros.protein.consumed, target: d.macros.protein.target, color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Lemak', val: d.macros.fat.consumed, target: d.macros.fat.target, color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' },
                  ].map((m, i) => (
                    <div key={i} className="space-y-3 group/item">
                      <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${m.color}`} />
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)] group-hover/item:text-green-500 transition-colors">{m.label}</span>
                        </div>
                        <span className="text-sm font-black text-[var(--foreground)] tracking-tight">
                          {m.val}g <span className="text-[var(--muted-foreground)] font-bold text-xs">/ {m.target}g</span>
                        </span>
                      </div>
                      <div className="h-3 bg-[var(--background-soft)] rounded-full overflow-hidden border border-[var(--border-color)] p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((m.val / m.target) * 100, 100)}%` }}
                          transition={{ duration: 1.2, delay: 0.7 + (i * 0.15), ease: "easeOut" }}
                          className={`h-full ${m.color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] relative`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>

            {/* Body Composition 3D Integration */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative bg-[var(--background-elevated)] rounded-[3rem] border border-[var(--border-color)] overflow-hidden shadow-2xl">
                <BodyComposition3D />
              </div>
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS & CONSULTATION (5 Columns) */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Consultation Card - Ultra Modern 3D */}
            {d.nextConsultation && (
              <TiltCard className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-300 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <span className="px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-green-400 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    Sesi Terjadwal
                  </span>
                  {d.nextConsultation.isSoon && (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Sekarang</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 mb-10 relative z-10">
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group-hover:rotate-3 transition-transform duration-500">
                    <Image src={d.nextConsultation.nutritionistPhoto} alt="Ahli Gizi" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{d.nextConsultation.nutritionistName}</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">Spesialis Gizi Klinis</p>
                    <div className="flex items-center gap-3 mt-4 text-green-400">
                      <div className="p-1.5 rounded-lg bg-green-500/20"><FiCalendar size={14} /></div>
                      <p className="text-xs font-black uppercase tracking-widest">
                        {format(new Date(d.nextConsultation.date), "dd MMM", { locale: idLocale })} • {d.nextConsultation.time}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className={`w-full h-16 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-4 transition-all relative z-10 ${
                    d.nextConsultation.isSoon 
                      ? 'bg-green-600 hover:bg-green-700 shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:-translate-y-1' 
                      : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                  }`} 
                  disabled={!d.nextConsultation.isSoon}
                >
                  <FiVideo size={20} className={d.nextConsultation.isSoon ? 'animate-bounce' : ''} /> 
                  {d.nextConsultation.isSoon ? 'Masuk Ruang Konsultasi' : 'Belum Waktunya'}
                </Button>
              </TiltCard>
            )}

            {/* Quick Food Log - Interactive Cards */}
            <div className="bg-[var(--background-elevated)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Log Harian</h3>
                <FiPlus className="text-green-500 cursor-pointer hover:rotate-90 transition-transform" size={20} />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'breakfast', label: 'Sarapan', emoji: '🌅', time: '07:00 - 09:00', color: 'hover:border-amber-500/30 hover:bg-amber-500/5' },
                  { id: 'lunch', label: 'Makan Siang', emoji: '☀️', time: '12:00 - 14:00', color: 'hover:border-blue-500/30 hover:bg-blue-500/5' },
                  { id: 'dinner', label: 'Makan Malam', emoji: '🌙', time: '18:00 - 20:00', color: 'hover:border-purple-500/30 hover:bg-purple-500/5' },
                ].map((meal, idx) => (
                  <motion.button
                    key={meal.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    onClick={() => handleOpenLog(meal.id)}
                    className={`flex items-center justify-between p-6 rounded-[1.75rem] bg-[var(--background-soft)] border border-[var(--border-color)] group transition-all duration-300 ${meal.color}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--background-elevated)] shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                        {meal.emoji}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[var(--foreground)] text-base mb-0.5 group-hover:text-green-600 transition-colors">{meal.label}</p>
                        <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{meal.time}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--muted-foreground)] group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 group-hover:shadow-lg transition-all">
                      <FiPlus size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Stats - Micro Cards */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Water', val: '2.5L', icon: <FiActivity />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Steps', val: '8.4k', icon: <FiTrendingUp />, color: 'text-green-500', bg: 'bg-green-500/10' },
              ].map((m, i) => (
                <div key={i} className="bg-[var(--background-elevated)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-lg group hover:-translate-y-1 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    {m.icon}
                  </div>
                  <p className="text-xl font-black text-[var(--foreground)]">{m.val}</p>
                  <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{m.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* 4. WEEKLY PERFORMANCE - STAGGERED LIST */}
        <section className="pt-8 relative">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                <FiActivity size={24} />
              </div>
              <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Performa Mingguan</h2>
            </div>
            <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em]">Mei 2026</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Streak Terpanjang', val: '14 Hari', icon: '🔥', color: 'bg-orange-500/10 text-orange-500', glow: 'shadow-orange-500/10' },
              { label: 'Rata-rata Kalori', val: '1,720', icon: '📊', color: 'bg-green-500/10 text-green-500', glow: 'shadow-green-500/10' },
              { label: 'Badge Diperoleh', val: '5 Badge', icon: '🏅', color: 'bg-purple-500/10 text-purple-500', glow: 'shadow-purple-500/10' },
              { label: 'Poin Kesehatan', val: '1,250 XP', icon: '💎', color: 'bg-blue-500/10 text-blue-500', glow: 'shadow-blue-500/10' },
            ].map((perf, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--background-elevated)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl ${perf.color} flex items-center justify-center text-3xl mx-auto mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg ${perf.glow}`}>
                  {perf.icon}
                </div>
                <p className="text-2xl font-black text-[var(--foreground)] mb-1 tracking-tight group-hover:text-green-500 transition-colors">{perf.val}</p>
                <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">{perf.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* MODALS & OVERLAYS */}
      <FoodSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        mealType={activeMealType} 
        date={format(new Date(), "yyyy-MM-dd")}
        onAdd={handleAddSuccess}
        onScanClick={() => {
          setIsSearchOpen(false);
          setIsScannerOpen(true);
        }}
        onManualClick={() => {
          setIsSearchOpen(false);
          toast.info("Fitur input manual segera hadir!");
        }}
      />

      <AnimatePresence>
        {isScannerOpen && (
          <BarcodeScanner 
            onScan={handleBarcodeScan}
            onClose={() => setIsScannerOpen(false)}
            onManualInput={() => {
              setIsScannerOpen(false);
              toast.info("Fitur input manual segera hadir!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
