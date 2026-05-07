"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiCamera,
  FiMaximize,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiAlertCircle,
  FiAward
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";
import { format, addDays, subDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartOptions,
  Filler
} from "chart.js";
import FoodSearchModal from "@/components/diary/FoodSearchModal";
import BarcodeScanner from "@/components/diary/BarcodeScanner";
import FoodCamera from "@/components/FoodCamera";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

interface DiaryEntry {
  id: number;
  food_name_snapshot: string;
  quantity_gram: number;
  calories: number;
}

interface DiaryData {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  entries: Record<string, DiaryEntry[]>;
}

interface WeeklyDay {
  day_name: string;
  calories: number;
  date?: string; // Assume we might have date, otherwise we use index
}

interface WeeklySummary {
  data: WeeklyDay[];
  best_day: string;
}

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

const MEAL_TYPES = [
  { id: "breakfast", label: "Sarapan", icon: "🌅" },
  { id: "morning_snack", label: "Snack Pagi", icon: "☀️" },
  { id: "lunch", label: "Makan Siang", icon: "🌞" },
  { id: "afternoon_snack", label: "Snack Sore", icon: "🌆" },
  { id: "dinner", label: "Makan Malam", icon: "🌙" },
];

// --- Dummy Data Fallback ---
const dummyDiaryData: DiaryData = {
  consumed: { calories: 1450, protein: 72, carbs: 190, fat: 38 },
  remaining: { calories: 350, protein: 18, carbs: 35, fat: 12 },
  target: { calories: 1800, protein: 90, carbs: 225, fat: 50 },
  entries: {
    breakfast: [
      { id: 1, food_name_snapshot: "Oatmeal with Fruits", quantity_gram: 250, calories: 350 },
      { id: 2, food_name_snapshot: "Black Coffee", quantity_gram: 200, calories: 5 },
    ],
    lunch: [
      { id: 3, food_name_snapshot: "Grilled Chicken Salad", quantity_gram: 350, calories: 450 },
    ],
    dinner: [
      { id: 4, food_name_snapshot: "Steamed Fish with Broccoli", quantity_gram: 300, calories: 400 },
    ],
    morning_snack: [],
    afternoon_snack: [
      { id: 5, food_name_snapshot: "Apple", quantity_gram: 150, calories: 95 },
    ],
    other: []
  }
};

const dummyWeeklySummary: WeeklySummary = {
  data: [
    { day_name: "Sen", calories: 1750 },
    { day_name: "Sel", calories: 1850 },
    { day_name: "Rab", calories: 1600 },
    { day_name: "Kam", calories: 1900 },
    { day_name: "Jum", calories: 1450 },
    { day_name: "Sab", calories: 0 },
    { day_name: "Min", calories: 0 },
  ],
  best_day: "Rabu"
};

