"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  Phone,
  ShieldAlert,
  Stethoscope,
  MessageCircle,
  Activity,
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import ProgramCompare from "@/components/ProgramCompare";
import StickyBuyButton from "@/components/StickyBuyButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { getWaLink } from "@/lib/wa";
import { motion, AnimatePresence } from "framer-motion";

const CONDITIONS = [
  { emoji: "💉", name: "Diabetes Mellitus", desc: "Tipe 1 & 2" },
  { emoji: "❤️", name: "Hipertensi", desc: "Darah tinggi" },
  { emoji: "🫀", name: "Kolesterol Tinggi", desc: "Dislipidemia" },
  { emoji: "🫘", name: "Penyakit Ginjal Kronis", desc: "PGK" },
  { emoji: "🩺", name: "PCOS", desc: "Sindrom ovarium polikistik" },
  { emoji: "🦴", name: "Asam Urat", desc: "Gout" },
  { emoji: "🫁", name: "Fatty Liver", desc: "Perlemakan hati" },
  { emoji: "🎗️", name: "Kanker", desc: "Terapi nutrisi suportif" },
];

const DIFFERENTIATORS = [
  { icon: Stethoscope, title: "Ahli Gizi Klinis Bersertifikat", desc: "Bukan hanya nutritionist biasa — kami menggunakan ahli gizi klinis yang berpengalaman menangani kondisi medis." },
  { icon: HeartPulse, title: "Kolaborasi dengan Dokter Spesialis", desc: "Meal plan disusun dengan memperhatikan rekomendasi dokter spesialis yang menangani Anda." },
  { icon: ShieldAlert, title: "Disesuaikan dengan Obat-obatan", desc: "Meal plan mempertimbangkan interaksi makanan dengan obat-obatan yang sedang dikonsumsi." },
  { icon: BadgeCheck, title: "Monitoring Lab & Pemeriksaan", desc: "Kami memantau hasil lab dan pemeriksaan untuk menyesuaikan rencana gizi secara berkala." },
];

