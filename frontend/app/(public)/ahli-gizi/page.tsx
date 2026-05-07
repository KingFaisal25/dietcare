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
  SearchX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildApiUrl } from "@/lib/url";

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
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden px-6">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'radial-gradient(#16a361 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Badge variant="success" className="py-1.5 px-4 bg-brand-50 text-brand-600 border border-brand-100 mb-2">
              <ShieldCheck className="w-4 h-4 mr-2" /> Ahli Gizi Tersertifikasi STR
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1]">
              Konsultasi dengan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
                Ahli Gizi Profesional
              </span>
            </h1>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Dapatkan pendampingan langsung dari tim ahli gizi terbaik kami untuk mencapai 
              target kesehatan Anda dengan cara yang aman dan berbasis sains.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            {[
              { icon: <Award className="w-5 h-5" />, label: "Lulusan Gizi Terbaik" },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: "Berpengalaman Klinis" },
              { icon: <Clock className="w-5 h-5" />, label: "Respon Cepat" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-neutral-600 font-medium">
                <div className="p-1.5 bg-brand-100 text-brand-600 rounded-full">
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER SECTION */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-y border-neutral-100 shadow-sm py-4 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input 
                type="text"
                placeholder="Cari nama atau spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-neutral-700 font-medium"
              />
            </div>

            {/* Filter Toggle (Mobile) & Options (Desktop) */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border font-bold transition-all w-full lg:w-auto ${
                  isFilterOpen || specialization || availableOnly
                    ? "bg-brand-500 text-white border-brand-500" 
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-brand-500"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filter</span>
                {(specialization || availableOnly) && (
                  <span className="ml-1 w-5 h-5 bg-white text-brand-600 rounded-full flex items-center justify-center text-[10px]">
                    {(specialization ? 1 : 0) + (availableOnly ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <div className="h-8 w-[1px] bg-neutral-200 mx-2" />
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mr-2">Cepat:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      availableOnly 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-white text-neutral-500 border-neutral-100 hover:border-emerald-200"
                    }`}
                  >
                    Tersedia
                  </button>
                  {specialization && (
                    <button 
                      onClick={() => setSpecialization("")}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-50 text-brand-700 border border-brand-100 flex items-center gap-2"
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
                <div className="py-6 mt-4 border-t border-neutral-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Status</h4>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={availableOnly}
                            onChange={(e) => setAvailableOnly(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${availableOnly ? 'bg-brand-500' : 'bg-neutral-200'}`} />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${availableOnly ? 'translate-x-6' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-neutral-700">Hanya yang tersedia</span>
                      </label>
                    </div>

                    <div className="lg:col-span-3 space-y-3">
                      <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Spesialisasi</h4>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map((spec) => (
                          <button
                            key={spec}
                            onClick={() => setSpecialization(specialization === spec ? "" : spec)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                              specialization === spec
                                ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-100"
                                : "bg-white text-neutral-600 border-neutral-100 hover:border-brand-500 hover:text-brand-600"
                            }`}
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-neutral-500 font-bold"
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
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-neutral-100 p-8 space-y-6">
                  <div className="flex items-start gap-5">
                    <Skeleton className="w-20 h-20 rounded-3xl shrink-0" />
                    <div className="space-y-2 flex-1 pt-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-2xl" />
                    <Skeleton className="h-12 flex-1 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNutritionists.length === 0 ? (
            <div className="bg-neutral-50 rounded-[3rem] p-16 border-2 border-dashed border-neutral-200">
              <EmptyState 
                icon={<SearchX className="w-16 h-16 text-neutral-300" />}
                title="Tidak Ada Hasil"
                description="Maaf, kami tidak menemukan ahli gizi yang sesuai dengan filter atau pencarian Anda. Coba reset filter untuk melihat semua tim kami."
                action={{
                  label: "Reset Pencarian",
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
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-600 mb-2">Tim Kami</h2>
                  <h3 className="text-3xl font-black text-neutral-900">{totalActive} Ahli Gizi Berpengalaman</h3>
                </div>
                <p className="text-sm font-bold text-neutral-400 mb-1">
                  Menampilkan {filteredNutritionists.length} hasil
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNutritionists.map((nut, idx) => (
                  <motion.div
                    key={nut.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-[2rem] border border-neutral-100 p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-brand-100/50 hover:border-brand-200 relative overflow-hidden"
                  >
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[4rem] -mr-10 -mt-10 group-hover:bg-brand-100 transition-colors" />

                    <div className="flex items-start gap-5 mb-8 relative z-10">
                      <div className="relative">
                        <div className="relative w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-neutral-50 group-hover:ring-brand-50 transition-all shadow-lg">
                          <Image 
                            src={nut.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nut.name)}&background=e8f8f0&color=0d6e42`} 
                            alt={nut.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {nut.is_online && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-black text-neutral-900 leading-tight group-hover:text-brand-600 transition-colors">
                          {nut.name}{nut.title ? `, ${nut.title}` : ''}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {nut.specializations?.slice(0, 2).map((spec) => (
                            <span key={spec} className="px-3 py-1 bg-neutral-50 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-neutral-100 group-hover:bg-white transition-colors">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 flex-grow relative z-10">
                      <div className="bg-neutral-50 rounded-2xl p-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-neutral-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-lg font-black text-neutral-900">{nut.rating}</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{nut.review_count} Ulasan</p>
                      </div>
                      <div className="bg-neutral-50 rounded-2xl p-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-neutral-100">
                        <div className="flex items-center gap-2 mb-1 text-neutral-900">
                          <Briefcase className="w-4 h-4 text-brand-500" />
                          <span className="text-lg font-black">{nut.years_experience}thn</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pengalaman</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-8 px-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${nut.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${nut.is_available ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {nut.is_available ? 'Jadwal Tersedia' : 'Kuota Penuh'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold">{nut.active_clients} Klien</span>
                      </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                      <Link href={`/ahli-gizi/${nut.slug}`} className="flex-1">
                        <Button variant="ghost" className="w-full justify-center font-bold rounded-2xl border-2 border-neutral-100 hover:border-brand-500 text-neutral-600 hover:text-brand-600 h-12">
                          Profil
                        </Button>
                      </Link>
                      {nut.is_available && (
                        <Link href={`/checkout?nutritionist_id=${nut.id}`} className="flex-1">
                          <Button className="w-full justify-center font-bold rounded-2xl bg-brand-500 hover:bg-brand-600 text-white h-12 shadow-lg shadow-brand-100 group-hover:shadow-brand-200 transition-all">
                            Pilih <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. TRUST SECTION */}
      <section className="py-24 bg-surface-50 px-6 border-t border-neutral-100">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-600">Komitmen Kami</h2>
                <h3 className="text-4xl font-black text-neutral-900 leading-tight">
                  Kualitas & Keamanan <br /> Adalah Prioritas
                </h3>
                <p className="text-lg text-neutral-500 leading-relaxed">
                  Kami memastikan setiap ahli gizi yang tergabung dalam platform DietCare 
                  telah melewati proses verifikasi ketat untuk menjamin hasil terbaik bagi Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Verifikasi STR", desc: "Memiliki Surat Tanda Registrasi aktif dari Konsil Tenaga Kesehatan." },
                  { title: "Edukasi Berbasis Sains", desc: "Memberikan saran nutrisi yang terbukti secara ilmiah & aman." },
                  { title: "Review Asli", desc: "Ulasan 100% transparan dari klien yang telah menyelesaikan program." },
                  { title: "Pendampingan Intensif", desc: "Tidak hanya menu, tapi juga perubahan gaya hidup permanen." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[3rem] p-8 border border-neutral-100 shadow-modal relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-neutral-900">Standard DietCare</h4>
                    <p className="text-sm font-bold text-neutral-400">Terpercaya sejak 2024</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-neutral-500">Kepuasan Klien</span>
                    <span className="text-brand-600">98.5%</span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "98.5%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-brand-500 rounded-full" 
                    />
                  </div>
                  <p className="text-xs text-neutral-400 text-center italic">
                    "DietCare membantu saya memahami bahwa diet sehat tidak harus menyiksa."
                  </p>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-dashed border-brand-200 rounded-full animate-spin-slow opacity-30" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

