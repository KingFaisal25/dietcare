"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo, FiChevronRight, FiCheckCircle } from "react-icons/fi";

const PYRAMID_DATA = [
  {
    id: "top",
    name: "Lemak & Gula",
    color: "bg-red-500",
    border: "border-red-200",
    text: "text-red-700",
    bg: "bg-red-50",
    desc: "Konsumsi secukupnya. Hindari lemak trans dan gula berlebih.",
    examples: ["Minyak", "Mentega", "Permen", "Soda"],
    points: "180,40 120,120 280,120",
    height: 80,
  },
  {
    id: "middle-top",
    name: "Protein & Produk Susu",
    color: "bg-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    bg: "bg-amber-50",
    desc: "Penting untuk pertumbuhan otot dan kepadatan tulang.",
    examples: ["Daging", "Ikan", "Telur", "Susu", "Keju"],
    points: "120,120 80,200 320,200 280,120",
    height: 80,
  },
  {
    id: "middle-bottom",
    name: "Sayur & Buah",
    color: "bg-green-500",
    border: "border-green-200",
    text: "text-green-700",
    bg: "bg-green-50",
    desc: "Sumber serat, vitamin, dan mineral esensial.",
    examples: ["Bayam", "Wortel", "Apel", "Pisang", "Jeruk"],
    points: "80,200 40,300 360,300 320,200",
    height: 100,
  },
  {
    id: "bottom",
    name: "Karbohidrat Kompleks",
    color: "bg-blue-500",
    border: "border-blue-200",
    text: "text-blue-700",
    bg: "bg-blue-50",
    desc: "Sumber energi utama tubuh. Pilih biji-bijian utuh.",
    examples: ["Nasi Merah", "Gandum", "Kentang", "Jagung"],
    points: "40,300 0,420 400,420 360,300",
    height: 120,
  },
];

export function NutritionPyramid() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-4 border border-green-100">
            Edukasi Nutrisi
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Piramida Makanan <span className="text-green-600">Interaktif</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Klik atau arahkan kursor pada setiap bagian piramida untuk mempelajari porsi gizi seimbang yang direkomendasikan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          {/* Pyramid Visualization with 3D Depth */}
          <div className="relative flex justify-center perspective-[1000px]">
            <motion.div
              animate={{ 
                rotateX: activeSegment ? 5 : 10,
                rotateY: activeSegment ? -5 : -10,
                scale: 1.02
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-[550px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <svg
                viewBox="0 0 400 450"
                className="w-full h-auto drop-shadow-[0_50px_60px_rgba(0,0,0,0.1)]"
              >
                <defs>
                  <filter id="shadow-3d" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                    <feOffset dx="0" dy="10" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Gradients for segments */}
                  {PYRAMID_DATA.map(s => (
                    <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  ))}
                </defs>

                {PYRAMID_DATA.map((segment, index) => (
                  <g key={segment.id} className="group/segment">
                    <motion.polygon
                      points={segment.points}
                      initial={false}
                      animate={{
                        scale: activeSegment === segment.id ? 1.05 : 1,
                        opacity: activeSegment && activeSegment !== segment.id ? 0.4 : 1,
                        filter: activeSegment === segment.id ? "url(#shadow-3d)" : "none",
                        translateZ: activeSegment === segment.id ? 50 : 0
                      }}
                      onMouseEnter={() => setActiveSegment(segment.id)}
                      onMouseLeave={() => setActiveSegment(null)}
                      className={`cursor-pointer transition-all duration-500 ${
                        activeSegment === segment.id
                          ? segment.color
                          : index % 2 === 0
                          ? "fill-slate-100"
                          : "fill-slate-200"
                      }`}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1"
                    />
                    {/* Inner highlight for 3D effect */}
                    <polygon
                      points={segment.points}
                      fill={`url(#grad-${segment.id})`}
                      className="pointer-events-none"
                    />
                  </g>
                ))}
              </svg>

              {/* Enhanced Labels on the pyramid */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {PYRAMID_DATA.map((segment, i) => (
                  <div
                    key={segment.id}
                    style={{ height: segment.height }}
                    className="w-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        opacity: activeSegment === segment.id ? 1 : 0.6,
                        scale: activeSegment === segment.id ? 1.15 : 1,
                        translateZ: activeSegment === segment.id ? 80 : 0
                      }}
                      className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                        activeSegment === segment.id ? "text-white" : "text-slate-500"
                      }`}
                    >
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-center px-4">
                        {segment.name}
                      </span>
                      {activeSegment === segment.id && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: 40 }}
                          className="h-1 bg-white/50 rounded-full"
                        />
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating Decorations */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Info Panel */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeSegment ? (
                <motion.div
                  key={activeSegment}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-10 rounded-[2.5rem] border h-full ${
                    PYRAMID_DATA.find((s) => s.id === activeSegment)?.bg
                  } ${PYRAMID_DATA.find((s) => s.id === activeSegment)?.border}`}
                >
                  {(() => {
                    const segment = PYRAMID_DATA.find((s) => s.id === activeSegment)!;
                    return (
                      <>
                        <div className="flex items-center gap-4 mb-8">
                          <div className={`p-3 rounded-2xl bg-white shadow-sm ${segment.text}`}>
                            <FiInfo size={24} />
                          </div>
                          <h3 className={`text-2xl font-black ${segment.text}`}>
                            {segment.name}
                          </h3>
                        </div>
                        
                        <p className="text-slate-700 text-lg leading-relaxed mb-10">
                          {segment.desc}
                        </p>

                        <div className="space-y-6">
                          <h4 className={`text-xs font-black uppercase tracking-widest ${segment.text}`}>
                            Contoh Makanan:
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {segment.examples.map((ex) => (
                              <span
                                key={ex}
                                className="px-5 py-2.5 rounded-xl bg-white font-bold text-slate-700 shadow-sm flex items-center gap-2 border border-slate-100"
                              >
                                <FiCheckCircle className={segment.text} />
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-black/5">
                          <button className={`flex items-center gap-2 font-black text-sm uppercase tracking-widest ${segment.text} group`}>
                            Lihat Menu Rekomendasi 
                            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed"
                >
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                    <FiInfo size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-400 mb-4">Pilih Bagian Piramida</h3>
                  <p className="text-slate-400 font-medium">
                    Arahkan kursor pada piramida untuk melihat detail nutrisi setiap kelompok makanan.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