export default function FoodDiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaryData, setDiaryData] = useState<DiaryData | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [streak, setStreak] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [showFABOptions, setShowFABOptions] = useState(false);
  const [collapsedMeals, setCollapsedMeals] = useState<Record<string, boolean>>({});
  const [chartPeriod, setChartPeriod] = useState<"Minggu Ini" | "Bulan Ini" | "3 Bulan">("Minggu Ini");

  const fetchDiary = useCallback(async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const [diaryRes, weeklyRes, streakRes] = await Promise.all([
        api.get(`/diary?date=${dateStr}`),
        api.get(`/diary/weekly-summary?week_start=${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd")}`),
        api.get("/diary/streak"),
      ]);
      setDiaryData(diaryRes.data);
      setWeeklySummary(weeklyRes.data);
      setStreak(streakRes.data.streak);
    } catch (err) {
      console.warn("Failed to fetch diary, using dummy data");
      setDiaryData(dummyDiaryData);
      setWeeklySummary(dummyWeeklySummary);
      setStreak(7);
    }
  }, [selectedDate]);

  const handleAddSuccess = () => {
    fetchDiary();
    toast.success("Makanan berhasil ditambahkan!");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus log makanan ini?")) return;
    try {
      await api.delete(`/diary/${id}`);
      fetchDiary();
      toast.success("Makanan berhasil dihapus");
    } catch (err) {
      console.error("Failed to delete", err);
      toast.error("Gagal menghapus makanan");
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScannerOpen(false);
    toast.loading("Mencari produk...", { id: "barcode-search" });
    
    try {
      const res = await api.get(`/foods/barcode/${barcode}`);
      if (res.data.data) {
        toast.success("Produk ditemukan!", { id: "barcode-search" });
        // Handle food addition logic here or open search modal with results
      } else {
        toast.error("Produk tidak ditemukan", { id: "barcode-search" });
      }
    } catch (err) {
      toast.error("Gagal mencari produk", { id: "barcode-search" });
    }
  };

  const toggleCollapse = (mealId: string) => {
    setCollapsedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  // --- 1. DATE NAVIGATOR LOGIC ---
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // --- 2. CHART DATA ---
  const barData = useMemo(() => {
    const labels = weeklySummary?.data.map((d) => d.day_name) || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const data = weeklySummary?.data.map((d) => d.calories) || [0, 0, 0, 0, 0, 0, 0];
    const target = diaryData?.target.calories || 2000;

    const bgColors = data.map((val, idx) => {
      // Highlight active day
      if (idx === (selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1)) return "#16a34a"; // brand-600
      if (val > target) return "#f87171"; // danger-400
      return "#4ade80"; // brand-400
    });

    return {
      labels,
      datasets: [
        {
          label: "Kalori",
          data,
          backgroundColor: bgColors,
          borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
        }
      ]
    };
  }, [weeklySummary, diaryData, selectedDate]);

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "#f3f4f6",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        grid: { color: "#f3f4f6", drawTicks: false },
        border: { display: false },
        ticks: { color: "#9ca3af", font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#6b7280", font: { weight: "bold" } }
      }
    },
  };

  // Mock Line Chart Data for Weight
  const lineData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: "Berat Badan",
        data: [69.5, 69.2, 69.0, 68.8, 68.5, 68.5, 68.2],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#22c55e",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "#f3f4f6",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} kg`
        }
      }
    },
    scales: {
      y: {
        grid: { color: "#f3f4f6", drawTicks: false },
        border: { display: false },
        ticks: { color: "#9ca3af", font: { size: 10 } },
        suggestedMin: 65,
        suggestedMax: 70,
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#6b7280" }
      }
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8 pb-32">
      
      {/* BAGIAN 1 — DATE NAVIGATOR */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 7))} className="p-2 text-neutral-400 hover:text-brand-600 transition-colors">
            <FiChevronLeft size={20} />
          </button>
          <h2 className="text-sm font-bold text-neutral-900">
            {format(weekStart, "d MMM", { locale: idLocale })} - {format(weekEnd, "d MMM yyyy", { locale: idLocale })}
          </h2>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 text-neutral-400 hover:text-brand-600 transition-colors">
            <FiChevronRight size={20} />
          </button>
        </div>
        <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-2 px-1">
          {daysInWeek.map((day) => {
            const isActive = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            // Mock has log
            const hasLog = day <= new Date(); 

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center min-w-[48px] h-14 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-brand-500 text-white shadow-md scale-105" 
                    : isToday 
                      ? "bg-white border-2 border-brand-200 text-brand-700" 
                      : "bg-transparent text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isActive ? "text-white/80" : ""}`}>
                  {format(day, "EEE", { locale: idLocale })}
                </span>
                <span className={`text-lg font-black leading-none mt-0.5 ${isActive ? "text-white" : "text-neutral-900"}`}>
                  {format(day, "d")}
                </span>
                {hasLog && !isActive && (
                  <div className="w-1 h-1 bg-brand-400 rounded-full mt-1" />
                )}
                {hasLog && isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
        {!isSameDay(selectedDate, new Date()) && (
          <div className="flex justify-center mt-1">
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Kembali ke Hari Ini
            </button>
          </div>
        )}
      </div>

      {/* BAGIAN 2 — KALORI SUMMARY BAR */}
      <Card className="p-6 bg-brand-500 text-white border-none shadow-green rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-white/80 mb-1">Kalori Hari Ini</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tracking-tight">{diaryData?.consumed.calories || 0}</span>
                <span className="text-lg font-medium text-white/80">/ {diaryData?.target.calories || 0} kkal</span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                {diaryData?.remaining.calories || 0} kkal tersisa
              </span>
            </div>
          </div>
          
          <div className="h-2 bg-black/20 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(((diaryData?.consumed.calories || 0) / (diaryData?.target.calories || 1)) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/20 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 w-4">P</span>
              <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-300" style={{ width: `${Math.min(((diaryData?.consumed.protein || 0) / (diaryData?.target.protein || 1)) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 w-4">K</span>
              <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-300" style={{ width: `${Math.min(((diaryData?.consumed.carbs || 0) / (diaryData?.target.carbs || 1)) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 w-4">L</span>
              <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-red-300" style={{ width: `${Math.min(((diaryData?.consumed.fat || 0) / (diaryData?.target.fat || 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* BAGIAN 3 — MEAL SECTIONS */}
      <div className="space-y-6">
        {MEAL_TYPES.map((meal) => {
          const isCollapsed = collapsedMeals[meal.id];
          const entries = diaryData?.entries[meal.id] || [];
          const sectionCalories = Math.round(entries.reduce((sum, e) => sum + e.calories, 0));

          return (
            <div key={meal.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Header Seksi */}
              <div 
                onClick={() => toggleCollapse(meal.id)}
                className="bg-surface-50 border-b border-surface-200 p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meal.icon}</span>
                  <h3 className="font-bold text-neutral-900">{meal.label}</h3>
                  <span className="text-xs font-bold text-neutral-500 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                    {sectionCalories} kkal
                  </span>
                </div>
                <button className="text-neutral-400 hover:text-brand-600 transition-colors">
                  {isCollapsed ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
                </button>
              </div>

              {/* List Items */}
              {!isCollapsed && (
                <div className="divide-y divide-neutral-100">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.id} className="p-4 flex items-center justify-between group hover:bg-surface-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface-200 rounded-xl flex items-center justify-center text-neutral-500 shrink-0">
                            <FiSearch size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900 leading-tight">{entry.food_name_snapshot}</h4>
                            <p className="text-xs text-neutral-400 mt-0.5">1 porsi · {entry.quantity_gram}g</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-neutral-900">{Math.round(entry.calories)}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                            <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
                      <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-1">
                        <span className="text-xl opacity-50">🍽️</span>
                      </div>
                      <p className="text-sm font-medium">Belum ada makanan</p>
                    </div>
                  )}
                  
                  {/* Footer Seksi */}
                  <div className="p-3 bg-white">
                    <Button 
                      variant="ghost" 
                      className="w-full text-brand-600 font-bold hover:bg-brand-50 hover:text-brand-700"
                      onClick={() => {
                        setActiveMealType(meal.id);
                        setIsSearchOpen(true);
                      }}
                    >
                      <FiPlus className="mr-2" /> Tambah Makanan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BAGIAN 5 — GRAFIK PROGRESS */}
      <div className="pt-8 space-y-6 border-t border-neutral-100 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Progress Kamu</h2>
          <div className="flex bg-surface-100 p-1 rounded-lg">
            {["Minggu Ini", "Bulan Ini", "3 Bulan"].map(tab => (
              <button 
                key={tab}
                onClick={() => setChartPeriod(tab as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  chartPeriod === tab 
                    ? "bg-white text-brand-600 shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Bar Chart Kalori */}
        <Card className="p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Kalori Mingguan</h3>
              <p className="text-xs text-neutral-500 mt-1">Target harian: {diaryData?.target.calories || 2000} kkal</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <Bar data={barData} options={barOptions} />
          </div>

          {/* 2. Macro Breakdown Chart (Mini stacked) */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Rata-rata Makro</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-neutral-700">Protein</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }} />
                </div>
                <span className="w-16 text-right text-xs font-bold text-neutral-500">68g/90g</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-neutral-700">Karbo</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "85%" }} />
                </div>
                <span className="w-16 text-right text-xs font-bold text-neutral-500">190g/225g</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-neutral-700">Lemak</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "60%" }} />
                </div>
                <span className="w-16 text-right text-xs font-bold text-neutral-500">30g/50g</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Line Chart Berat Badan */}
        <Card className="p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Trend Berat Badan</h3>
              <p className="text-xs text-neutral-500 mt-1">Target akhir: 65 kg</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </Card>

        {/* 4. Insights Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-none bg-green-50 shadow-sm flex items-start gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FiAward size={18} /></div>
            <div>
              <p className="text-sm font-bold text-green-900">Hari Terbaik</p>
              <p className="text-xs text-green-700 mt-0.5">Rabu (sesuai target penuh)</p>
            </div>
          </Card>
          <Card className="p-4 border-none bg-amber-50 shadow-sm flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAlertCircle size={18} /></div>
            <div>
              <p className="text-sm font-bold text-amber-900">Perhatian Makro</p>
              <p className="text-xs text-amber-700 mt-0.5">Protein kurang 3 hari minggu ini</p>
            </div>
          </Card>
          <Card className="p-4 border-none bg-brand-50 shadow-sm flex items-start gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg"><FiTrendingUp size={18} /></div>
            <div>
              <p className="text-sm font-bold text-brand-900">Konsistensi</p>
              <p className="text-xs text-brand-700 mt-0.5">Streak logging {streak} hari berturut-turut!</p>
            </div>
          </Card>
        </div>
      </div>

      {/* BAGIAN 4 — FLOATING ACTION BUTTON */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end gap-4">
        {/* Backdrop for Bottom Sheet / Menu */}
        {showFABOptions && (
          <div 
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-30"
            onClick={() => setShowFABOptions(false)}
          />
        )}
        
        {/* Bottom Sheet Menu */}
        <div className={`fixed md:absolute bottom-0 md:bottom-20 left-0 right-0 md:left-auto md:right-0 bg-white md:bg-transparent rounded-t-2xl md:rounded-none z-40 transition-transform duration-300 transform ${showFABOptions ? "translate-y-0" : "translate-y-full md:translate-y-4 md:opacity-0 md:pointer-events-none"}`}>
          <div className="md:hidden w-12 h-1.5 bg-neutral-200 rounded-full mx-auto my-3" />
          <div className="p-6 md:p-0 flex flex-col gap-3">
            {[
              { label: "Cari Makanan", icon: <FiSearch />, color: "bg-blue-500", action: () => setIsSearchOpen(true) },
              { label: "AI Scan", icon: <FiCamera />, color: "bg-purple-600", action: () => setIsCameraOpen(true) },
              { label: "Scan Barcode", icon: <FiMaximize />, color: "bg-amber-500", action: () => alert("Fitur Scan Barcode segera hadir!") },
              { label: "Input Manual", icon: <FiEdit />, color: "bg-brand-500", action: () => alert("Input Manual diklik") },
            ].map((opt) => (
              <button 
                key={opt.label}
                onClick={() => { setShowFABOptions(false); opt.action(); }}
                className="flex items-center gap-4 w-full md:w-auto md:flex-row-reverse group bg-white md:bg-transparent p-3 md:p-0 rounded-xl shadow-sm md:shadow-none border border-neutral-100 md:border-none hover:bg-neutral-50 transition-colors"
              >
                <span className="md:bg-white md:px-4 md:py-2 md:rounded-xl md:shadow-lg text-sm font-bold text-neutral-700 flex-1 text-left md:text-right">
                  {opt.label}
                </span>
                <div className={`w-12 h-12 md:w-14 md:h-14 ${opt.color} text-white rounded-2xl flex items-center justify-center shadow-lg md:group-hover:scale-110 transition-transform shrink-0`}>
                  {opt.icon}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowFABOptions(!showFABOptions)}
          className={`relative z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-green flex items-center justify-center transition-all duration-300 ${
            showFABOptions ? "bg-neutral-900 rotate-45" : "bg-brand-500 hover:scale-105 hover:bg-brand-600"
          }`}
        >
          <FiPlus size={28} className="text-white" />
        </button>
      </div>

      <FoodSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        mealType={activeMealType}
        date={format(selectedDate, "yyyy-MM-dd")}
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

      {/* CAMERA MODAL */}
      <Modal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        title="AI Food Analysis"
      >
        <FoodCamera />
      </Modal>

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