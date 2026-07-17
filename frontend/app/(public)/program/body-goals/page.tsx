"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Phone,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import ProgramCompare from "@/components/ProgramCompare";
import StickyBuyButton from "@/components/StickyBuyButton";
import { BMICalculator } from "@/components/BMICalculator";
import { NutritionPyramid } from "@/components/NutritionPyramid";
import { BodyComposition3D } from "@/components/BodyComposition3D";
import { Gallery } from "@/components/ui/Gallery";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";

const SUCCESS_STORIES = [
  { id: 1, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop", title: "Transformasi 3 Bulan", category: "Weight Loss", description: "Turun 12kg dengan pola makan seimbang tanpa rasa lapar berlebih." },
  { id: 2, url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", title: "Peningkatan Massa Otot", category: "Body Building", description: "Meningkatkan definisi otot dan stamina untuk aktivitas harian." },
  { id: 3, url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop", title: "Menu Sehat Harian", category: "Meal Plan", description: "Variasi menu lezat yang tervalidasi oleh ahli gizi profesional." },
  { id: 4, url: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop", title: "Konsultasi Personal", category: "Coaching", description: "Pendampingan intensif bersama ahli gizi untuk hasil yang maksimal." },
  { id: 5, url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop", title: "Lifestyle Baru", category: "Habit", description: "Membangun kebiasaan makan sehat yang berkelanjutan untuk jangka panjang." },
  { id: 6, url: "https://images.unsplash.com/photo-1547524388-142f15309323?q=80&w=2070&auto=format&fit=crop", title: "Target Tercapai", category: "Weight Loss", description: "Mencapai berat badan ideal dengan panduan nutrisi berbasis sains." },
];

const CATEGORIES = ["Weight Loss", "Body Building", "Meal Plan", "Coaching", "Habit"];
import { getWaLink } from "@/lib/wa";
import { motion, AnimatePresence } from "framer-motion";

// ── Data ─────────────────────────────────────────────────

const COCOK_UNTUK = [
  { emoji: "📉", text: "Ingin turunkan berat badan dengan target tertentu" },
  { emoji: "📈", text: "Ingin naikkan berat badan dengan target tertentu" },
  { emoji: "🔄", text: "Keluar dari lingkaran diet yang menyiksa" },
  { emoji: "🍽️", text: "Bingung harus makan apa setiap harinya" },
];

const TARGETS = [
  "Berat badan sesuai goal realistis",
  "Tetap bisa makan makanan favorit dengan lebih mindful",
  "Berat badan bertahan permanen, anti yo-yo diet",
  "Tubuh lebih fit dan bugar",
];

const INTENSIF_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "intensive-starter",
    tagline: "Langkah pertama menuju body goals",
    price: 609900,
    duration: "30 Hari",
    features: [
      "4× konseling video call",
      "Chat konsultasi setiap hari",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "8 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
  {
    name: "Essentials 90 Hari",
    slug: "intensive-essentials",
    tagline: "Komitmen untuk hasil nyata",
    price: 1759900,
    pricePerMonth: "Rp 586.633",
    duration: "90 Hari",
    isPopular: true,
    features: [
      "10× konseling video call",
      "Chat konsultasi setiap hari",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "24 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
  {
    name: "Advanced 180 Hari",
    slug: "intensive-advanced",
    tagline: "Transformasi total dan permanen",
    price: 3449000,
    pricePerMonth: "Rp 574.833",
    duration: "180 Hari",
    features: [
      "19× konseling video call",
      "Chat konsultasi setiap hari",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "48 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
];

const SIMPLE_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "simple-starter",
    tagline: "Mulai diet dengan cara santai",
    price: 279900,
    duration: "30 Hari",
    features: [
      "1× konseling video call",
      "3 hari/minggu chat konsultasi",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "2 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
  {
    name: "Essentials 90 Hari",
    slug: "simple-essentials",
    tagline: "Konsisten tanpa ribet",
    price: 699900,
    pricePerMonth: "Rp 233.300",
    duration: "90 Hari",
    features: [
      "3× konseling video call",
      "3 hari/minggu chat konsultasi",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "6 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
  {
    name: "Advanced 180 Hari",
    slug: "simple-advanced",
    tagline: "Diet santai jangka panjang",
    price: 1359900,
    pricePerMonth: "Rp 226.650",
    duration: "180 Hari",
    features: [
      "6× konseling video call",
      "3 hari/minggu chat konsultasi",
      "Cek kondisi gizi",
      "Personalized meal plan",
      "Personalized menu 10 hari",
      "Materi coaching diet",
      "Workout plan",
      "12 sesi olahraga bersama Fitness Trainer",
      "Coaching group Fitness Trainer",
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Konseling Video Call", simple: "1–6×", intensif: "4–19×" },
  { label: "Chat Konsultasi", simple: "3 hari/minggu", intensif: "Setiap hari" },
  { label: "Personalized Meal Plan", simple: true, intensif: true },
  { label: "Personalized Menu", simple: "10 hari", intensif: "10 hari" },
  { label: "Workout Plan", simple: true, intensif: true },
  { label: "Fitness Trainer", simple: "2–12 sesi", intensif: "8–48 sesi" },
  { label: "Coaching Group", simple: true, intensif: true },
  { label: "Harga Mulai", simple: "Rp 279.900", intensif: "Rp 609.900" },
];

const FAQS = [
  { q: "Berapa lama hasil terlihat?", a: "Umumnya klien mulai melihat hasil dalam 2-4 minggu pertama. Penurunan berat badan yang sehat adalah 0.5-1 kg per minggu. Hasil bervariasi tergantung konsistensi dan kondisi tubuh masing-masing." },
  { q: "Apakah bisa makan makanan favorit?", a: "Tentu! Kami menerapkan prinsip flexible dieting — Anda tetap bisa menikmati makanan favorit dalam porsi yang tepat. Tidak ada makanan yang 100% dilarang." },
  { q: "Bagaimana jika saya punya alergi makanan?", a: "Meal plan akan disesuaikan sepenuhnya dengan alergi dan pantangan makanan Anda. Ahli gizi akan membantu mencari alternatif yang aman dan tetap bergizi." },
  { q: "Apakah ada jaminan uang kembali?", a: "Ya, kami memberikan garansi uang kembali 100% jika dalam 7 hari pertama Anda merasa program ini tidak sesuai." },
  { q: "Bagaimana cara konsultasi dengan ahli gizi?", a: "Konsultasi dilakukan melalui video call (Zoom/Google Meet) dan chat sehari-hari via aplikasi. Jadwal video call diatur bersama ahli gizi Anda." },
  { q: "Apakah bisa upgrade program di tengah jalan?", a: "Bisa! Anda bisa upgrade dari Simple ke Intensif kapan saja. Biaya yang sudah dibayar akan diperhitungkan sebagai kredit." },
];

// ── Page Component ───────────────────────────────────────

export default function BodyGoalsPage() {
  const [programType, setProgramType] = useState<"simple" | "intensif">("intensif");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = programType === "intensif" ? INTENSIF_PLANS : SIMPLE_PLANS;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Program Body Goals",
    "description": "Program diet sehat bersama ahli gizi tersertifikasi untuk mencapai berat badan ideal.",
    "brand": {
      "@type": "Brand",
      "name": "DietCare"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "279900",
      "highPrice": "3449000",
      "priceCurrency": "IDR",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <StickyBuyButton href="/checkout?program=intensive-essentials" label="Beli Sekarang" />

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-secondary-50 pb-20 pt-28 lg:pb-32 lg:pt-40">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-100/40 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-secondary-100/30 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {/* Breadcrumb */}
            <nav className="mb-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <Link href="/" className="hover:text-brand-600 transition-colors">Beranda</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/program" className="hover:text-brand-600 transition-colors">Program</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-neutral-900">Body Goals</span>
            </nav>

            {/* Badges */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 shadow-sm border border-brand-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                MTKI Certified
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-green">
                <Zap className="h-3.5 w-3.5 fill-current" />
                Start from Rp 279k
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
              Program <span className="text-brand-600 relative inline-block">
                Body Goals
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-lg font-medium text-neutral-500 leading-relaxed">
              Transformasi tubuh ideal dengan pendekatan sains dan pendampingan personal oleh ahli gizi profesional.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#harga">
                <Button size="lg" className="h-14 px-10 shadow-green group">
                  Lihat Harga Program
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href={getWaLink("Halo kak, saya tertarik dengan Program Body Goals tapi masih bingung pilih paket yang mana. Boleh dibantu?")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="lg" className="h-14 px-10">
                  <Phone className="mr-2 h-5 w-5" />
                  Konsultasi Gratis
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1.5 BMI CALCULATOR ─────────────────────────── */}
      <section className="relative -mt-16 z-10 pb-20">
        <div className="container mx-auto max-w-6xl px-4">
          <BMICalculator />
        </div>
      </section>

      {/* ── 1.6 BODY COMPOSITION 3D ─────────────────────── */}
      <section className="pb-24">
        <div className="container mx-auto max-w-6xl px-4">
          <BodyComposition3D />
        </div>
      </section>

      {/* ── 2. COCOK UNTUK SIAPA ────────────────────────── */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Target Audience</h2>
                <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">Siapa yang Membutuhkan Program Ini?</h3>
              </div>
              <p className="text-lg font-medium text-neutral-500 leading-relaxed">
                Program ini dirancang khusus untuk Anda yang mendambakan perubahan nyata melalui pola makan yang berkelanjutan, bukan sekadar diet sementara.
              </p>
              <div className="grid gap-4">
                {COCOK_UNTUK.map((item, i) => (
                  <motion.div
                    whileHover={{ x: 10 }}
                    key={i}
                    className="flex items-center gap-5 p-6 rounded-3xl bg-surface-50 border border-brand-100 transition-all"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-card text-2xl">
                      {item.emoji}
                    </span>
                    <p className="text-base font-bold text-neutral-800">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-500/10 rounded-[3rem] blur-3xl" />
              <TiltCard className="relative bg-white p-8 rounded-[3rem] shadow-float border border-neutral-100">
                <div className="space-y-8">
                  <div className="p-4 bg-brand-50 rounded-2xl inline-block">
                    <Target className="text-brand-600 h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-black text-neutral-900">Yang Akan Kamu Capai</h4>
                  <div className="space-y-4">
                    {TARGETS.map((target, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                          <Check className="h-3.5 w-3.5 stroke-[3px]" />
                        </div>
                        <p className="text-sm font-bold text-neutral-700">{target}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400 italic">
                      *Hasil bervariasi untuk setiap individu tergantung metabolisme dan kepatuhan program.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PILIH JENIS PROGRAM ──────────────────────── */}
      <section className="py-24 bg-neutral-900 text-white rounded-[4rem] mx-4 lg:mx-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-500/10 blur-[120px] -z-0" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-400">Program Options</h2>
            <h3 className="text-4xl font-black tracking-tight sm:text-5xl">Pilih Intensitas Perjalananmu</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Simple */}
            <motion.button
              whileHover={{ y: -8 }}
              onClick={() => {
                setProgramType("simple");
                document.querySelector("#harga")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-10 text-left transition-all ${
                programType === "simple" 
                  ? "border-brand-500 bg-white/5" 
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="mb-8 flex justify-between items-start">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/70">
                  Fleksibel
                </span>
                {programType === "simple" && <Check className="text-brand-500 h-6 w-6" />}
              </div>
              <h3 className="text-3xl font-black text-white">Program Simple</h3>
              <p className="mt-4 text-white/60 font-medium">Diet mandiri dengan pengawasan berkala. Cocok untuk Anda yang sudah memiliki dasar gizi.</p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Mulai dari</p>
                <p className="text-3xl font-black text-brand-400 mt-1">Rp 279.900<span className="text-sm font-medium text-white/40">/bulan</span></p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Lihat Detail <ArrowRight className="h-4 w-4" />
              </div>
            </motion.button>

            {/* Intensif */}
            <motion.button
              whileHover={{ y: -8 }}
              onClick={() => {
                setProgramType("intensif");
                document.querySelector("#harga")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-10 text-left transition-all ${
                programType === "intensif" 
                  ? "border-brand-500 bg-brand-500/5" 
                  : "border-white/10 hover:border-brand-500/20"
              }`}
            >
              <div className="mb-8 flex justify-between items-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  Recommended
                </span>
                {programType === "intensif" && <Check className="text-brand-500 h-6 w-6" />}
              </div>
              <h3 className="text-3xl font-black text-white">Program Intensif</h3>
              <p className="mt-4 text-white/60 font-medium">Pendampingan harian 1-on-1 dengan ahli gizi. Hasil maksimal dan edukasi mendalam.</p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Mulai dari</p>
                <p className="text-3xl font-black text-brand-400 mt-1">Rp 609.900<span className="text-sm font-medium text-white/40">/bulan</span></p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-brand-500">
                Lihat Detail <ArrowRight className="h-4 w-4" />
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── 5 & 6. TABEL HARGA ──────────────────────────── */}
      <section id="harga" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 flex flex-col items-center gap-8 text-center">
            <div className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Pricing Plans</h2>
              <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">
                Paket Program {programType === "intensif" ? "Intensif" : "Simple"}
              </h3>
            </div>
            <ProgramTypeToggle activeType={programType} onChange={setProgramType} />
            <ProgramCompare rows={COMPARE_ROWS} />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <ProgramCard
                key={plan.slug}
                programName={plan.name}
                slug={plan.slug}
                tagline={plan.tagline}
                price={plan.price}
                pricePerMonth={plan.pricePerMonth}
                duration={plan.duration}
                features={plan.features}
                isPopular={"isPopular" in plan && Boolean(plan.isPopular)}
                checkoutUrl={`/checkout?program=${plan.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA KONSULTASI GRATIS ────────────────────── */}
      <section className="mx-4 lg:mx-10 mb-20">
        <div className="relative overflow-hidden rounded-[4rem] bg-brand-600 py-20 lg:py-28 px-6 text-center">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
              Masih Ragu Memulai?
            </h2>
            <p className="mx-auto mt-6 text-xl font-medium text-white/80 leading-relaxed">
              Tanyakan apapun kondisimu pada tim ahli gizi kami secara gratis. Kami siap membantu menentukan langkah awalmu.
            </p>
            <div className="mt-12">
              <a
                href={getWaLink("Halo kak, saya tertarik dengan Program Body Goals tapi masih bingung pilih paket yang mana. Boleh dibantu?")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="lg" className="h-16 px-12 text-lg shadow-xl hover:scale-105 transition-all">
                  <Phone className="mr-3 h-6 w-6 text-brand-600" />
                  Chat WhatsApp Sekarang
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. APA SAJA YANG DIDAPATKAN ────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Galeri Keberhasilan</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Lihat bagaimana alumni program Body Goals mencapai transformasi terbaik mereka.
            </p>
          </div>
          <Gallery images={SUCCESS_STORIES} categories={CATEGORIES} />
        </div>
      </section>

      {/* ── 7.5 NUTRITION PYRAMID ──────────────────────── */}
      <section className="pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <NutritionPyramid />
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────── */}
      <section className="py-24 bg-surface-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Common Questions</h2>
            <h3 className="text-4xl font-black text-neutral-900 tracking-tight">FAQ</h3>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-[2rem] border border-neutral-100 bg-white transition-all hover:shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-8 py-6 text-left group"
                >
                  <span className="pr-4 text-lg font-bold text-neutral-800 group-hover:text-brand-600 transition-colors">{faq.q}</span>
                  <div className={`p-2 rounded-full transition-all ${openFaq === i ? 'bg-brand-500 text-white rotate-180' : 'bg-neutral-50 text-neutral-400 group-hover:bg-brand-50 group-hover:text-brand-600'}`}>
                    <ChevronDown className="h-5 w-5 shrink-0" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-base font-medium leading-relaxed text-neutral-500 border-t border-neutral-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
