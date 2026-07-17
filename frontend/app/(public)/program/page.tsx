"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Check,
  Filter,
  ArrowUpDown,
  MessageCircle,
  Star,
  Users,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Phone
} from "lucide-react";
import { WaButton } from "@/components/ui/WaButton";
import { motion } from "framer-motion";

// Program types
type Target = "weight-loss" | "muscle-gain" | "pregnancy" | "medical";
type Duration = "14" | "30" | "60";

interface Program {
  id: number;
  name: string;
  slug: string;
  price: number;
  duration: Duration;
  target: Target;
  description: string;
  features: string[];
  isPopular: boolean;
  icon: string;
}

const programs: Program[] = [
  {
    id: 1,
    name: "Body Goals",
    slug: "body-goals",
    price: 299000,
    duration: "30",
    target: "weight-loss",
    description: "Program penurunan berat badan berbasis sains dengan meal plan personal dan dukungan ahli gizi.",
    features: [
      "Konsultasi awal 1x video call",
      "Meal Plan 30 hari personal",
      "Chat support 3 hari/minggu",
      "Evaluasi progress mingguan",
      "Akses komunitas DietCare"
    ],
    isPopular: false,
    icon: "🎯",
  },
  {
    id: 2,
    name: "Body Goals Intensif",
    slug: "body-goals-intensif",
    price: 499000,
    duration: "30",
    target: "weight-loss",
    description: "Program intensif dengan dukungan penuh untuk mencapai target berat badan Anda lebih cepat.",
    features: [
      "Konsultasi video call 4x/minggu",
      "Meal Plan 30 hari + penyesuaian",
      "Chat support setiap hari",
      "Progress tracking detail",
      "Workout plan simple",
      "Akses komunitas + materi exclusive"
    ],
    isPopular: true,
    icon: "⚡",
  },
  {
    id: 3,
    name: "Body for Baby",
    slug: "body-for-baby",
    price: 399000,
    duration: "30",
    target: "pregnancy",
    description: "Program nutrisi khusus untuk ibu hamil dan menyusui, fokus pada kesehatan ibu dan janin.",
    features: [
      "Konsultasi ahli gizi spesialis kehamilan",
      "Meal plan sesuai trimester",
      "Panduan nutrisi kehamilan",
      "Chat support 5 hari/minggu",
      "Evaluasi rutin"
    ],
    isPopular: false,
    icon: "🤰",
  },
  {
    id: 4,
    name: "Clinicare",
    slug: "clinicare",
    price: 699000,
    duration: "30",
    target: "medical",
    description: "Program diet terapeutik untuk kondisi medis seperti diabetes, hipertensi, atau GERD.",
    features: [
      "Konsultasi dengan ahli gizi klinis",
      "Meal plan sesuai kondisi medis",
      "Dukungan intensif 24/7",
      "Monitoring ketat bersama dokter",
      "Rekomendasi gaya hidup"
    ],
    isPopular: false,
    icon: "🏥",
  },
  {
    id: 5,
    name: "Muscle Gain",
    slug: "muscle-gain",
    price: 349000,
    duration: "30",
    target: "muscle-gain",
    description: "Program untuk menambah massa otot dengan nutrisi yang tepat dan guidance olahraga.",
    features: [
      "Konsultasi untuk setting target",
      "Meal plan bulking optimal",
      "Guidance workout sederhana",
      "Chat support 3 hari/minggu",
      "Progress tracking bulanan"
    ],
    isPopular: false,
    icon: "💪",
  },
  {
    id: 6,
    name: "Body Goals 90 Hari",
    slug: "body-goals-90",
    price: 799000,
    duration: "60",
    target: "weight-loss",
    description: "Program 90 hari untuk hasil yang permanen dengan dukungan penuh dan habit building.",
    features: [
      "Semua fitur Body Goals Intensif",
      "3 bulan meal plan personal",
      "Habit coaching",
      "Maintenance plan",
      "Akses lifetime ke materi"
    ],
    isPopular: false,
    icon: "🔥",
  },
];

// Label untuk filter dan sort
const targetLabels: Record<Target, string> = {
  "weight-loss": "Turun Berat Badan",
  "muscle-gain": "Naik Massa Otot",
  "pregnancy": "Ibu Hamil/Menyusui",
  "medical": "Kondisi Medis",
};

const sortOptions = [
  { value: "popular", label: "Terpopuler" },
  { value: "price-low", label: "Harga: Rendah → Tinggi" },
  { value: "price-high", label: "Harga: Tinggi → Rendah" },
  { value: "duration", label: "Durasi" },
];

