"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Shield, Star, Award, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WaButton } from "@/components/ui/WaButton";
import { buildApiUrl } from "@/lib/url";

type PlanType = "Simple" | "Intensif";
type ProgramType = "body-goals" | "body-for-baby" | "clinicare";

const programs = {
  "body-goals": {
    name: "Body Goals",
    icon: "🎯",
    desc: "Turun/naik berat badan ideal dengan panduan nutrisi tepat.",
    benefits: [
      "Meal plan personal",
      "Konseling ahli gizi",
      "Workout plan mingguan",
    ],
    prices: {
      Simple: {
        30: 299000,
        90: 749000,
        180: 1399000,
      },
      Intensif: {
        30: 499000,
        90: 1299000,
        180: 2499000,
      },
    },
  },
  "body-for-baby": {
    name: "Body for Baby",
    icon: "👶",
    desc: "Nutrisi optimal untuk persiapan kehamilan & menyusui.",
    benefits: [
      "Fokus kesuburan/ASI",
      "Konsultasi intensif",
      "Grup support eksklusif",
    ],
    prices: {
      Simple: {
        30: 349000,
        90: 899000,
        180: 1599000,
      },
      Intensif: {
        30: 599000,
        90: 1499000,
        180: 2799000,
      },
    },
  },
  clinicare: {
    name: "Clinicare",
    icon: "🩺",
    desc: "Manajemen diet untuk kondisi medis khusus (Diabetes, Hipertensi, dll).",
    benefits: [
      "Analisis lab klinis",
      "Pendampingan harian",
      "Prioritas utama",
    ],
    prices: {
      Simple: {
        30: 499000,
        90: 1299000,
        180: 2499000,
      },
      Intensif: {
        30: 799000,
        90: 2199000,
        180: 3999000,
      },
    },
  },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function PricingPage() {
  const [planType, setPlanType] = useState<PlanType>("Simple");
  const [activeTab, setActiveTab] = useState<ProgramType>("body-goals");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    description?: string;
    discount_value?: number;
    error?: string;
  } | null>(null);
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);

  const handleCheckPromo = async () => {
    if (!promoCode) return;
    setIsLoadingPromo(true);
    setPromoResult(null);

    try {
      const res = await fetch(buildApiUrl("/public/promo/check"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoResult({
          valid: true,
          description: data.description,
          discount_value: data.discount_value,
        });
        localStorage.setItem("applied_promo_code", promoCode);
      } else {
        setPromoResult({ valid: false, error: data.message || "Kode promo tidak valid." });
      }
    } catch (error) {
      console.error(error);
      setPromoResult({ valid: false, error: "Gagal memeriksa kode promo." });
    } finally {
      setIsLoadingPromo(false);
    }
  };

  const scrollToTable = () => {
    document.getElementById("tabel-harga")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-green-50 py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pilih Program yang Tepat untuk Kamu
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Harga transparan, tanpa biaya tersembunyi
          </p>
          
          <div className="inline-flex bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setPlanType("Simple")}
              className={`px-8 py-3 rounded-full text-lg font-medium transition-all ${
                planType === "Simple"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setPlanType("Intensif")}
              className={`px-8 py-3 rounded-full text-lg font-medium transition-all ${
                planType === "Intensif"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Intensif
            </button>
          </div>
        </div>
      </section>

      {/* 2. GRID PROGRAM */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.entries(programs) as [ProgramType, typeof programs[ProgramType]][]).map(
            ([key, program]) => (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{program.desc}</p>
                
                <div className="mb-6">
                  <span className="text-sm text-gray-500">Mulai dari</span>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(program.prices[planType][30])}
                    <span className="text-base font-normal text-gray-500">/bln</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {program.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      window.location.href = `/program/${key}`;
                    }}
                  >
                    Lihat Detail
                  </Button>
                  <Button
                    className="w-full justify-center"
                    onClick={() => {
                      setActiveTab(key);
                      scrollToTable();
                    }}
                  >
                    Pilih Paket
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* 3. TABEL HARGA DETAIL */}
      <section id="tabel-harga" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Detail Harga Program</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {(Object.entries(programs) as [ProgramType, typeof programs[ProgramType]][]).map(
            ([key, program]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-600 border hover:bg-green-50"
                }`}
              >
                {program.icon} {program.name}
              </button>
            )
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[30, 90, 180].map((days) => {
            const isPopular = days === 90;
            const price = programs[activeTab].prices[planType][days as 30 | 90 | 180];
            const pricePerMonth = price / (days / 30);

            return (
              <div
                key={days}
                className={`relative bg-white rounded-2xl p-8 flex flex-col ${
                  isPopular
                    ? "border-2 border-green-500 shadow-xl transform md:-translate-y-4"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                      Paling Populer
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Paket {days} Hari
                </h3>
                <p className="text-center text-gray-500 mb-6">
                  {days === 30 ? "1 Bulan" : days === 90 ? "3 Bulan" : "6 Bulan"}
                </p>

                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatPrice(price)}
                  </div>
                  {days > 30 && (
                    <div className="text-sm text-gray-500">
                      Lebih hemat! {formatPrice(pricePerMonth)} / bulan
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" /> Akses aplikasi penuh
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />{" "}
                      {planType === "Intensif" ? "Konseling 4x/bulan" : "Konseling 1x/bulan"}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />{" "}
                      {planType === "Intensif" ? "Chat Setiap hari" : "Chat 3 hari/minggu"}
                    </li>
                  </ul>
                </div>

                <Link href={`/checkout?program=${activeTab}&plan=${planType}&duration=${days}`} className="w-full">
                  <Button className="w-full justify-center" variant={isPopular ? "primary" : "outline"}>
                    Beli Sekarang
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION KODE PROMO */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Punya kode promo?</h3>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode promo"
              className="uppercase"
            />
            <Button onClick={handleCheckPromo} disabled={isLoadingPromo || !promoCode}>
              {isLoadingPromo ? "Cek..." : "Terapkan"}
            </Button>
          </div>
          {promoResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${promoResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {promoResult.valid ? (
                <div className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  {promoResult.description}
                </div>
              ) : (
                <div className="flex items-center">
                  <X className="w-4 h-4 mr-2" />
                  {promoResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. PERBANDINGAN SIMPLE vs INTENSIF */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Bandingkan Simple & Intensif</h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold text-gray-900">Fitur</th>
                <th className="p-4 font-bold text-gray-900 text-center">Simple</th>
                <th className="p-4 font-bold text-green-900 text-center bg-green-100">Intensif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-4 text-gray-700">Konseling Video Call</td>
                <td className="p-4 text-center text-gray-600">1x/bulan</td>
                <td className="p-4 text-center text-green-800 bg-green-50 font-medium">4x/bulan</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Chat Konsultasi</td>
                <td className="p-4 text-center text-gray-600">3 hari/minggu</td>
                <td className="p-4 text-center text-green-800 bg-green-50 font-medium">Setiap hari</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Meal Plan</td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center bg-green-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Materi Coaching</td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center bg-green-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Workout Plan</td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center bg-green-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Sesi Fitness Trainer</td>
                <td className="p-4 text-center text-gray-600">2x/bulan</td>
                <td className="p-4 text-center text-green-800 bg-green-50 font-medium">8x/bulan</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Coaching Group</td>
                <td className="p-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center bg-green-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Prioritas Respons</td>
                <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                <td className="p-4 text-center bg-green-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. JAMINAN & KEPERCAYAAN */}
      <section className="bg-white py-12 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-10 h-10 text-green-600 mb-3" />
              <h4 className="font-bold text-gray-900 text-sm">Pembayaran Aman</h4>
              <p className="text-xs text-gray-500 mt-1">via Midtrans</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Star className="w-10 h-10 text-yellow-400 mb-3" />
              <h4 className="font-bold text-gray-900 text-sm">4.9/5 Rating</h4>
              <p className="text-xs text-gray-500 mt-1">dari 500+ klien</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Award className="w-10 h-10 text-blue-500 mb-3" />
              <h4 className="font-bold text-gray-900 text-sm">Ahli Gizi Tersertifikasi</h4>
              <p className="text-xs text-gray-500 mt-1">Terdaftar di MTKI</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MessageCircle className="w-10 h-10 text-green-500 mb-3" />
              <h4 className="font-bold text-gray-900 text-sm">Support 7 Hari</h4>
              <p className="text-xs text-gray-500 mt-1">Siap membantu Anda</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="bg-green-600 py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Masih bingung? Konsultasi gratis dulu!</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
            Tim kami siap membantu Anda memilih program yang paling sesuai dengan kebutuhan dan target Anda.
          </p>
          <WaButton 
            phoneNumber="6281234567890" 
            message="Halo, saya ingin konsultasi gratis untuk memilih program DietCare."
            label="Chat WhatsApp Sekarang"
            variant="solid"
            className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg rounded-full font-bold shadow-lg border-0"
          />
        </div>
      </section>
    </div>
  );
}
