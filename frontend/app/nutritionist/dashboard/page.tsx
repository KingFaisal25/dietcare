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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-100 animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-neutral-100 animate-pulse rounded-lg" />
          </div>
          <div className="h-12 w-40 bg-neutral-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-8 xl:grid-cols-[1.65fr,1fr]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-neutral-100 animate-pulse rounded-lg" />
              <div className="h-10 w-64 bg-neutral-100 animate-pulse rounded-xl" />
            </div>
            <div className="space-y-4">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-[400px] bg-neutral-50 animate-pulse rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      <Scene3DBackground subtle />
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Selamat pagi, Ahli Gizi! 👋</h1>
          <p className="text-sm text-gray-400 font-medium">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
          </p>
        </div>
        <Link href="/nutritionist/schedule">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/25 hover:shadow-xl text-white font-bold gap-2 rounded-xl px-6 py-6 border-none">
            <FiPlus className="h-5 w-5" />
            Tambah Jadwal
          </Button>
        </Link>
      </div>

      {/* STATS ROW */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative z-10">
        <StatCard label="Total Klien Aktif" value={dashboard.stats.total_active_clients} icon={<FiUsers className="h-6 w-6" />} color="bg-blue-500/15 text-blue-400" />
        <StatCard label="Konsultasi Hari Ini" value={dashboard.stats.consultations_today} icon={<FiCalendar className="h-6 w-6" />} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard label="Menunggu Review" value={dashboard.notifications.meal_plan_pending.count} icon={<FiClock className="h-6 w-6" />} color="bg-amber-500/15 text-amber-400" />
        <StatCard label="Rating Rata-rata" value={dashboard.stats.average_rating?.toFixed(1) || "-"} suffix="/5" icon={<FiStar className="h-6 w-6" />} color="bg-yellow-500/15 text-yellow-400" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.65fr,1fr] relative z-10">
        {/* KIRI: DAFTAR KLIEN */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-white">Daftar Klien Aktif</h2>
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari klien..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-900 border border-white/[0.06] rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {["Semua", "Aktif", "Perlu Perhatian", "Selesai"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeTab === tab
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-gray-900 text-gray-500 hover:bg-gray-800 border-white/[0.06]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {dashboard.clients.length > 0 ? (
              dashboard.clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/nutritionist/clients/${client.id}`}
                  className="block glass-panel rounded-2xl border border-white/[0.1] p-5 transition-all hover:shadow-xl hover:shadow-black/20 hover:border-emerald-500/30 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[220px]">
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden ring-4 ring-neutral-50 group-hover:ring-brand-50 transition-all shrink-0">
                        <Image src={client.avatar_url} alt={client.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{client.name}</h3>
                        <p className="text-xs font-medium text-gray-400">{client.program}</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                        <span className="text-gray-500 uppercase tracking-wider">Target Minggu Ini</span>
                        <span className="text-emerald-400">85%</span>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[85%] transition-all duration-1000" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:min-w-[320px] justify-end">
                      <div className="text-right mr-4 hidden sm:block">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Avg. Kalori</p>
                        <p className="text-sm font-black text-neutral-300">1,650 <span className="text-[10px] font-bold text-neutral-500">kkal</span></p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        client.status === 'on-track' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {client.status === 'on-track' ? (
                          <><span>✓</span> Diary lengkap</>
                        ) : (
                          <><span>⚠️</span> 2 hari tidak log</>
                        )}
                      </span>
                      <Button variant="ghost" size="sm" className="text-emerald-400 font-bold hover:bg-emerald-500/10 rounded-xl px-4">
                        Lihat Detail <FiChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState 
                icon="👥" 
                title="Belum ada klien" 
                description="Klien yang terdaftar di program Anda akan muncul di sini." 
              />
            )}
            
            {/* Pagination Placeholder */}
            <div className="flex justify-center pt-4">
               <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <button key={i} className={`h-10 w-10 rounded-xl font-bold text-sm transition-all ${i === 1 ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' : 'bg-white text-neutral-500 border border-neutral-100 hover:bg-neutral-50'}`}>{i}</button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* KANAN: JADWAL & NOTIFIKASI */}
        <div className="space-y-8">
          <TiltCard className="rounded-[32px] overflow-hidden">
          <Card className="border-white/[0.08] glass-panel rounded-[32px] overflow-hidden shadow-sm">
            <CardHeader className="bg-gray-800/50 border-b border-white/[0.06] px-6 py-5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FiCalendar className="text-emerald-400" /> Jadwal Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative space-y-10 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-neutral-100">
                {[
                  { time: "09:00", name: "Budi Santoso", dur: "30m", status: "Selesai" },
                  { time: "11:30", name: "Siti Aminah", dur: "45m", status: "Berlangsung" },
                  { time: "14:00", name: "Rizky Pratama", dur: "30m", status: "Mendatang" },
                ].map((item, idx) => (
                  <div key={idx} className="relative flex gap-6 items-start pl-10">
                    <div className={`absolute left-3 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ring-2 ${
                      item.status === 'Selesai' ? 'bg-neutral-300 ring-neutral-100' : 
                      item.status === 'Berlangsung' ? 'bg-brand-500 ring-brand-100 animate-pulse' : 'bg-white ring-brand-200'
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-black text-white">{item.time}</span>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          item.status === 'Selesai' ? 'bg-gray-700 text-gray-400' :
                          item.status === 'Berlangsung' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>{item.status}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-300">{item.name}</p>
                      <p className="text-xs text-gray-600">Durasi: {item.dur}</p>
                      {(item.status === 'Mendatang' && idx === 2) && (
                        <Button size="sm" className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-100">Mulai Sesi</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </TiltCard>

          <TiltCard className="rounded-[32px] overflow-hidden">
          <Card className="border-white/[0.08] glass-panel rounded-[32px] overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FiMessageSquare className="text-blue-400" /> Pesan Masuk
              </CardTitle>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.06]">
                {dashboard.notifications.unreplied_messages.items.slice(0, 3).map((msg, i) => (
                  <div key={i} className="p-5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{msg.name}</p>
                      <span className="text-[10px] text-gray-600">{msg.time || '10m lalu'}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{msg.preview || 'Halo dok, saya mau tanya...'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </TiltCard>

          <TiltCard className="rounded-[32px] overflow-hidden">
          <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none shadow-xl shadow-brand-100 rounded-[32px]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl"><FiBell className="h-5 w-5" /></div>
                <h3 className="font-bold text-lg">Reminder</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="text-sm font-bold">Budi Santoso</p>
                    <p className="text-xs text-white/80">Milestone 5kg turun!</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                  <span className="text-xl">🎂</span>
                  <div>
                    <p className="text-sm font-bold">Siti Aminah</p>
                    <p className="text-xs text-white/80">Ulang tahun besok!</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, suffix }: { label: string, value: string | number, icon: React.ReactNode, color: string, suffix?: string }) {
  return (
    <div className="glass-panel border border-white/[0.1] rounded-[28px] shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all group overflow-hidden relative p-7 flex items-start justify-between">
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">{value}</span>
          {suffix && <span className="text-sm font-bold text-gray-500">{suffix}</span>}
        </div>
      </div>
      <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 duration-500 ${color}`}>
        {icon}
      </div>
    </div>
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
      { id: 1, name: "Budi Santoso", avatar_url: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random", program: "Body Transformation", status: "on-track" },
      { id: 2, name: "Siti Aminah", avatar_url: "https://ui-avatars.com/api/?name=Siti+Aminah&background=random", program: "Weight Loss", status: "perlu perhatian" },
      { id: 3, name: "Rizky Pratama", avatar_url: "https://ui-avatars.com/api/?name=Rizky+Pratama&background=random", program: "Muscle Building", status: "on-track" },
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