export default function ProgramPage() {
  const [selectedTarget, setSelectedTarget] = useState<Target | "all">("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Filter dan sort program
  let filteredPrograms = [...programs];

  if (selectedTarget !== "all") {
    filteredPrograms = filteredPrograms.filter(p => p.target === selectedTarget);
  }

  if (sortBy === "popular") {
    filteredPrograms.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
  } else if (sortBy === "price-low") {
    filteredPrograms.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredPrograms.sort((a, b) => b.price - a.price);
  } else if (sortBy === "duration") {
    filteredPrograms.sort((a, b) => Number(a.duration) - Number(b.duration));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ──── HERO SECTION ──── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* Decorative blobs */}
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-emerald-200/30 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-200/20 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex flex-wrap items-center justify-center gap-4"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-lg border border-emerald-100">
                <Award className="h-4 w-4" />
                MTKI Certified
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                <Users className="h-4 w-4" />
                2000+ Klien Sukses
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-blue-700 shadow-lg border border-blue-100">
                <Star className="h-4 w-4 fill-current" />
                Rating 4.9/5
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
            >
              Program Diet{" "}
              <span className="relative inline-block text-emerald-600">
                Terbaik
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 50 0, 100 6 T 200 6" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
              {" "}untuk Anda
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-8 max-w-3xl text-xl font-medium text-gray-600 leading-relaxed"
            >
              Pilih program yang sesuai dengan target kesehatan Anda dan mulailah perjalanan hidup sehat bersama{" "}
              <span className="font-bold text-emerald-600">ahli gizi profesional tersertifikasi</span>
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-8"
            >
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600">95%</div>
                <div className="mt-2 text-sm font-bold text-gray-600 uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600">2000+</div>
                <div className="mt-2 text-sm font-bold text-gray-600 uppercase tracking-wider">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600">5+</div>
                <div className="mt-2 text-sm font-bold text-gray-600 uppercase tracking-wider">Years Experience</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── FILTER & SORT SECTION ──── */}
      <section className="py-12 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
            {/* Filter */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-gray-900 uppercase text-sm tracking-wider">Target:</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTarget("all")}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  selectedTarget === "all"
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua Program
              </motion.button>
              {(Object.keys(targetLabels) as Target[]).map((target) => (
                <motion.button
                  key={target}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTarget(target)}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                    selectedTarget === target
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {targetLabels[target]}
                </motion.button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <ArrowUpDown className="w-5 h-5 text-emerald-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 border-2 border-gray-200 rounded-xl px-6 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ──── PROGRAM GRID ──── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className={`relative h-full p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  program.isPopular
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-white shadow-xl"
                    : "border-gray-200 hover:border-emerald-300"
                }`}>
                  {program.isPopular && (
                    <div className="absolute -top-4 -right-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-60 rounded-full"></div>
                        <span className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black uppercase tracking-wider py-2 px-6 rounded-full shadow-lg">
                          <Sparkles className="h-3.5 w-3.5 fill-current" />
                          Terpopuler
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Icon & Category */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-3xl shadow-md">
                        {program.icon}
                      </div>
                      <span className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-xs font-black uppercase tracking-wider text-gray-700">
                        {targetLabels[program.target]}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium mb-6 leading-relaxed">
                    {program.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">
                        Rp {(program.price / 1000).toFixed(0)}k
                      </span>
                      <span className="text-gray-500 font-bold">/ {program.duration} Hari</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {program.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 mt-0.5">
                          <Check className="w-3 h-3 text-white stroke-[3px]" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link href={`/program/${program.slug}`}>
                      <Button
                        variant="outline"
                        className="w-full justify-center font-bold group-hover:border-emerald-600 group-hover:text-emerald-600"
                      >
                        Lihat Detail
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href={`/checkout?program_id=${program.id}`}>
                      <Button
                        variant={program.isPopular ? "primary" : "secondary"}
                        className="w-full justify-center font-bold shadow-lg hover:shadow-xl"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Ambil Program
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── WHY CHOOSE US ──── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Why DietCare</h2>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
              Mengapa Memilih Kami?
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mb-6">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3">Ahli Gizi Tersertifikasi</h4>
              <p className="text-gray-600 font-medium">
                Tim ahli gizi profesional dengan sertifikat MTKI dan pengalaman 5+ tahun
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3">Pendampingan Personal</h4>
              <p className="text-gray-600 font-medium">
                Meal plan yang disesuaikan dengan kondisi, preferensi, dan target Anda
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-3">Garansi 7 Hari</h4>
              <p className="text-gray-600 font-medium">
                Jaminan uang kembali 100% jika program tidak sesuai dalam 7 hari pertama
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── CTA SECTION ──── */}
      <section className="py-24 mx-4 lg:mx-10">
        <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-emerald-600 to-emerald-700 py-20 lg:py-28 px-6 text-center">
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight mb-6">
              Masih Bingung Memilih Program?
            </h2>

            <p className="mx-auto text-xl font-medium text-white/90 leading-relaxed mb-12 max-w-2xl">
              Konsultasi <span className="font-black uppercase tracking-wider">GRATIS</span> dengan tim ahli gizi kami untuk mendapatkan rekomendasi program yang tepat sesuai kebutuhan Anda
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <WaButton
                phoneNumber="6281234567890"
                message="Halo Admin DietCare, saya ingin konsultasi tentang program diet yang cocok untuk saya."
                label="Chat WhatsApp Sekarang"
                variant="solid"
                className="h-16 px-12 text-lg font-bold bg-white text-emerald-600 hover:bg-gray-50 shadow-2xl hover:scale-105 transition-all"
              />
              <Button
                variant="outline"
                size="lg"
                className="h-16 px-12 text-lg font-bold bg-transparent text-white border-2 border-white hover:bg-white/10"
              >
                <Phone className="mr-3 h-6 w-6" />
                Lihat Jadwal Konsultasi
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span className="text-sm font-bold">Gratis & Tanpa Komitmen</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span className="text-sm font-bold">Respon Cepat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
