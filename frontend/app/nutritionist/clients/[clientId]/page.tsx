"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  FiActivity,
  FiArrowLeft,
  FiClipboard,
  FiTrendingUp,
  FiVideo,
  FiUser,
  FiPlus,
  FiChevronRight,
  FiEdit3,
  FiLock,
  FiShare2,
  FiMessageSquare,
  FiCalendar,
  FiStar,
  FiCheck,
  FiSend,
} from "react-icons/fi";
import { MdOutlineMonitorWeight } from "react-icons/md";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard, SkeletonAvatar, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const tabs = [
  { key: "summary", label: "Ringkasan", icon: FiUser },
  { key: "food-diary", label: "Food Diary", icon: FiClipboard },
  { key: "progress", label: "Progress", icon: FiTrendingUp },
  { key: "notes", label: "Catatan", icon: FiEdit3 },
  { key: "chat", label: "Chat", icon: FiMessageSquare },
] as const;

type DetailTab = (typeof tabs)[number]["key"];

// ─────────── Chat Tab ───────────
interface ChatMessage {
  id: number;
  sender_role: "client" | "nutritionist";
  message: string;
  read_at: string | null;
  created_at: string;
}

function ChatTab({ clientId }: { clientId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/nutritionist/clients/${clientId}/messages`);
      setMessages(res.data.data ?? []);
    } catch {
      // silently fail on poll errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clientId]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setIsSending(true);
    try {
      const res = await api.post(`/nutritionist/clients/${clientId}/messages`, { message: text });
      setMessages((prev) => [...prev, res.data.data]);
      setInput("");
    } catch {
      // no toast — keep it minimal
    } finally {
      setIsSending(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-brand-50 rounded-xl">
            <FiMessageSquare className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">Chat dengan Klien</p>
            <p className="text-[10px] text-neutral-400">Refresh otomatis setiap 5 detik</p>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-neutral-400 animate-pulse">Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <FiMessageSquare className="w-8 h-8 text-neutral-200" />
              <p className="text-sm text-neutral-400">Belum ada pesan. Mulai dari sini!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isNutritionist = msg.sender_role === "nutritionist";
              return (
                <div key={msg.id} className={`flex ${isNutritionist ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isNutritionist
                        ? "bg-brand-500 text-white rounded-br-md"
                        : "bg-neutral-100 text-neutral-800 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isNutritionist ? "text-white/60 text-right" : "text-neutral-400"}`}>
                      {fmt(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-neutral-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}


export default function NutritionistClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const resolvedParams = React.use(params);
  const clientId = Number(resolvedParams.clientId);
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");
  const [noteValue, setNoteValue] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NutritionistClientDetailResponse>({
    queryKey: ["nutritionist-client-detail", clientId],
    queryFn: async () => {
      try {
        const response = await api.get(`/nutritionist/clients/${clientId}`);
        return response.data.data as NutritionistClientDetailResponse;
      } catch {
        return getFallbackClientDetail(clientId);
      }
    },
  });

  const detail = useMemo(() => data ?? getFallbackClientDetail(clientId), [clientId, data]);

  // Seed the textarea once data is loaded
  useEffect(() => {
    if (data?.nutritionist_note !== undefined) {
      setNoteValue(data.nutritionist_note ?? "");
    }
  }, [data?.nutritionist_note]);

  const noteMutation = useMutation({
    mutationFn: (note: string) =>
      api.put(`/nutritionist/clients/${clientId}/note`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionist-client-detail", clientId] });
      setNoteSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setNoteSaved(false), 2500);
    },
  });

  const chartData = {
    labels: detail.progress.labels,
    datasets: [
      {
        label: "Berat badan",
        data: detail.progress.weights,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 97, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="space-y-2">
            <SkeletonText lines={1} />
            <SkeletonText lines={1} />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-24">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/nutritionist/dashboard" className="p-2.5 hover:bg-neutral-50 rounded-2xl transition-all border border-neutral-100">
                <FiArrowLeft className="h-5 w-5 text-neutral-600" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden ring-4 ring-neutral-50">
                  <Image src={detail.client.avatar_url} alt={detail.client.name} fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">{detail.client.name}</h1>
                  <p className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                    {detail.client.program} <span className="text-neutral-300">•</span> Bergabung {format(new Date(), "MMM yyyy")}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                Aktif
              </span>
            </div>
            
            <div className="hidden md:flex gap-3">
              <Button variant="outline" className="font-bold gap-2 rounded-xl border-neutral-200 px-6">
                <FiMessageSquare className="h-4 w-4" /> Kirim Pesan
              </Button>
              <Button className="bg-brand-500 hover:bg-brand-600 text-white font-bold gap-2 rounded-xl px-6 shadow-lg shadow-brand-100">
                <FiVideo className="h-4 w-4" /> Mulai Konsultasi
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                    isActive 
                      ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-100" 
                      : "bg-white text-neutral-500 hover:bg-neutral-50 border-neutral-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TAB RINGKASAN */}
        {activeTab === "summary" && (
          <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
            <div className="space-y-8">
              <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-lg font-bold">Info Personal</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Umur" value={`${detail.client.age || 25} thn`} />
                    <InfoItem label="Tinggi" value={`${detail.client.height_cm || 170} cm`} />
                    <InfoItem label="Berat Awal" value={`${detail.progress.initial_weight} kg`} />
                    <InfoItem label="Berat Sekarang" value={`${detail.progress.current_weight} kg`} color="text-brand-600" />
                    <InfoItem label="BMI" value={detail.calculations.bmi.toFixed(1)} />
                    <InfoItem label="Target" value={`${detail.client.target_weight_kg || 65} kg`} color="text-blue-600" />
                  </div>
                  
                  <div className="pt-6 border-t border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Target Harian</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Kalori Target</p>
                        <p className="text-xl font-black text-neutral-900">{detail.calculations.target_calories.toFixed(0)} <span className="text-xs font-bold text-neutral-400">kkal</span></p>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <p className="text-xs text-neutral-500 font-medium mb-1">Durasi Program</p>
                        <p className="text-xl font-black text-neutral-900">{detail.client.program_duration_days} <span className="text-xs font-bold text-neutral-400">hari</span></p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none shadow-xl shadow-brand-100 rounded-[32px]">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/20 rounded-2xl"><FiActivity className="h-5 w-5" /></div>
                    <h3 className="font-bold text-lg">Kalkulasi Gizi</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10">
                      <span className="text-sm font-medium opacity-90">BMR</span>
                      <span className="font-black">{detail.calculations.bmr.toFixed(0)} kkal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10">
                      <span className="text-sm font-medium opacity-90">TDEE</span>
                      <span className="font-black">{detail.calculations.tdee.toFixed(0)} kkal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm h-fit">
              <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Trend Berat Badan</CardTitle>
                  <p className="text-xs text-neutral-500 mt-1">4 minggu terakhir</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-brand-600">{detail.progress.change_kg > 0 ? "+" : ""}{detail.progress.change_kg.toFixed(1)} kg</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Perubahan</p>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[350px]">
                  <Line 
                    data={chartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: { color: "#f3f4f6" },
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB FOOD DIARY */}
        {activeTab === "food-diary" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Food Diary Klien</h2>
                <p className="text-sm text-neutral-500">Review asupan nutrisi harian klien</p>
              </div>
              <Button className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl gap-2 shadow-lg shadow-brand-100 px-6">
                <FiPlus className="h-4 w-4" /> Tambah Komentar
              </Button>
            </div>
            
            <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100">
                      <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Waktu & Sesi</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Makanan</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Kalori</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Makro</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Komentar Anda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {detail.food_diary.map((entry) => (
                      <tr key={entry.id} className="hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-neutral-900">{entry.meal_type_label}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{entry.date}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-neutral-700">{entry.food_name}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{entry.quantity_gram} g</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-base font-black text-brand-600">{entry.calories.toFixed(0)}</span>
                          <span className="text-[10px] font-bold text-neutral-400 ml-1">kkal</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-2">
                            <MacroBadge label="P" value={entry.protein_g} color="bg-blue-50 text-blue-600 border-blue-100" />
                            <MacroBadge label="K" value={entry.carb_g} color="bg-amber-50 text-amber-600 border-amber-100" />
                            <MacroBadge label="L" value={entry.fat_g} color="bg-red-50 text-red-600 border-red-100" />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <button className="text-xs font-bold text-neutral-400 hover:text-brand-600 flex items-center gap-2 italic transition-colors group-hover:text-neutral-600">
                            <FiEdit3 className="h-3.5 w-3.5" /> Beri masukan...
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB PROGRESS */}
        {activeTab === "progress" && (
          <div className="space-y-8">
             <div className="grid md:grid-cols-2 gap-8">
               <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                 <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 px-8 py-5">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <FiUser className="text-brand-500" /> Foto Progress
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-12 flex items-center justify-center min-h-[350px]">
                    <EmptyState icon="📸" title="Belum ada foto" description="Klien belum mengunggah foto progress sebelum/sesudah." />
                 </CardContent>
               </Card>
               <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                 <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 px-8 py-5">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <FiStar className="text-yellow-500" /> Achievement
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-4">
                      <Achievement icon="🔥" label="7 Hari Streak" color="bg-orange-50 text-orange-700" />
                      <Achievement icon="⚖️" label="Turun 2kg" color="bg-emerald-50 text-emerald-700" />
                      <Achievement icon="🥗" label="Sayur Lover" color="bg-green-50 text-green-700" />
                      <Achievement icon="💧" label="Water Goal" color="bg-blue-50 text-blue-700" />
                    </div>
                 </CardContent>
               </Card>
             </div>
             
             <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
               <CardHeader className="px-8 pt-8">
                 <CardTitle className="text-lg font-bold">Histori Berat Badan Lengkap</CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                 <div className="h-[400px]">
                   <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                 </div>
               </CardContent>
             </Card>
          </div>
        )}

        {/* TAB CATATAN */}
        {activeTab === "notes" && (
          <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
            <Card className="border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100 px-8 py-5">
                <CardTitle className="text-lg font-bold">Catatan Konsultasi</CardTitle>
                <div className="flex gap-2">
                  <button title="Privat" className="p-2.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all"><FiLock size={20} /></button>
                  <button title="Share ke Klien" className="p-2.5 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><FiShare2 size={20} /></button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <textarea
                    id="nutritionist-note-textarea"
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    className="w-full min-h-[400px] p-6 bg-neutral-50 border border-neutral-200 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-base leading-relaxed transition-all resize-none"
                    placeholder="Tulis catatan perkembangan klien di sini..."
                    disabled={noteMutation.isPending}
                  />
                </div>
                <div className="flex justify-end items-center gap-4">
                  {noteSaved && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold animate-fade-in">
                      <FiCheck className="h-4 w-4" /> Tersimpan!
                    </span>
                  )}
                  <Button
                    id="save-note-btn"
                    onClick={() => noteMutation.mutate(noteValue)}
                    disabled={noteMutation.isPending}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-black px-10 py-7 rounded-2xl shadow-xl shadow-brand-100 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {noteMutation.isPending ? "Menyimpan..." : "Simpan Catatan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest px-2">Riwayat Catatan</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 bg-white border border-neutral-100 rounded-[24px] hover:border-brand-200 hover:shadow-lg hover:shadow-neutral-100 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">Sesi Konsultasi #{4-i}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Jan {i+1}, 2025</p>
                      </div>
                      <span className="p-1.5 bg-neutral-50 rounded-lg"><FiChevronRight className="text-neutral-400 group-hover:text-brand-500" /></span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">Klien mulai menunjukkan konsistensi dalam asupan protein harian. Perlu ditingkatkan asupan serat dari sayuran hijau...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CHAT */}
        {activeTab === "chat" && <ChatTab clientId={clientId} />}
      </div>

      {/* MOBILE ACTION BUTTONS */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-white p-3 rounded-[24px] shadow-2xl border border-neutral-100 flex gap-2 z-40">
        <Button variant="outline" className="flex-1 font-bold rounded-2xl border-neutral-200 py-6">
          <FiMessageSquare className="mr-2" /> Pesan
        </Button>
        <Button className="flex-1 bg-brand-500 text-white font-bold rounded-2xl py-6 shadow-lg shadow-brand-100">
          <FiVideo className="mr-2" /> Konsultasi
        </Button>
      </div>
    </div>
  );
}

function InfoItem({ label, value, color = "text-neutral-900" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-base font-black ${color}`}>{value}</p>
    </div>
  );
}

function MacroBadge({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${color}`}>
      {label} {value.toFixed(0)}g
    </div>
  );
}

function Achievement({ icon, label, color }: { icon: string, label: string, color: string }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border border-neutral-100 transition-all hover:scale-105 ${color}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

// FALLBACK DATA
function getFallbackClientDetail(clientId: number): NutritionistClientDetailResponse {
  return {
    client: {
      id: clientId,
      name: "Budi Santoso",
      avatar_url: `https://ui-avatars.com/api/?name=Budi+Santoso&background=random`,
      program: "Body Transformation",
      age: 28,
      height_cm: 175,
      target_weight_kg: 70,
      program_duration_days: 90,
    },
    progress: {
      initial_weight: 85.5,
      current_weight: 82.3,
      change_kg: -3.2,
      labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
      weights: [85.5, 84.2, 83.5, 82.3],
    },
    calculations: {
      bmi: 26.9,
      bmr: 1850,
      tdee: 2400,
      target_calories: 1900,
    },
    food_diary: [
      { id: 1, meal_type_label: "Sarapan", date: "Hari ini, 08:30", food_name: "Oatmeal dengan Pisang", quantity_gram: 250, calories: 320, protein_g: 12, carb_g: 54, fat_g: 6 },
      { id: 2, meal_type_label: "Makan Siang", date: "Hari ini, 12:45", food_name: "Dada Ayam Bakar & Nasi Merah", quantity_gram: 350, calories: 450, protein_g: 35, carb_g: 45, fat_g: 8 },
      { id: 3, meal_type_label: "Snack Sore", date: "Hari ini, 16:00", food_name: "Apel & Almond", quantity_gram: 150, calories: 180, protein_g: 4, carb_g: 22, fat_g: 10 },
    ],
  };
}

interface NutritionistClientDetailResponse {
  nutritionist_note?: string | null;
  client: {
    id: number;
    name: string;
    avatar_url: string;
    program: string;
    age: number;
    height_cm: number;
    target_weight_kg: number;
    program_duration_days: number;
  };
  progress: {
    initial_weight: number;
    current_weight: number;
    change_kg: number;
    labels: string[];
    weights: number[];
  };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
    target_calories: number;
  };
  food_diary: Array<{
    id: number;
    meal_type_label: string;
    date: string;
    food_name: string;
    quantity_gram: number;
    calories: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
  }>;
}
