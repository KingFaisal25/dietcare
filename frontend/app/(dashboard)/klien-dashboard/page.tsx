"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  FiTarget,
  FiVideo,
  FiCalendar,
  FiTrendingUp
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
import { AnimatePresence } from "framer-motion";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { TiltCard } from "@/components/ui/TiltCard";

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
    isSoon: boolean; // < 30 menit
  } | null;
  weeklyTarget: {
    targetWeightLoss: number;
    currentWeightLoss: number;
  };
}

// --- Dummy Data Fallback ---
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
    nutritionistName: ", S.Gz",
    nutritionistPhoto: "https://ui-avatars.com/api/?name=&background=f0fdf6&color=16a361",
    date: "2025-01-05",
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

  // 1. Fetch Dashboard Data
  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      try {
        const res = await api.get("/client/dashboard");
        return res.data.data as DashboardData;
      } catch (err) {
        console.warn("API error, using dummy data");
        return dummyData;
      }
    },
  });

  const d = data || dummyData;
  const calPercent = Math.min((d.stats.caloriesConsumed / d.stats.caloriesTarget) * 100, 100);
  const calRemaining = d.stats.caloriesTarget - d.stats.caloriesConsumed;
  
  // Animation for Donut Chart
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedDasharray(calPercent);
    }, 100);
    return () => clearTimeout(timeout);
  }, [calPercent]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 19) return "Selamat sore";
    return "Selamat malam";
  };

  const getMotivation = () => {
    if (calPercent >= 100) return "Target kalori hari ini sudah tercapai! 🎯";
    if (calPercent >= 80) return `Kamu sudah ${Math.round(calPercent)}% target kalori hari ini! 🎉`;
    if (calPercent >= 50) return "Setengah jalan menuju target kalori hari ini! 💪";
    return "Ayo mulai isi jurnal makananmu hari ini! 🥗";
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
        // Handle food addition logic
      } else {
        toast.error("Produk tidak ditemukan", { id: "barcode-search" });
      }
    } catch (err) {
      toast.error("Gagal mencari produk", { id: "barcode-search" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 lg:pb-8 relative">
      <Scene3DBackground subtle />
      
      {/* 1. GREETING ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-[22px] font-bold text-white">
            {getGreeting()}, {d.user.name}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            {getMotivation()}
          </p>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-white/[0.06]">
          <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-emerald-400" />
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
          </p>
        </div>
      </div>

      {/* 2. STATS CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        {/* Kalori */}
        <div className="p-5 bg-gray-900 border border-white/[0.06] rounded-2xl hover:-translate-y-[2px] hover:border-white/10 transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
                <HiFire className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Kalori Hari Ini</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-extrabold font-mono tracking-tight text-white">{d.stats.caloriesConsumed}</span>
              <span className="text-xs font-bold text-gray-500">kkal</span>
            </div>
            <div className="text-[10px] font-bold text-gray-600">Target: {d.stats.caloriesTarget} kkal</div>
          </div>
        </div>

        {/* Protein */}
        <div className="p-5 bg-gray-900 border border-white/[0.06] rounded-2xl hover:-translate-y-[2px] hover:border-white/10 transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                <FaDumbbell className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Protein</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-extrabold font-mono tracking-tight text-white">{d.macros.protein.consumed}</span>
              <span className="text-xs font-bold text-gray-500">g</span>
            </div>
            <div className="text-[10px] font-bold text-gray-600">Target: {d.macros.protein.target} g</div>
          </div>
        </div>

        {/* Berat Badan */}
        <div className="p-5 bg-gray-900 border border-white/[0.06] rounded-2xl hover:-translate-y-[2px] hover:border-white/10 transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400">
                <FaWeight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-400">Berat Badan</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-extrabold font-mono tracking-tight text-white">{d.stats.currentWeight}</span>
              <span className="text-xs font-bold text-gray-500">kg</span>
            </div>
            <div className={`text-[10px] font-bold ${d.stats.weightChange <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {d.stats.weightChange > 0 ? '↑' : '↓'} {Math.abs(d.stats.weightChange)} kg dari awal
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl hover:-translate-y-[2px] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <HiFire className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-white/80">Streak Log</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[28px] font-extrabold font-mono tracking-tight text-white">{d.stats.streakDays}</span>
            </div>
            <div className="text-[10px] font-bold text-white/80">hari berturut-turut</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT — SPLIT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10">
        
        {/* KIRI — Kalori Overview (60%) */}
        <div className="w-full lg:w-[60%]">
          <TiltCard className="p-8 glass-panel border border-white/[0.1] rounded-2xl h-full flex flex-col justify-center">
            <h2 className="text-lg font-bold text-white mb-6">Overview Kalori & Makro</h2>
            
            {/* Donut Chart Custom SVG */}
            <div className="flex justify-center mb-8 relative">
              <div className="w-[240px] h-[240px] relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="12"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${251.2 * (animatedDasharray / 100)} 251.2`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">{calRemaining > 0 ? calRemaining : 0}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Kkal Tersisa</span>
                </div>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="space-y-5">
              {[['Protein', d.macros.protein.consumed, d.macros.protein.target, 'bg-blue-500', 'g'],
                ['Karbohidrat', d.macros.carbs.consumed, d.macros.carbs.target, 'bg-amber-500', 'g'],
                ['Lemak', d.macros.fat.consumed, d.macros.fat.target, 'bg-red-500', 'g']
              ].map(([label, consumed, target, color, unit]) => (
                <div key={String(label)} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-300">{String(label)}</span>
                    <span className="text-gray-500">{consumed}{unit} / {target}{unit}</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${String(color)} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min((Number(consumed) / Number(target)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>

        {/* KANAN — Quick Actions + Ringkasan (40%) */}
        <div className="w-full lg:w-[40%] space-y-6">
          
          {/* Konsultasi Berikutnya */}
          {d.nextConsultation && (
          <TiltCard className="p-6 glass-panel border border-white/[0.1] rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-600 rounded-l-2xl" />
              <h3 className="text-sm font-bold text-white mb-4">Konsultasi Berikutnya</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100">
                  <Image src={d.nextConsultation.nutritionistPhoto} alt="Ahli Gizi" fill className="object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white">{d.nextConsultation.nutritionistName}</p>
                  <p className="text-xs font-medium text-gray-400">
                    {format(new Date(d.nextConsultation.date), "dd MMM yyyy", { locale: idLocale })} • {d.nextConsultation.time}
                  </p>
                </div>
              </div>
              {d.nextConsultation.isSoon ? (
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 border-none shadow-lg shadow-emerald-500/25">
                  <FiVideo className="w-4 h-4" /> Bergabung Sekarang
                </Button>
              ) : (
                <Button variant="outline" className="w-full font-bold border-white/10 text-gray-400" disabled>
                  Belum Waktunya
                </Button>
              )}
            </TiltCard>
          )}

          {/* Log Makan Cepat */}
          <TiltCard className="p-6 glass-panel border border-white/[0.1] rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Log Makan Cepat</h3>
            <div className="flex flex-col gap-3">
              {[['breakfast','🌅','Sarapan'],['lunch','☀️','Makan Siang'],['dinner','🌙','Makan Malam']].map(([type, emoji, label]) => (
                <button
                  key={String(type)}
                  onClick={() => handleOpenLog(String(type))}
                  className="w-full flex items-center gap-3 h-13 px-4 py-3.5 rounded-xl bg-gray-800 border border-white/[0.06] text-sm font-semibold text-gray-300 hover:bg-gray-750 hover:border-emerald-500/30 hover:text-white transition-all text-left"
                >
                  <span className="text-xl">{String(emoji)}</span>
                  {String(label)}
                </button>
              ))}
            </div>
          </TiltCard>

          {/* Target Minggu Ini */}
          <TiltCard className="p-6 glass-panel border border-white/[0.1] rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Target Minggu Ini</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-400">Penurunan Berat Badan</span>
                <span className="text-white">{d.weeklyTarget.currentWeightLoss}kg / {d.weeklyTarget.targetWeightLoss}kg</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${Math.min((d.weeklyTarget.currentWeightLoss / d.weeklyTarget.targetWeightLoss) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-600 font-medium text-center">
                Tetap konsisten untuk mencapai target mingguanmu!
              </p>
            </div>
          </TiltCard>

          <TiltCard className="p-6 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20">
            <h3 className="text-sm font-bold text-white mb-3">Gamifikasi Mingguan</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/10 px-2 py-3">
                <p className="text-2xl">🔥</p>
                <p className="text-xs text-emerald-200 mt-1">Streak 7 Hari</p>
              </div>
              <div className="rounded-xl bg-white/10 px-2 py-3">
                <p className="text-2xl">🏅</p>
                <p className="text-xs text-emerald-200 mt-1">Badge Konsisten</p>
              </div>
              <div className="rounded-xl bg-white/10 px-2 py-3">
                <p className="text-2xl">🎯</p>
                <p className="text-xs text-emerald-200 mt-1">Target 80%</p>
              </div>
            </div>
          </TiltCard>

        </div>
      </div>

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
