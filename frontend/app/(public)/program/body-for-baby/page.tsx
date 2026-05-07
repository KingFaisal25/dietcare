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
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import StickyBuyButton from "@/components/StickyBuyButton";
import { getWaLink } from "@/lib/wa";

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

  return (
    <div className="min-h-screen bg-white">
      <StickyBuyButton href="/checkout?program=baby-intensive-essentials" label="Beli Sekarang" />

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 pb-16 pt-24 lg:pb-24 lg:pt-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-pink-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-pink-600">Beranda</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/program" className="hover:text-pink-600">Program</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-700">Body for Baby</span>
          </nav>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-4 py-1.5 text-xs font-bold text-pink-700">
              <Heart className="h-3.5 w-3.5" />
              Direkomendasikan POGI & IDAI
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Nutrisi Optimal untuk <span className="text-pink-600">Ibu dan Buah Hati</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Program gizi khusus ibu hamil, menyusui, dan persiapan kehamilan.
            Didampingi ahli gizi yang berpengalaman di bidang gizi maternal.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#harga" className="inline-flex items-center gap-2 rounded-2xl bg-pink-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700">
              Lihat Harga <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={getWaLink("Halo kak, saya sedang hamil/menyusui/promil dan ingin tanya tentang Program Body for Baby")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-pink-200 px-8 py-4 text-base font-bold text-pink-700 transition hover:bg-pink-50"
            >
              <Phone className="h-4 w-4" /> Konsultasi Gratis
            </a>
          </div>
        </div>
      </section>

      {/* ── COCOK UNTUK ─────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900">Cocok Untuk Siapa?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {COCOK_UNTUK.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-pink-200 hover:bg-pink-50/30">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">{item.emoji}</span>
                <p className="text-sm font-medium text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APA YANG DIDAPAT ────────────────────────────── */}
      <section className="bg-pink-50/60 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900">Apa yang Kamu Dapatkan?</h2>
          <div className="mx-auto grid max-w-2xl gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABEL HARGA ─────────────────────────────────── */}
      <section id="harga" className="scroll-mt-20 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Harga Program {programType === "intensif" ? "Intensif" : "Simple"}
            </h2>
            <ProgramTypeToggle activeType={programType} onChange={setProgramType} />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <ProgramCard key={plan.slug} programName={plan.name} slug={plan.slug} tagline={plan.tagline} price={plan.price} pricePerMonth={plan.pricePerMonth} duration={plan.duration} features={plan.features} isPopular={"isPopular" in plan && Boolean(plan.isPopular)} checkoutUrl={`/checkout?program=${plan.slug}`} waMessage={`Halo kak, saya tertarik dengan paket ${plan.name} dari Program Body for Baby.`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-pink-600 py-16 lg:py-20">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Baby className="mx-auto mb-4 h-12 w-12 text-white/60" />
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Konsultasi gratis untuk ibu hamil & menyusui</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Tim ahli gizi kami siap membantu perjalanan kehamilan dan menyusui Anda</p>
          <a href={getWaLink("Halo kak, saya sedang hamil/menyusui/promil dan ingin tanya tentang Program Body for Baby")} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-pink-700 shadow-xl transition hover:shadow-2xl hover:scale-105">
            <Phone className="h-5 w-5" /> Chat WhatsApp Sekarang
          </a>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900">Pertanyaan yang Sering Ditanyakan</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-sm">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                  <span className="pr-4 font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="border-t border-gray-50 px-6 pb-5 pt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
