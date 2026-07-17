"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, Star, Award, MessageCircle, ArrowRight, Zap, Target, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WaButton } from "@/components/ui/WaButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { buildApiUrl } from "@/lib/url";

type PlanType = "Simple" | "Intensif";
type ProgramType = "body-goals" | "body-for-baby" | "clinicare";

const programs = {
  "body-goals": {
    name: "Body Goals",
    icon: <Target className="w-8 h-8 text-green-600" />,
    desc: "Transformasi berat badan ideal dengan panduan nutrisi berbasis sains.",
    benefits: [
      "Personalized Meal Plan",
      "Konseling Ahli Gizi Berlisensi",
      "Customized Workout Strategy",
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
    color: "green"
  },
  "body-for-baby": {
    name: "Body for Baby",
    icon: <Heart className="w-8 h-8 text-pink-500" />,
    desc: "Optimalkan nutrisi untuk masa kehamilan, menyusui, dan kesehatan janin.",
    benefits: [
      "Fokus Kesuburan & ASI",
      "Pemantauan Nutrisi Janin",
      "Grup Support Ibu Eksklusif",
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
    color: "pink"
  },
  clinicare: {
    name: "Clinicare",
    icon: <Activity className="w-8 h-8 text-blue-600" />,
    desc: "Diet terapeutik untuk kondisi medis khusus (Diabetes, Hipertensi, GERD).",
    benefits: [
      "Analisis Data Lab Klinis",
      "Dietary Management Medis",
      "Pendampingan Intensif 24/7",
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
    color: "blue"
  },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  }
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
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-hidden">
      {/* 1. HERO SECTION - Premium & Clean */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary-foreground text-sm font-bold tracking-wider uppercase mb-6 border border-primary/20">
              Pilihan Investasi Kesehatan
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
              Investasi Terbaik Adalah <br />
              <span className="text-primary">Kesehatan Anda</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Pilih program yang dirancang khusus oleh ahli gizi profesional untuk membantu Anda mencapai target kesehatan dengan cara yang berkelanjutan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="inline-flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-1.5 shadow-inner border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setPlanType("Simple")}
                  className={`px-10 py-3.5 rounded-xl text-lg font-bold transition-all duration-300 ${
                    planType === "Simple"
                      ? "bg-white dark:bg-slate-900 text-primary shadow-xl"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setPlanType("Intensif")}
                  className={`px-10 py-3.5 rounded-xl text-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                    planType === "Intensif"
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Zap className={`w-5 h-5 ${planType === "Intensif" ? "text-yellow-300" : "text-slate-400"}`} />
                  Intensif
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. PROGRAM OVERVIEW GRID */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {(Object.entries(programs) as [ProgramType, typeof programs[ProgramType]][]).map(
              ([key, program]) => (
                <motion.div key={key} variants={itemVariants}>
                  <TiltCard className="h-full bg-card rounded-3xl p-8 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col group hover:border-primary/30 transition-colors">
                    <div className="p-4 bg-muted rounded-2xl w-fit mb-6 group-hover:bg-primary/10 transition-colors">
                      {program.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{program.name}</h3>
                    <p className="text-muted-foreground mb-8 leading-relaxed flex-grow">{program.desc}</p>
                    
                    <div className="mb-8 pt-6 border-t border-border">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mulai dari</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-foreground">
                          {formatPrice(program.prices[planType][30])}
                        </span>
                        <span className="text-muted-foreground font-medium">/30 hari</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {program.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start text-foreground group/item">
                          <div className="mt-1 mr-3 p-0.5 rounded-full bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-sm md:text-base">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 mt-auto">
                      <Button
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/10 group-hover:shadow-primary/20"
                        onClick={() => {
                          setActiveTab(key);
                          scrollToTable();
                        }}
                      >
                        Pilih Paket
                      </Button>
                      <Link href={`/program/${key}`} className="block">
                        <Button
                          variant="ghost"
                          className="w-full h-12 rounded-xl text-muted-foreground hover:text-primary group/link"
                        >
                          Pelajari Program 
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </TiltCard>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* 3. DETAILED PRICING SELECTOR */}
      <section id="tabel-harga" className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Pilih Durasi Program</h2>
            <p className="text-muted-foreground text-lg">Pilih durasi yang sesuai dengan komitmen target Anda.</p>
          </div>
          
          {/* Tabs - Glassmorphism */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {(Object.entries(programs) as [ProgramType, typeof programs[ProgramType]][]).map(
              ([key, program]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 border ${
                    activeTab === key
                      ? "bg-card text-primary border-primary/20 shadow-[0_10px_30px_rgba(34,197,94,0.1)]"
                      : "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${activeTab === key ? "bg-primary/10" : "bg-muted"}`}>
                    {program.icon}
                  </div>
                  {program.name}
                </button>
              )
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[30, 90, 180].map((days) => {
              const isPopular = days === 90;
              const price = programs[activeTab].prices[planType][days as 30 | 90 | 180];
              const pricePerMonth = price / (days / 30);
              const originalPrice = programs[activeTab].prices[planType][30] * (days / 30);
              const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

              return (
                <motion.div
                  key={days}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`relative bg-card rounded-[2rem] p-10 flex flex-col transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] ${
                    isPopular
                      ? "border-2 border-primary md:scale-105 z-10 shadow-[0_20px_60px_rgba(34,197,94,0.15)]"
                      : "border border-border shadow-sm"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase shadow-xl">
                        Paling Populer
                      </span>
                    </div>
                  )}

                  {discountPercent > 0 && (
                    <div className="absolute top-6 right-6">
                      <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-black">
                        HEMAT {discountPercent}%
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-2">
                      {days} Hari
                    </h3>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      {days === 30 ? "Starter" : days === 90 ? "Commitment" : "Lifestyle"}
                    </p>
                  </div>

                  <div className="text-center mb-10">
                    <div className="text-4xl md:text-5xl font-black text-foreground mb-3">
                      {formatPrice(price)}
                    </div>
                    {days > 30 && (
                      <div className="inline-block px-4 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        Hanya {formatPrice(Math.round(pricePerMonth))} / bln
                      </div>
                    )}
                  </div>

                  <div className="flex-grow space-y-6 mb-10">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center border-b border-border pb-4">
                      Fitur {planType} Termasuk:
                    </p>
                    <ul className="space-y-5">
                      <li className="flex items-center text-foreground font-medium">
                        <Check className="w-5 h-5 text-primary mr-4 flex-shrink-0" /> 
                        Akses Full DietCare App
                      </li>
                      <li className="flex items-center text-foreground font-medium">
                        <Check className="w-5 h-5 text-primary mr-4 flex-shrink-0" /> 
                        {planType === "Intensif" ? "Konseling 4x/bulan" : "Konseling 1x/bulan"}
                      </li>
                      <li className="flex items-center text-foreground font-medium">
                        <Check className="w-5 h-5 text-primary mr-4 flex-shrink-0" /> 
                        {planType === "Intensif" ? "Dukungan Chat 24/7" : "Chat 3 hari/minggu"}
                      </li>
                      <li className="flex items-center text-foreground font-medium">
                        <Check className="w-5 h-5 text-primary mr-4 flex-shrink-0" /> 
                        Laporan Progress Mingguan
                      </li>
                    </ul>
                  </div>

                  <Link href={`/checkout?program=${activeTab}&plan=${planType}&duration=${days}`} className="w-full mt-auto">
                    <Button 
                      className={`w-full h-16 rounded-2xl text-lg font-black transition-all duration-300 ${
                        isPopular 
                          ? "bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20" 
                          : "bg-foreground hover:bg-foreground/90 text-background"
                      }`}
                    >
                      Beli Sekarang
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PROMO CODE SECTION - Modern Floating UI */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-card p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-4">
                <Zap className="w-6 h-6 fill-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Hemat Lebih Banyak!</h3>
              <p className="text-muted-foreground">Punya kode promo? Masukkan di bawah untuk diskon instan.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative group">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="KODEPROMO2024"
                  className="h-14 bg-muted border-transparent focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-6 text-lg font-bold tracking-widest uppercase placeholder:normal-case placeholder:font-medium placeholder:tracking-normal transition-all"
                />
              </div>
              <Button 
                onClick={handleCheckPromo} 
                disabled={isLoadingPromo || !promoCode}
                className="h-14 px-10 rounded-xl font-bold text-lg transition-transform active:scale-95"
              >
                {isLoadingPromo ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Cek...
                  </div>
                ) : "Terapkan"}
              </Button>
            </div>

            <AnimatePresence>
              {promoResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-6 p-5 rounded-2xl border ${
                    promoResult.valid 
                      ? 'bg-success/10 border-success/20 text-success-foreground' 
                      : 'bg-destructive/10 border-destructive/20 text-destructive-foreground'
                  }`}
                >
                  <div className="flex items-center font-bold">
                    {promoResult.valid ? (
                      <>
                        <div className="p-1 bg-success rounded-full text-success-foreground mr-3">
                          <Check className="w-4 h-4" />
                        </div>
                        {promoResult.description}
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-destructive rounded-full text-destructive-foreground mr-3">
                          <X className="w-4 h-4" />
                        </div>
                        {promoResult.error}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. FEATURE COMPARISON - Premium Table */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Detail Perbandingan Paket</h2>
            <p className="text-muted-foreground text-lg">Bandingkan fitur lengkap antara paket Simple dan Intensif.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-[0_40px_100px_rgba(0,0,0,0.06)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-8 py-10 text-foreground font-black text-xl">Fitur Utama</th>
                    <th className="px-8 py-10 text-center">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs block mb-2">Basic</span>
                      <span className="text-foreground font-black text-2xl">Simple</span>
                    </th>
                    <th className="px-8 py-10 text-center bg-primary relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
                      <span className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs block mb-2">Premium</span>
                      <span className="text-primary-foreground font-black text-2xl">Intensif</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { label: "Konseling Video Call", simple: "1x / bulan", intensif: "4x / bulan (Mingguan)", highlight: true },
                    { label: "Dukungan Chat Konsultasi", simple: "3 hari / minggu", intensif: "Setiap hari (Prioritas)", highlight: true },
                    { label: "Personalized Meal Plan", simple: true, intensif: true },
                    { label: "E-Materi Coaching Eksklusif", simple: true, intensif: true },
                    { label: "Workout Plan Terpersonalisasi", simple: true, intensif: true },
                    { label: "Sesi Fitness Trainer", simple: "2x / bulan", intensif: "8x / bulan" },
                    { label: "Akses Coaching Group", simple: true, intensif: true },
                    { label: "Prioritas Respons Admin", simple: false, intensif: true },
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-foreground">{row.label}</td>
                      <td className="px-8 py-6 text-center text-muted-foreground font-medium">
                        {typeof row.simple === "boolean" ? (
                          row.simple ? <Check className="w-6 h-6 text-primary mx-auto" /> : <X className="w-6 h-6 text-muted-foreground mx-auto" />
                        ) : row.simple}
                      </td>
                      <td className={`px-8 py-6 text-center font-bold ${row.highlight ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                        {typeof row.intensif === "boolean" ? (
                          row.intensif ? <Check className="w-6 h-6 text-primary mx-auto" /> : <X className="w-6 h-6 text-muted-foreground mx-auto" />
                        ) : row.intensif}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST INDICATORS - Minimalist & Modern */}
      <section className="py-24 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Pembayaran Aman</h4>
              <p className="text-sm text-muted-foreground">Enkripsi standar bank via Midtrans</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Rating 4.9/5</h4>
              <p className="text-sm text-muted-foreground">Kepuasan dari 500+ alumni program</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Ahli Gizi Berlisensi</h4>
              <p className="text-sm text-muted-foreground">Tersertifikasi STR dan terdaftar MTKI</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Dukungan 7 Hari</h4>
              <p className="text-sm text-muted-foreground">Tim support responsif setiap hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION - High Impact */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-10" />
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-6">Mulai Perjalanan Anda Hari Ini</h2>
            <p className="text-primary-foreground/80 text-xl mb-12 leading-relaxed">
              Masih ragu memilih program? Konsultasi gratis dengan tim kami untuk menemukan solusi terbaik bagi kesehatan Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <WaButton 
                phoneNumber="6281234567890" 
                message="Halo, saya ingin konsultasi gratis untuk memilih program DietCare."
                label="Konsultasi Gratis Sekarang"
                variant="solid"
                className="bg-white text-primary hover:bg-muted h-16 px-12 text-lg rounded-2xl font-black shadow-2xl shadow-primary/20 border-0 transition-all hover:scale-105"
              />
              <p className="text-primary-foreground/70 font-medium">
                Respon cepat via WhatsApp
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
