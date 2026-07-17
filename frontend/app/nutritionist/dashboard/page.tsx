"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiStar,
  FiSearch,
  FiPlus,
  FiChevronRight,
  FiBell,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SkeletonCard, SkeletonListItem } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/lib/api";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { TiltCard } from "@/components/ui/TiltCard";

export default function NutritionistDashboardPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const { data, isLoading } = useQuery<NutritionistDashboardResponse>({
    queryKey: ["nutritionist-dashboard"],
    queryFn: async () => {
      try {
        const response = await api.get("/nutritionist/dashboard");
        return response.data.data as NutritionistDashboardResponse;
      } catch {
        return getFallbackNutritionistDashboard();
      }
    },
  });

  const dashboard = useMemo(() => data ?? getFallbackNutritionistDashboard(), [data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-5 w-48 bg-slate-50 animate-pulse rounded-xl" />
          </div>
          <div className="h-14 w-40 bg-slate-100 animate-pulse rounded-[1.25rem]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid gap-8 xl:grid-cols-[1.65fr,1fr]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-7 w-40 bg-slate-100 animate-pulse rounded-xl" />
              <div className="h-12 w-64 bg-slate-50 animate-pulse rounded-[1.25rem]" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <SkeletonListItem key={i} />)}
            </div>
          </div>
          <div className="h-[500px] bg-slate-50 animate-pulse rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 overflow-hidden relative">
      <Scene3DBackground subtle />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
              Professional Dashboard
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Selamat datang, <span className="text-green-600">Ahli Gizi!</span> 👋
            </h1>
            <p className="text-slate-500 font-medium">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
            </p>
          </div>
          <Link href="/nutritionist/schedule">
            <Button className="h-16 px-10 rounded-[1.25rem] bg-green-600 hover:bg-green-700 font-black text-sm shadow-2xl shadow-green-900/20 border-none flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <FiPlus size={20} />
              </div>
              Kelola Jadwal
            </Button>
          </Link>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Klien Aktif" value={dashboard?.stats?.total_active_clients ?? 0} icon={<FiUsers size={24} />} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Konsultasi Hari Ini" value={dashboard?.stats?.consultations_today ?? 0} icon={<FiCalendar size={24} />} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Menunggu Review" value={dashboard?.notifications?.meal_plan_pending?.count ?? 0} icon={<FiClock size={24} />} color="text-orange-600" bg="bg-orange-50" />
          <StatCard label="Rating Rata-rata" value={dashboard?.stats?.average_rating?.toFixed(1) || "-"} suffix="/5" icon={<FiStar size={24} />} color="text-amber-500" bg="bg-amber-50" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.65fr,1fr]">
          
          {/* LEFT: CLIENT MANAGEMENT */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <h2 className="text-2xl font-black text-slate-900">Daftar Klien Aktif</h2>
              <div className="relative w-full sm:w-80 group">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari klien berdasarkan nama..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {["Semua", "Aktif", "Perlu Perhatian", "Selesai"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border ${
                    activeTab === tab
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                      : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Client List */}
            <div className="space-y-6">
              {(dashboard?.clients || []).length > 0 ? (
                (dashboard?.clients || []).map((client) => (
                  <Link
                    key={client.id}
                    href={`/nutritionist/clients/${client.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        {/* Profile Info */}
                        <div className="flex items-center gap-5 min-w-[280px]">
                          <div className="relative h-20 w-20 rounded-[1.5rem] overflow-hidden border-2 border-slate-50 group-hover:border-green-100 transition-colors">
                            <Image src={client.avatar_url} alt={client.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{client.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{client.program}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-grow space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                            <span className="text-slate-400">Progress Program</span>
                            <span className="text-green-600">85%</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <div className="h-full bg-green-500 rounded-full w-[85%] transition-all duration-1000" />
                          </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[320px]">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kepatuhan Diet</p>
                            <p className="text-lg font-black text-slate-900">Optimal <span className="text-green-500">✓</span></p>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            client.status === 'on-track' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {client.status === 'on-track' ? (
                              <><FiCheckCircle /> On Track</>
                            ) : (
                              <><FiAlertCircle /> Needs Review</>
                            )}
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <FiChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState icon="👥" title="Belum ada klien" description="Klien Anda akan muncul di sini setelah mendaftar program." />
              )}
            </div>
          </div>

          {/* RIGHT: SCHEDULE & NOTIFICATIONS */}
          <div className="space-y-10">
            
            {/* Schedule Card */}
            <TiltCard>
              <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <FiCalendar className="text-green-600" /> Jadwal Konsultasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="relative space-y-12 before:absolute before:left-[11px] before:top-0 before:h-full before:w-0.5 before:bg-slate-100">
                    {[
                      { time: "09:00", name: "Budi Santoso", dur: "30m", status: "Selesai" },
                      { time: "11:30", name: "Siti Aminah", dur: "45m", status: "Sedang Berjalan" },
                      { time: "14:00", name: "Rizky Pratama", dur: "30m", status: "Mendatang" },
                    ].map((item, idx) => (
                      <div key={idx} className="relative flex gap-8 items-start">
                        <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100 ${
                          item.status === 'Selesai' ? 'bg-slate-200' : 
                          item.status === 'Sedang Berjalan' ? 'bg-green-500 animate-pulse' : 'bg-white'
                        }`} />
                        <div className="flex-1 pl-10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-black text-slate-900">{item.time}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                              item.status === 'Selesai' ? 'bg-slate-100 text-slate-400' :
                              item.status === 'Sedang Berjalan' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-600'
                            }`}>{item.status}</span>
                          </div>
                          <p className="text-lg font-bold text-slate-700">{item.name}</p>
                          <p className="text-xs font-medium text-slate-400">Durasi Sesi: {item.dur}</p>
                          {(item.status === 'Sedang Berjalan') && (
                            <Button className="mt-6 w-full h-12 rounded-xl bg-green-600 text-white font-black text-xs shadow-lg shadow-green-900/20">Mulai Sesi Video</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TiltCard>

            {/* Message Center */}
            <TiltCard>
              <Card className="bg-white border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-3">
                    <FiMessageSquare className="text-blue-600" /> Pesan Terbaru
                  </CardTitle>
                  <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-900/20">3 Pesan</span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {(dashboard?.notifications?.unreplied_messages?.items || []).slice(0, 3).map((msg, i) => (
                      <div key={i} className="p-8 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-black text-slate-900 group-hover:text-green-600 transition-colors">{msg.name}</p>
                          <span className="text-[10px] font-bold text-slate-300">{msg.time || '10m lalu'}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium line-clamp-1 leading-relaxed">{msg.preview || 'Halo ahli gizi, saya mau tanya soal...'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-50 text-center">
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-600 transition-colors">Lihat Semua Pesan</button>
                  </div>
                </CardContent>
              </Card>
            </TiltCard>

          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, suffix }: { label: string, value: string | number, icon: React.ReactNode, color: string, bg: string, suffix?: string }) {
  return (
    <TiltCard className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{value}</span>
          {suffix && <span className="text-sm font-bold text-slate-400">{suffix}</span>}
        </div>
      </div>
      <div className={`absolute top-8 right-8 p-4 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110 duration-500`}>
        {icon}
      </div>
    </TiltCard>
  );
}

// FALLBACK DATA
function getFallbackNutritionistDashboard(): NutritionistDashboardResponse {
  return {
    stats: {
      total_active_clients: 24,
      consultations_today: 8,
      average_rating: 4.8,
    },
    clients: [
      { id: 1, name: "Budi Santoso", avatar_url: "https://ui-avatars.com/api/?name=Budi+Santoso&background=f0fdf4&color=16a34a&bold=true", program: "Body Transformation", status: "on-track" },
      { id: 2, name: "Siti Aminah", avatar_url: "https://ui-avatars.com/api/?name=Siti+Aminah&background=f0fdf4&color=16a34a&bold=true", program: "Weight Loss", status: "perlu perhatian" },
      { id: 3, name: "Rizky Pratama", avatar_url: "https://ui-avatars.com/api/?name=Rizky+Pratama&background=f0fdf4&color=16a34a&bold=true", program: "Muscle Building", status: "on-track" },
    ],
    notifications: {
      meal_plan_pending: { count: 5 },
      unreplied_messages: { 
        count: 3,
        items: [
          { name: "Budi Santoso", preview: "Halo dok, saya mau tanya soal menu makan malam...", time: "5m lalu" },
          { name: "Siti Aminah", preview: "Berat badan saya kok belum turun ya?", time: "15m lalu" },
          { name: "Rizky Pratama", preview: "Terima kasih sarannya dok!", time: "1 jam lalu" },
        ]
      }
    }
  };
}

interface NutritionistDashboardResponse {
  stats: {
    total_active_clients: number;
    consultations_today: number;
    average_rating: number;
  };
  clients: Array<NutritionistClientSummary>;
  notifications: {
    meal_plan_pending: { count: number };
    unreplied_messages: { 
      count: number;
      items: Array<{ name: string; preview: string; time: string }>;
    };
  };
}

interface NutritionistClientSummary {
  id: number;
  name: string;
  avatar_url: string;
  program: string;
  status: "on-track" | "perlu perhatian";
}
