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
} from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import ProgramTypeToggle from "@/components/ProgramTypeToggle";
import ProgramCompare from "@/components/ProgramCompare";
import StickyBuyButton from "@/components/StickyBuyButton";
import { getWaLink } from "@/lib/wa";

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

  return (
    <div className="min-h-screen bg-white">
      <StickyBuyButton href="/checkout?program=intensive-essentials" label="Beli Sekarang" />

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-16 pt-24 lg:pb-24 lg:pt-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-emerald-600">Beranda</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/program" className="hover:text-emerald-600">Program</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-700">Body Goals</span>
          </nav>

          {/* Badges */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              MTKI Certified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              Mulai dari Rp 279.900
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Program <span className="text-emerald-600">Body Goals</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 leading-relaxed">
            Capai berat badan idealmu dengan pendampingan ahli gizi tersertifikasi.
            Program personal yang disesuaikan dengan gaya hidup dan target kamu.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#harga"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 hover:scale-[1.02]"
            >
              Lihat Harga
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={getWaLink("Halo kak, saya tertarik dengan Program Body Goals tapi masih bingung pilih paket yang mana. Boleh dibantu?")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-200 px-8 py-4 text-base font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              <Phone className="h-4 w-4" />
              Konsultasi Gratis
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. COCOK UNTUK SIAPA ────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Cocok Untuk Siapa?</h2>
            <p className="mt-3 text-lg text-gray-500">Program ini dirancang khusus untuk kamu yang:</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {COCOK_UNTUK.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  {item.emoji}
                </span>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. TARGET PROGRAM ───────────────────────────── */}
      <section className="bg-emerald-50/60 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Yang Akan Kamu Capai</h2>
            <p className="mt-3 text-lg text-gray-500">Target realistis yang bisa diraih dengan program ini</p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-4">
            {TARGETS.map((target, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{target}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PILIH JENIS PROGRAM ──────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Pilih Jenis Program</h2>
            <p className="mt-3 text-lg text-gray-500">Dua pilihan yang bisa disesuaikan dengan kebutuhan kamu</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Simple */}
            <button
              type="button"
              onClick={() => {
                setProgramType("simple");
                document.querySelector("#harga")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group rounded-3xl border-2 p-8 text-left transition-all hover:shadow-lg ${
                programType === "simple" ? "border-gray-700 bg-gray-50" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-600">
                Fleksibel
              </span>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Program Simple</h3>
              <p className="mt-2 text-sm text-gray-500">#dietgayakusendiri yang fleksibel</p>
              <p className="mt-4 text-lg font-bold text-gray-900">
                Mulai dari <span className="text-emerald-600">Rp 279.900</span>/bulan
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-400 transition group-hover:text-emerald-600">
                Lihat harga <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* Intensif */}
            <button
              type="button"
              onClick={() => {
                setProgramType("intensif");
                document.querySelector("#harga")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group relative rounded-3xl border-2 p-8 text-left transition-all hover:shadow-lg ${
                programType === "intensif" ? "border-emerald-500 bg-emerald-50/50" : "border-gray-100 hover:border-emerald-300"
              }`}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" />
                Recommended
              </span>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Program Intensif</h3>
              <p className="mt-2 text-sm text-gray-500">Terlengkap untuk hasil maksimal</p>
              <p className="mt-4 text-lg font-bold text-gray-900">
                Mulai dari <span className="text-emerald-600">Rp 609.900</span>/bulan
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600 transition">
                Lihat harga <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5 & 6. TABEL HARGA ──────────────────────────── */}
      <section id="harga" className="scroll-mt-20 bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Harga Program {programType === "intensif" ? "Intensif" : "Simple"}
            </h2>
            <ProgramTypeToggle activeType={programType} onChange={setProgramType} />
            <ProgramCompare rows={COMPARE_ROWS} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
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
                waMessage={`Halo kak, saya tertarik dengan paket ${plan.name} (${programType === "intensif" ? "Intensif" : "Simple"}) dari Program Body Goals. Boleh tanya-tanya dulu?`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA KONSULTASI GRATIS ────────────────────── */}
      <section className="relative overflow-hidden bg-emerald-600 py-16 lg:py-20">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-white/60" />
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Masih bingung program mana yang cocok untuk kamu?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Konsultasikan kondisimu ke tim kami gratis, tanpa syarat
          </p>
          <a
            href={getWaLink("Halo kak, saya tertarik dengan Program Body Goals tapi masih bingung pilih paket yang mana. Boleh dibantu?")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-xl transition hover:shadow-2xl hover:scale-105"
          >
            <Phone className="h-5 w-5 text-emerald-600" />
            Chat WhatsApp Sekarang
          </a>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Pertanyaan yang Sering Ditanyakan</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-gray-50 px-6 pb-5 pt-3 text-sm leading-relaxed text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
