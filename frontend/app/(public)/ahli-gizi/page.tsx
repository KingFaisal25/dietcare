"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  Users, 
  Briefcase, 
  CalendarCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  Award,
  Clock,
  CheckCircle2,
  X,
  SearchX,
  MessageCircle,
  ArrowRight,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TiltCard } from "@/components/ui/TiltCard";
import { buildApiUrl } from "@/lib/url";
import { getWaLink } from "@/lib/wa";

interface Nutritionist {
  id: number;
  name: string;
  slug: string;
  title: string | null;
  photo: string | null;
  specializations: string[] | null;
  years_experience: number;
  rating: number;
  review_count: number;
  active_clients: number;
  is_available: boolean;
  is_online: boolean;
}

export default function AhliGiziPage() {
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalActive, setTotalActive] = useState(0);

  const fetchNutritionists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialization) params.append("specialization", specialization);
      if (availableOnly) params.append("available", "true");

      const queryString = params.toString();
      const res = await fetch(`${buildApiUrl("/public/nutritionists")}${queryString ? `?${queryString}` : ""}`);
      const data = await res.json();
      setNutritionists(data.data?.items || []);
      setTotalActive(data.data?.total || 0);
    } catch (error) {
      console.error("Failed to fetch nutritionists:", error);
    } finally {
      // Simulate slightly longer loading for better UX with skeletons
      setTimeout(() => setLoading(false), 600);
    }
  }, [specialization, availableOnly]);

  useEffect(() => {
    fetchNutritionists();
  }, [fetchNutritionists]);

  const SPECIALIZATIONS = [
    "Penurunan BB",
    "Kenaikan BB",
    "Gizi Klinis",
    "Gizi Olahraga",
    "Gizi Ibu Hamil",
    "Gizi Anak",
    "PCOS",
    "Diabetes",
  ];

  const filteredNutritionists = useMemo(() => {
    if (!searchQuery) return nutritionists;
    const query = searchQuery.toLowerCase();
    return nutritionists.filter(
      (n) => 
        n.name.toLowerCase().includes(query) || 
        (n.title && n.title.toLowerCase().includes(query)) ||
        n.specializations?.some(s => s.toLowerCase().includes(query))
    );
  }, [nutritionists, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--background)] theme-transition">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50/50 dark:bg-primary-900/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-neutral-800 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-primary-700 dark:text-primary-400 shadow-sm border border-primary-100 dark:border-primary-900/30">
              <ShieldCheck className="w-4 h-4" /> Ahli Gizi Tersertifikasi STR
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.05]">
              Konsultasi dengan <br />
              <span className="text-primary-600 dark:text-primary-400 relative inline-block">
                Ahli Gizi Profesional
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Dapatkan pendampingan langsung dari tim ahli gizi terbaik kami untuk mencapai 
              target kesehatan Anda dengan cara yang aman dan berbasis sains.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-8 pt-4"
          >
            {[
              { icon: <Award className="w-5 h-5" />, label: "Lulusan Gizi Terbaik" },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: "Berpengalaman Klinis" },
              { icon: <Clock className="w-5 h-5" />, label: "Respon Cepat" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300 font-bold">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl shadow-sm border border-primary-100 dark:border-primary-900/30">
                  {item.icon}
                </div>
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER SECTION */}
      <section className="sticky top-20 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-y border-neutral-100 dark:border-neutral-800 shadow-sm py-5 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors" />
              <input 
                type="text"
                placeholder="Cari nama atau spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[1.5rem] focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 outline-none transition-all text-neutral-800 dark:text-neutral-200 font-bold placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] border font-black uppercase tracking-widest text-[11px] transition-all w-full lg:w-auto ${
                  isFilterOpen || specialization || availableOnly
                    ? "bg-primary-600 text-white border-primary-600 shadow-green" 
                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {(specialization || availableOnly) && (
                  <span className="ml-1 w-5 h-5 bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-[10px]">
                    {(specialization ? 1 : 0) + (availableOnly ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <div className="h-10 w-[1px] bg-neutral-100 dark:bg-neutral-700 mx-4" />
                <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mr-4">Quick Filter:</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                      availableOnly 
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800" 
                        : "bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-100 dark:border-neutral-700 hover:border-primary-200 dark:hover:border-primary-800"
                    }`}
                  >
                    Tersedia
                  </button>
                  {specialization && (
                    <button 
                      onClick={() => setSpecialization("")}
                      className="px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-primary-600 text-white border border-primary-600 flex items-center gap-2 shadow-green"
                    >
                      {specialization} <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-10 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.25em]">Status Ketersediaan</h4>
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={availableOnly}
                            onChange={(e) => setAvailableOnly(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-14 h-7 rounded-full transition-colors ${availableOnly ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                          <div className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-neutral-200 rounded-full transition-transform shadow-sm ${availableOnly ? 'translate-x-7' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Hanya yang tersedia</span>
                      </label>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                      <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.25em]">Pilih Spesialisasi</h4>
                      <div className="flex flex-wrap gap-3">
                        {SPECIALIZATIONS.map((spec) => (
                          <button
                            key={spec}
                            onClick={() => setSpecialization(specialization === spec ? "" : spec)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                              specialization === spec
                                ? "bg-primary-600 text-white border-primary-600 shadow-green"
                                : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-100 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px] hover:text-danger dark:hover:text-danger"
                      onClick={() => {
                        setSpecialization("");
                        setAvailableOnly(false);
                        setSearchQuery("");
                      }}
                    >
                      Reset Semua Filter
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. MAIN CONTENT (GRID) */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-neutral-800 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-700 p-10 space-y-8">
                  <div className="flex items-start gap-6">
                    <Skeleton className="w-24 h-24 rounded-[2rem] shrink-0" />
                    <div className="space-y-3 flex-1 pt-3">
                      <Skeleton className="h-7 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-1/2 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <Skeleton className="h-14 rounded-2xl" />
                    <Skeleton className="h-14 rounded-2xl" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-14 flex-1 rounded-[1.5rem]" />
                    <Skeleton className="h-14 flex-1 rounded-[1.5rem]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNutritionists.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-[4rem] p-20 border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-center">
              <EmptyState 
                icon={<SearchX className="w-20 h-20 text-neutral-300 dark:text-neutral-600 mx-auto" />}
                title="Pencarian Tidak Ditemukan"
                description="Maaf, kami tidak menemukan ahli gizi yang sesuai dengan kriteria Anda. Silakan coba kata kunci lain atau reset filter."
                action={{
                  label: "Reset Semua Filter",
                  onClick: () => {
                    setSpecialization("");
                    setAvailableOnly(false);
                    setSearchQuery("");
                  }
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div className="space-y-3">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">Expert Directory</h2>
                  <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">{totalActive} Ahli Gizi Tersedia</h3>
                </div>
                <div className="px-5 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-full border border-neutral-100 dark:border-neutral-700 text-[11px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Menampilkan {filteredNutritionists.length} hasil
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredNutritionists.map((nut, idx) => (
                  <motion.div
                    key={nut.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <TiltCard
                      className="bg-white dark:bg-neutral-800 rounded-[3rem] border border-neutral-100 dark:border-neutral-700 p-10 flex flex-col transition-all hover:shadow-float hover:border-primary-200 dark:hover:border-primary-800 relative overflow-hidden h-full"
                    >
                      {/* Background Accent */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50/50 dark:bg-primary-900/20 rounded-bl-[5rem] -mr-12 -mt-12 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors duration-spring" />

                      <div className="flex items-start gap-6 mb-10 relative z-10">
                        <div className="relative">
                          <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden ring-4 ring-white dark:ring-neutral-800 shadow-lg">
                            <Image 
                              src={nut.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nut.name)}&background=f0fdf4&color=1da271`} 
                              alt={nut.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-slow"
                            />
                          </div>
                          {nut.is_online && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-neutral-800 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {nut.name}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mt-2">{nut.title || 'Nutritionist'}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {nut.specializations?.slice(0, 2).map((spec) => (
                              <span key={spec} className="px-3 py-1 bg-primary-50/50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-100 dark:border-primary-900/30">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5 mb-10 flex-grow relative z-10">
                        <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-[1.5rem] p-5 border border-transparent group-hover:border-neutral-100 dark:group-hover:border-neutral-600 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="text-xl font-black text-neutral-900 dark:text-white">{nut.rating}</span>
                          </div>
                          <p className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{nut.review_count} Ulasan</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-[1.5rem] p-5 border border-transparent group-hover:border-neutral-100 dark:group-hover:border-neutral-600 transition-colors">
                          <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-white">
                            <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <span className="text-xl font-black">{nut.years_experience}thn</span>
                          </div>
                          <p className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Pengalaman</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-10 px-2 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${nut.is_available ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${nut.is_available ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {nut.is_available ? 'Jadwal Tersedia' : 'Kuota Penuh'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                          <Users className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{nut.active_clients} Klien</span>
                        </div>
                      </div>

                      <div className="flex gap-4 relative z-10">
                        <Link href={`/ahli-gizi/${nut.slug}`} className="flex-1">
                          <Button variant="secondary" className="w-full justify-center h-14 rounded-[1.25rem]">
                            Profil
                          </Button>
                        </Link>
                        {nut.is_available && (
                          <Link href={`/checkout?nutritionist_id=${nut.id}`} className="flex-1">
                            <Button className="w-full justify-center h-14 rounded-[1.25rem] group shadow-green">
                              Pilih <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. TRUST SECTION */}
      <section className="py-32 bg-neutral-50 dark:bg-neutral-800/50 px-6 border-t border-neutral-100 dark:border-neutral-700 rounded-[4rem] mx-4 lg:mx-10 mb-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-24">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400">Our Commitment</h2>
                <h3 className="text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
                  Kualitas & Keamanan <br /> Tanpa Kompromi
                </h3>
                <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                  DietCare memastikan setiap praktisi yang tergabung telah melewati proses audit dan verifikasi klinis yang ketat.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Verifikasi STR", desc: "Memiliki Surat Tanda Registrasi aktif dari Konsil Tenaga Kesehatan." },
                  { title: "Edukasi Berbasis Sains", desc: "Memberikan saran nutrisi yang terbukti secara ilmiah & aman." },
                  { title: "Review Asli", desc: "Ulasan 100% transparan dari klien yang telah menyelesaikan program." },
                  { title: "Pendampingan Intensif", desc: "Tidak hanya menu, tapi juga perubahan gaya hidup permanen." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-900 dark:text-white text-base mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
              <TiltCard className="bg-white dark:bg-neutral-800 rounded-[3.5rem] p-12 shadow-modal relative z-10 border border-white dark:border-neutral-700">
                <div className="flex items-center gap-8 mb-12">
                  <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-green">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Standard DietCare</h4>
                    <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Trusted since 2024</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Kepuasan Klien</span>
                      <span className="text-2xl font-black text-primary-600 dark:text-primary-400">98.5%</span>
                    </div>
                    <div className="h-4 bg-neutral-50 dark:bg-neutral-700 rounded-full overflow-hidden border border-neutral-100 dark:border-neutral-600 p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "98.5%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary-600 rounded-full shadow-[0_0_15px_rgba(29,162,113,0.4)]" 
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-3xl p-8 border border-slate-100 dark:border-neutral-600 relative">
                    <div className="absolute -top-4 left-8 text-4xl text-green-200 dark:text-green-900">"</div>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300 text-center italic relative z-10">
                      DietCare membantu saya memahami bahwa hidup sehat adalah investasi terbaik untuk masa depan.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA KONSULTASI */}
      <section className="mx-4 lg:mx-10 mb-20">
        <div className="relative overflow-hidden rounded-[4rem] bg-primary-600 py-24 px-6 text-center shadow-2xl shadow-primary-100 dark:shadow-primary-900/50">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-[120px]" />
          
          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 mb-10">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white sm:text-6xl tracking-tight leading-[1.1]">
              Masih Bingung Memilih <br /> Ahli Gizi yang Tepat?
            </h2>
            <p className="mx-auto mt-8 text-xl font-medium text-white/80 leading-relaxed max-w-2xl">
              Hubungi admin kami untuk mendapatkan rekomendasi ahli gizi yang paling sesuai dengan kondisi dan target Anda.
            </p>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href={getWaLink("Halo, saya ingin bantuan memilih ahli gizi yang tepat di DietCare.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="white" size="lg" className="h-16 px-12 text-lg shadow-xl hover:scale-105 transition-all">
                  <Phone className="mr-3 h-6 w-6 text-primary-600" />
                  Chat Admin WhatsApp
                </Button>
              </a>
              <Link href="/program">
                <Button variant="outline" size="lg" className="h-16 px-12 text-lg border-white/30 text-white hover:bg-white/10">
                  Lihat Semua Program <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

