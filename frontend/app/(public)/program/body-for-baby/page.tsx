"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Baby,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Phone,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import StickyBuyButton from "@/components/StickyBuyButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { getWaLink } from "@/lib/wa";
import { motion, AnimatePresence } from "framer-motion";

const COCOK_UNTUK = [
  { emoji: "🤰", text: "Ibu hamil trimester 1, 2, dan 3" },
  { emoji: "🤱", text: "Ibu menyusui yang ingin ASI berkualitas dan berat badan terjaga" },
  { emoji: "💑", text: "Pasangan yang sedang program hamil (promil)" },
  { emoji: "🌸", text: "Ibu yang ingin pulih cepat setelah melahirkan" },
];

const BENEFITS = [
  "Panduan gizi per trimester kehamilan",
  "Menu harian yang aman dan bergizi untuk janin",
  "Panduan ASI booster yang alami",
  "Pantauan kenaikan berat badan kehamilan",
  "Edukasi gizi bayi 0–6 bulan",
];

const INTENSIF_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "baby-intensive-starter",
    tagline: "Pendamping awal kehamilan",
    price: 649900,
    duration: "30 Hari",
    features: ["4× konseling video call", "Chat konsultasi setiap hari", "Cek kondisi gizi ibu & janin", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan"],
  },
  {
    name: "Essentials 90 Hari",
    slug: "baby-intensive-essentials",
    tagline: "Pendampingan per trimester",
    price: 1829900,
    pricePerMonth: "Rp 609.966",
    duration: "90 Hari",
    isPopular: true,
    features: ["10× konseling video call", "Chat konsultasi setiap hari", "Cek kondisi gizi ibu & janin", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan", "Panduan ASI booster"],
  },
  {
    name: "Advanced 180 Hari",
    slug: "baby-intensive-advanced",
    tagline: "Full journey kehamilan",
    price: 3549000,
    pricePerMonth: "Rp 591.500",
    duration: "180 Hari",
    features: ["19× konseling video call", "Chat konsultasi setiap hari", "Cek kondisi gizi ibu & janin", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan", "Panduan ASI booster", "Edukasi gizi bayi 0–6 bulan"],
  },
];

const SIMPLE_PLANS = [
  {
    name: "Starter 30 Hari",
    slug: "baby-simple-starter",
    tagline: "Mulai gizi kehamilan",
    price: 299900,
    duration: "30 Hari",
    features: ["1× konseling video call", "3 hari/minggu chat konsultasi", "Cek kondisi gizi ibu", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan"],
  },
  {
    name: "Essentials 90 Hari",
    slug: "baby-simple-essentials",
    tagline: "Konsistensi per trimester",
    price: 749900,
    pricePerMonth: "Rp 249.966",
    duration: "90 Hari",
    features: ["3× konseling video call", "3 hari/minggu chat konsultasi", "Cek kondisi gizi ibu", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan", "Panduan ASI booster"],
  },
  {
    name: "Advanced 180 Hari",
    slug: "baby-simple-advanced",
    tagline: "Journey lengkap ibu",
    price: 1429900,
    pricePerMonth: "Rp 238.316",
    duration: "180 Hari",
    features: ["6× konseling video call", "3 hari/minggu chat konsultasi", "Cek kondisi gizi ibu", "Menu kehamilan personal 10 hari", "Panduan suplemen kehamilan", "Monitoring kenaikan BB", "Materi edukasi kehamilan", "Panduan ASI booster", "Edukasi gizi bayi 0–6 bulan"],
  },
];

const FAQS = [
  { q: "Apakah aman untuk semua trimester?", a: "Ya, program kami disesuaikan per trimester kehamilan. Ahli gizi akan menyesuaikan menu dan rekomendasi sesuai usia kehamilan Anda." },
  { q: "Bisa untuk ibu menyusui juga?", a: "Tentu! Program ini juga mencakup panduan gizi untuk ibu menyusui, termasuk ASI booster alami dan menu yang mendukung produksi ASI." },
  { q: "Apakah suami bisa ikut konsultasi?", a: "Boleh! Terutama untuk program promil, kami sangat menyarankan kedua pasangan untuk ikut konsultasi agar hasilnya optimal." },
  { q: "Bagaimana jika saya punya kondisi medis selama kehamilan?", a: "Ahli gizi kami berpengalaman menangani kondisi kehamilan seperti diabetes gestasional, preeklampsia, dan hiperemesis. Meal plan akan disesuaikan dengan kondisi medis Anda." },
];

export default function BodyForBabyPage() {
  const [programType, setProgramType] = useState<"simple" | "intensif">("intensif");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const plans = programType === "intensif" ? INTENSIF_PLANS : SIMPLE_PLANS;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Program Body for Baby",
    "description": "Program gizi khusus ibu hamil dan menyusui bersama ahli gizi tersertifikasi.",
    "brand": {
      "@type": "Brand",
      "name": "DietCare"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "299900",
      "highPrice": "3549000",
      "priceCurrency": "IDR",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.95",
      "reviewCount": "850"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <StickyBuyButton href="/checkout?program=baby-intensive-essentials" label="Beli Sekarang" />

      {/* ── HERO ────────────────────────────────────────── */}
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
              <span className="text-neutral-900">Body for Baby</span>
            </nav>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 shadow-sm border border-brand-100">
                <Heart className="h-3.5 w-3.5 fill-brand-500" />
                Direkomendasikan POGI & IDAI
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
              Nutrisi Optimal untuk <span className="text-brand-600 relative inline-block">
                Ibu & Buah Hati
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-lg font-medium text-neutral-500 leading-relaxed">
              Program gizi komprehensif untuk masa kehamilan, menyusui, dan persiapan promil dengan pendampingan personal.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#harga">
                <Button size="lg" className="h-14 px-10 shadow-green group">
                  Lihat Harga Program
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href={getWaLink("Halo kak, saya sedang hamil/menyusui/promil dan ingin tanya tentang Program Body for Baby")}
                target="_blank" rel="noopener noreferrer"
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

      {/* ── COCOK UNTUK ─────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Target Audience</h2>
            <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">Siapa yang Membutuhkan Program Ini?</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COCOK_UNTUK.map((item, i) => (
              <TiltCard key={i} className="flex flex-col items-center text-center gap-6 p-8 rounded-[2.5rem] bg-white border border-neutral-100 shadow-card hover:shadow-float transition-all">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-brand-50 text-4xl shadow-sm border border-brand-100">
                  {item.emoji}
                </span>
                <p className="text-sm font-bold text-neutral-800 leading-relaxed">{item.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── APA YANG DIDAPAT ────────────────────────────── */}
      <section className="bg-surface-50 py-24 lg:py-32 rounded-[4rem] mx-4 lg:mx-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-500/10 rounded-[3rem] blur-3xl" />
              <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-200 flex items-center justify-center p-12">
                <Baby className="w-full h-full text-brand-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-float border border-white max-w-[80%]">
                    <h4 className="text-2xl font-black text-neutral-900 mb-6">Fokus Utama Program</h4>
                    <div className="space-y-4">
                      {BENEFITS.map((b, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3px]" />
                          </div>
                          <p className="text-sm font-bold text-neutral-700">{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-600">Program Benefits</h2>
                <h3 className="text-4xl font-black text-neutral-900 tracking-tight sm:text-5xl">Pendampingan Gizi Terbaik untuk Bunda</h3>
              </div>
              <p className="text-lg font-medium text-neutral-500 leading-relaxed">
                Kami memahami bahwa setiap fase kehamilan dan menyusui membutuhkan perhatian nutrisi yang berbeda. Ahli gizi kami akan membantu Bunda menavigasi setiap langkah dengan aman.
              </p>
              <div className="pt-8 grid grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white shadow-card border border-neutral-100">
                  <p className="text-3xl font-black text-brand-600 mb-1">100%</p>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Aman & Alami</p>
                </div>
                <div className="p-6 rounded-3xl bg-white shadow-card border border-neutral-100">
                  <p className="text-3xl font-black text-brand-600 mb-1">24/7</p>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Chat Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABEL HARGA ─────────────────────────────────── */}
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
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <ProgramCard key={plan.slug} programName={plan.name} slug={plan.slug} tagline={plan.tagline} price={plan.price} pricePerMonth={plan.pricePerMonth} duration={plan.duration} features={plan.features} isPopular={"isPopular" in plan && Boolean(plan.isPopular)} checkoutUrl={`/checkout?program=${plan.slug}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="mx-4 lg:mx-10 mb-20">
        <div className="relative overflow-hidden rounded-[4rem] bg-brand-600 py-20 lg:py-28 px-6 text-center">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
              Konsultasi Gratis untuk Bunda
            </h2>
            <p className="mx-auto mt-6 text-xl font-medium text-white/80 leading-relaxed">
              Tim ahli gizi kami siap membantu perjalanan kehamilan dan menyusui Bunda agar tetap sehat dan optimal.
            </p>
            <div className="mt-12">
              <a
                href={getWaLink("Halo kak, saya sedang hamil/menyusui/promil dan ingin tanya tentang Program Body for Baby")}
                target="_blank" rel="noopener noreferrer"
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

      {/* ── FAQ ──────────────────────────────────────────── */}
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
