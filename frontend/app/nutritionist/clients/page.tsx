"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiUsers,
  FiSearch,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/lib/api";
import { Scene3DBackground } from "@/components/ui/Scene3DBackground";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  NutritionistDashboardResponse,
  getFallbackNutritionistDashboard,
} from "@/lib/nutritionistData";

export default function NutritionistClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attention" | "on-track" | "no-meal-plan">("all");

  const { data, isLoading } = useQuery<NutritionistDashboardResponse>({
    queryKey: ["nutritionist-clients"],
    queryFn: async () => {
      try {
        const response = await api.get("/nutritionist/clients");
        return response.data.data as NutritionistDashboardResponse;
      } catch {
        return getFallbackNutritionistDashboard();
      }
    },
  });

  const dashboard = useMemo(() => data ?? getFallbackNutritionistDashboard(), [data]);

  // Filter clients based on search term and selected filter status
  const filteredClients = useMemo(() => {
    const clients = dashboard?.clients || [];
    return clients.filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.program.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === "attention") {
        matchesStatus = client.status === "perlu perhatian";
      } else if (statusFilter === "on-track") {
        matchesStatus = client.status === "on-track";
      } else if (statusFilter === "no-meal-plan") {
        matchesStatus = !client.has_meal_plan_today;
      }

      return matchesSearch && matchesStatus;
    });
  }, [dashboard, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-5 w-48 bg-slate-50 animate-pulse rounded-xl" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalClients = dashboard?.clients?.length ?? 0;
  const needsAttentionCount = dashboard?.clients?.filter(c => c.status === "perlu perhatian")?.length ?? 0;
  const noMealPlanCount = dashboard?.clients?.filter(c => !c.has_meal_plan_today)?.length ?? 0;
  const onTrackCount = totalClients - needsAttentionCount;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 overflow-hidden relative">
      <Scene3DBackground subtle />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
              Client Management
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Manajemen <span className="text-green-600">Klien</span> 👥
            </h1>
            <p className="text-slate-500 font-medium">
              Pantau kepatuhan diet, perkembangan berat badan, dan kelola meal plan klien Anda.
            </p>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Klien Aktif</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{totalClients}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className="p-4 rounded-2xl bg-orange-50 text-orange-600">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perlu Perhatian</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{needsAttentionCount}</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 animate-pulse">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Ada Meal Plan</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{noMealPlanCount} Klien</h3>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className="p-4 rounded-2xl bg-green-50 text-green-600">
              <FiCheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klien On Track</p>
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{onTrackCount}</h3>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="relative w-full lg:w-96 group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Cari klien berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:font-medium placeholder:text-slate-300"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full lg:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter("attention")}
              className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border ${
                statusFilter === "attention"
                  ? "bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-100"
                  : "bg-white text-orange-600 border-slate-100 hover:bg-orange-50"
              }`}
            >
              Perlu Perhatian ({needsAttentionCount})
            </button>
            <button
              onClick={() => setStatusFilter("on-track")}
              className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border ${
                statusFilter === "on-track"
                  ? "bg-green-600 text-white border-green-600 shadow-xl shadow-green-100"
                  : "bg-white text-green-600 border-slate-100 hover:bg-green-50"
              }`}
            >
              On Track
            </button>
            <button
              onClick={() => setStatusFilter("no-meal-plan")}
              className={`px-6 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all border ${
                statusFilter === "no-meal-plan"
                  ? "bg-red-500 text-white border-red-500 shadow-xl shadow-red-100"
                  : "bg-white text-red-600 border-slate-100 hover:bg-red-50"
              }`}
            >
              Belum Ada Meal Plan ({noMealPlanCount})
            </button>
          </div>
        </div>

        {/* CLIENTS LIST */}
        <div className="space-y-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const progressPercentage = Math.round((client.current_day / client.program_duration_days) * 100);
              
              return (
                <Link
                  key={client.id}
                  href={`/nutritionist/clients/${client.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Profile Info */}
                      <div className="flex items-center gap-5 min-w-[280px]">
                        <div className="relative h-20 w-20 rounded-[1.5rem] overflow-hidden border border-slate-50 group-hover:border-green-100 transition-colors flex-shrink-0">
                          <Image
                            src={client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=e8f8f0&color=0d6e42`}
                            alt={client.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{client.name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{client.program}</p>
                        </div>
                      </div>

                      {/* Weight progress badges */}
                      <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100/50 min-w-[200px]">
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Berat</p>
                          <p className="text-sm font-black text-slate-800">{client.current_weight} kg</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Perubahan</p>
                          <div className={`flex items-center gap-0.5 text-xs font-black ${
                            client.weight_change < 0 
                              ? 'text-green-600' 
                              : client.weight_change > 0 
                                ? 'text-blue-600' 
                                : 'text-slate-600'
                          }`}>
                            {client.weight_change < 0 ? (
                              <><FiTrendingDown size={12} /> {client.weight_change} kg</>
                            ) : client.weight_change > 0 ? (
                              <><FiTrendingUp size={12} /> +{client.weight_change} kg</>
                            ) : (
                              <>0.0 kg</>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-grow space-y-2 min-w-[150px]">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                          <span className="text-slate-400">Hari ke-{client.current_day} dari {client.program_duration_days}</span>
                          <span className="text-green-600">{progressPercentage}%</span>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions & Status */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[320px]">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meal Plan Hari Ini</p>
                          <p className={`text-sm font-black ${client.has_meal_plan_today ? 'text-slate-900' : 'text-red-500'}`}>
                            {client.has_meal_plan_today ? "Sudah Diatur ✓" : "Belum Diatur ⚠"}
                          </p>
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
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-green-600 group-hover:text-white transition-all flex-shrink-0">
                          <FiChevronRight size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Warning detail if status is attention */}
                    {client.status === 'perlu perhatian' && client.needs_attention_reason && (
                      <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-medium text-orange-800 leading-relaxed flex gap-2">
                        <FiAlertCircle className="flex-shrink-0 mt-0.5 text-orange-600" size={14} />
                        <span>{client.needs_attention_reason}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptyState
              icon="👥"
              title="Klien tidak ditemukan"
              description="Cari kata kunci lain atau bersihkan filter pencarian."
            />
          )}
        </div>
      </div>
    </div>
  );
}
