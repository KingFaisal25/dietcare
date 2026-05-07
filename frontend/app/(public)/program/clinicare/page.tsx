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
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import StickyBuyButton from "@/components/StickyBuyButton";
import { getWaLink } from "@/lib/wa";

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

export default function ClincarePage() {
  const [programType, setProgramType] = useState<"simple" | "intensif">("intensif");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const plans = programType === "intensif" ? INTENSIF_PLANS : SIMPLE_PLANS;

  return (
    <div className="min-h-screen bg-white">
      <StickyBuyButton href="/checkout?program=clinicare-intensive-essentials" label="Beli Sekarang" />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-rose-50 pb-16 pt-24 lg:pb-24 lg:pt-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-red-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-red-600">Beranda</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/program" className="hover:text-red-600">Program</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-700">Clinicare</span>
          </nav>

          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              Perlu Konsultasi Dokter
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Program Gizi Klinis untuk <span className="text-red-600">Kondisi Medis Khusus</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Didampingi Ahli Gizi Klinis bersertifikat untuk kondisi medis yang memerlukan penanganan khusus.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#harga" className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700">
              Lihat Harga <ArrowRight className="h-4 w-4" />
            </a>
            <a href={getWaLink("Halo kak, saya punya kondisi medis dan ingin tahu apakah Program Clinicare cocok untuk saya")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border-2 border-red-200 px-8 py-4 text-base font-bold text-red-700 transition hover:bg-red-50">
              <Phone className="h-4 w-4" /> Konsultasi Gratis
            </a>
          </div>
        </div>
      </section>

      {/* ── KONDISI YANG DITANGANI ──────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900">Kondisi yang Ditangani</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CONDITIONS.map((c, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 text-center transition hover:border-red-200 hover:bg-red-50/30 hover:shadow-sm">
                <span className="mb-3 block text-3xl">{c.emoji}</span>
                <p className="text-sm font-bold text-gray-900">{c.name}</p>
                <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YANG MEMBEDAKAN ────────────────────────── */}
      <section className="bg-red-50/50 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-gray-900">Yang Membedakan Clinicare</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{d.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TABEL HARGA ────────────────────────────── */}
      <section id="harga" className="scroll-mt-20 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Harga Program {programType === "intensif" ? "Intensif" : "Simple"}</h2>
            <ProgramTypeToggle activeType={programType} onChange={setProgramType} />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <ProgramCard key={plan.slug} programName={plan.name} slug={plan.slug} tagline={plan.tagline} price={plan.price} pricePerMonth={plan.pricePerMonth} duration={plan.duration} features={plan.features} isPopular={"isPopular" in plan && Boolean(plan.isPopular)} checkoutUrl={`/checkout?program=${plan.slug}`} waMessage={`Halo kak, saya punya kondisi medis dan tertarik paket ${plan.name} dari Program Clinicare.`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ─────────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> Program Clinicare bukan pengganti pengobatan dokter. Selalu konsultasikan kondisi Anda dengan dokter yang menangani. Jangan mengubah atau menghentikan obat tanpa persetujuan dokter.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-red-600 py-16 lg:py-20">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Stethoscope className="mx-auto mb-4 h-12 w-12 text-white/60" />
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Konsultasi gratis dulu sebelum daftar</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Ceritakan kondisi medis Anda dan kami akan bantu tentukan program yang tepat</p>
          <a href={getWaLink("Halo kak, saya punya kondisi medis dan ingin tahu apakah Program Clinicare cocok untuk saya")} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-red-700 shadow-xl transition hover:shadow-2xl hover:scale-105">
            <Phone className="h-5 w-5" /> Chat WhatsApp Sekarang
          </a>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
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