const INTENSIF_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "clinicare-intensive-starter",
    tagline: "Assessment gizi klinis awal",
    price: 749900,
    duration: "30 Hari",
    features: ["4× konseling video call", "Chat konsultasi setiap hari", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Konsultasi dokter spesialis 1×", "Review hasil lab", "Materi edukasi penyakit"],
  },
  {
    name: "Essentials 90 Hari",
    slug: "clinicare-intensive-essentials",
    tagline: "Pemantauan intensif",
    price: 2099900,
    pricePerMonth: "Rp 699.966",
    duration: "90 Hari",
    isPopular: true,
    features: ["10× konseling video call", "Chat konsultasi setiap hari", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Konsultasi dokter spesialis 2×", "Review hasil lab berkala", "Materi edukasi penyakit", "Penyesuaian menu per fase"],
  },
  {
    name: "Advanced 180 Hari",
    slug: "clinicare-intensive-advanced",
    tagline: "Pendampingan jangka panjang",
    price: 3999000,
    pricePerMonth: "Rp 666.500",
    duration: "180 Hari",
    features: ["19× konseling video call", "Chat konsultasi setiap hari", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Konsultasi dokter spesialis 4×", "Review hasil lab berkala", "Materi edukasi penyakit", "Penyesuaian menu per fase", "Laporan perkembangan"],
  },
];

const SIMPLE_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "clinicare-simple-starter",
    tagline: "Konsultasi gizi klinis dasar",
    price: 349900,
    duration: "30 Hari",
    features: ["1× konseling video call", "3 hari/minggu chat konsultasi", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Materi edukasi penyakit"],
  },
  {
    name: "Essentials 90 Hari",
    slug: "clinicare-simple-essentials",
    tagline: "Pemantauan berkala",
    price: 899900,
    pricePerMonth: "Rp 299.966",
    duration: "90 Hari",
    features: ["3× konseling video call", "3 hari/minggu chat konsultasi", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Review hasil lab 1×", "Materi edukasi penyakit"],
  },
  {
    name: "Advanced 180 Hari",
    slug: "clinicare-simple-advanced",
    tagline: "Pendampingan jangka panjang",
    price: 1699900,
    pricePerMonth: "Rp 283.316",
    duration: "180 Hari",
    features: ["6× konseling video call", "3 hari/minggu chat konsultasi", "Assessment gizi klinis", "Personalized medical meal plan", "Personalized menu 10 hari", "Review hasil lab 2×", "Materi edukasi penyakit", "Penyesuaian menu per fase"],
  },
];

const FAQS = [
  { q: "Apakah Clinicare bisa menggantikan obat?", a: "Tidak. Program Clinicare adalah terapi nutrisi pendukung yang berjalan bersamaan dengan pengobatan dokter. Jangan pernah menghentikan obat tanpa sepengetahuan dokter." },
  { q: "Apakah ahli gizi klinis berbeda dengan nutritionist?", a: "Ya. Ahli gizi klinis memiliki sertifikasi tambahan untuk menangani pasien dengan kondisi medis. Mereka terlatih membaca hasil lab dan memahami interaksi obat-makanan." },
  { q: "Bagaimana jika kondisi saya tidak ada di daftar?", a: "Silakan konsultasi gratis via WhatsApp. Tim kami akan mengevaluasi apakah kondisi Anda bisa ditangani melalui program Clinicare." },
  { q: "Apakah perlu menyertakan hasil lab?", a: "Sangat disarankan. Hasil lab membantu ahli gizi menyusun meal plan yang lebih presisi dan memantau perkembangan kesehatan Anda." },
];

const COMPARE_ROWS = [
  { label: "Konseling Video Call", simple: "1–6×", intensif: "4–19×" },
  { label: "Assessment Gizi Klinis", simple: true, intensif: true },
  { label: "Review Hasil Lab", simple: "1–2×", intensif: "Berkala" },
  { label: "Konsultasi Dokter Spesialis", simple: false, intensif: "1–4×" },
  { label: "Personalized Medical Meal Plan", simple: true, intensif: true },
  { label: "Materi Edukasi Penyakit", simple: true, intensif: true },
  { label: "Harga Mulai", simple: "Rp 349.900", intensif: "Rp 749.900" },
];

export default function ClinicarePage() {
  const [programType, setProgramType] = useState<"simple" | "intensif">("intensif");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const plans = programType === "intensif" ? INTENSIF_PLANS : SIMPLE_PLANS;

  return (
    <div className="min-h-screen bg-white">
      <StickyBuyButton href="/checkout?program=clinicare-intensive-essentials" label="Beli Sekarang" />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-secondary-50 pb-20 pt-28 lg:pb-32 lg:pt-40">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-100/40 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-secondary-100/30 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <nav className="mb-10 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <Link href="/" className="hover:text-brand-600 transition-colors">Beranda</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/program" className="hover:text-brand-600 transition-colors">Program</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-neutral-900">Clinicare</span>
            </nav>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 shadow-sm border border-brand-100">
                <Stethoscope className="h-3.5 w-3.5" />
                Medical Grade Nutrition
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
              Terapi Nutrisi untuk <span className="text-brand-600 relative inline-block">
                Kondisi Medis
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-lg font-medium text-neutral-500 leading-relaxed">
              Program gizi klinis khusus yang didampingi oleh Registered Dietitian berpengalaman menangani berbagai kondisi kesehatan.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#harga">
                <Button size="lg" className="h-14 px-10 shadow-green group">
                  Lihat Harga Program
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href={getWaLink("Halo kak, saya punya kondisi medis dan ingin tahu apakah Program Clinicare cocok untuk saya")} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="h-14 px-10">
                  <Phone className="mr-2 h-5 w-5" />
                  Konsultasi Gratis
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── KONDISI YANG DITANGANI ──────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Specialized Care</h2>
            <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">Kondisi yang Kami Tangani</h3>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {CONDITIONS.map((c, i) => (
              <TiltCard key={i} className="rounded-[2.5rem] border border-neutral-100 bg-white p-8 text-center transition-all shadow-card hover:shadow-float">
                <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-50 text-4xl mx-auto border border-brand-100 shadow-sm">{c.emoji}</span>
                <p className="text-lg font-black text-neutral-900 tracking-tight">{c.name}</p>
                <p className="mt-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">{c.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── YANG MEMBEDAKAN ────────────────────────── */}
      <section className="bg-surface-50 py-24 lg:py-32 rounded-[4rem] mx-4 lg:mx-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Why Clinicare?</h2>
            <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">Standar Gizi Klinis Tertinggi</h3>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <TiltCard key={i} className="rounded-[2.5rem] bg-white p-10 shadow-card border border-neutral-100 group">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-spring">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{d.title}</h3>
                  <p className="mt-4 text-base font-medium text-neutral-500 leading-relaxed">{d.desc}</p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TABEL HARGA ────────────────────────────── */}
      <section id="harga" className="scroll-mt-24 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 flex flex-col items-center gap-8 text-center">
            <div className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Pricing Plans</h2>
              <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">
                Harga Program {programType === "intensif" ? "Intensif" : "Simple"}
              </h3>
            </div>
            <ProgramTypeToggle activeType={programType} onChange={setProgramType} />
            <ProgramCompare rows={COMPARE_ROWS} />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <ProgramCard key={plan.slug} programName={plan.name} slug={plan.slug} tagline={plan.tagline} price={plan.price} pricePerMonth={plan.pricePerMonth} duration={plan.duration} features={plan.features} isPopular={"isPopular" in plan && Boolean(plan.isPopular)} checkoutUrl={`/checkout?program=${plan.slug}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ─────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-start gap-6 rounded-[2.5rem] border border-brand-100 bg-brand-50/50 px-8 py-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-brand-900 uppercase tracking-widest">Medical Disclaimer</p>
              <p className="text-sm font-medium text-brand-800 leading-relaxed">
                Program Clinicare bukan pengganti pengobatan dokter. Selalu konsultasikan kondisi Anda dengan dokter yang menangani. Jangan mengubah atau menghentikan obat tanpa persetujuan dokter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="mx-4 lg:mx-10 mb-20">
        <div className="relative overflow-hidden rounded-[4rem] bg-brand-600 py-20 lg:py-28 px-6 text-center">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
              Butuh Penjelasan Lebih Lanjut?
            </h2>
            <p className="mx-auto mt-6 text-xl font-medium text-white/80 leading-relaxed">
              Ceritakan kondisi medis Anda pada tim ahli kami secara gratis. Kami akan bantu menentukan apakah program ini sesuai untuk Anda.
            </p>
            <div className="mt-12">
              <a href={getWaLink("Halo kak, saya punya kondisi medis dan ingin tahu apakah Program Clinicare cocok untuk saya")} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="h-16 px-12 text-lg shadow-xl hover:scale-105 transition-all">
                  <Phone className="mr-3 h-6 w-6 text-brand-600" />
                  Chat WhatsApp Sekarang
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
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
