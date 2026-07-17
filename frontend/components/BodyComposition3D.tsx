"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiActivity, FiDroplet, FiZap, FiUser } from "react-icons/fi";

export function BodyComposition3D() {
  const [fat, setFat] = useState(20);
  const [muscle, setMuscle] = useState(40);
  const [water, setWater] = useState(60);

  return (
    <div className="py-24 bg-slate-50 rounded-[4rem] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100">
            Interactive Tracker
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Visualisasi <span className="text-blue-600">Komposisi Tubuh</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Simulasikan komposisi tubuh ideal Anda. Pahami bagaimana lemak, otot, dan air mempengaruhi profil kesehatan Anda secara visual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Controls */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-widest text-xs">
                  <FiActivity className="text-red-500" /> Lemak Tubuh
                </label>
                <span className="text-2xl font-black text-red-500">{fat}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={fat}
                onChange={(e) => setFat(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-xs text-slate-400 font-bold">Rata-rata ideal: 15-25% (Pria), 20-30% (Wanita)</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-widest text-xs">
                  <FiZap className="text-amber-500" /> Massa Otot
                </label>
                <span className="text-2xl font-black text-amber-500">{muscle}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={muscle}
                onChange={(e) => setMuscle(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs text-slate-400 font-bold">Meningkatkan metabolisme basal tubuh Anda.</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-widest text-xs">
                  <FiDroplet className="text-blue-500" /> Kadar Air
                </label>
                <span className="text-2xl font-black text-blue-500">{water}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="80"
                value={water}
                onChange={(e) => setWater(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-400 font-bold">Hidrasi optimal penting untuk fungsi organ dan kulit.</p>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="relative flex justify-center order-1 lg:order-2 group/viz">
            <div className="relative w-full max-w-[420px] aspect-[1/1.6] bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-white/80 flex items-center justify-center p-12 overflow-hidden backdrop-blur-sm">
              {/* 3D Background Lighting */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-green-50/50" />
              <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-blue-100/30 rounded-full blur-[100px] animate-pulse" />
              <div className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-green-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

              <svg viewBox="0 0 200 350" className="w-full h-full relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
                <defs>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f8fafc" />
                  </linearGradient>
                  
                  <filter id="3d-depth" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                      <fePointLight x="-5000" y="-10000" z="20000" />
                    </feSpecularLighting>
                    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                    <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litGraphic" />
                    <feMerge>
                      <feMergeNode in="offsetBlur" />
                      <feMergeNode in="litGraphic" />
                    </feMerge>
                  </filter>

                  <clipPath id="bodyClip">
                    <path d="M100,20 C115,20 125,35 125,55 C125,75 115,85 100,85 C85,85 75,75 75,55 C75,35 85,20 100,20 M100,85 L120,100 L140,180 L130,220 L100,180 L70,220 L60,180 L80,100 Z M100,180 L110,240 L120,330 L100,330 L80,330 L90,240 Z" />
                  </clipPath>
                </defs>

                {/* Base Body with 3D Filter */}
                <path 
                  d="M100,20 C115,20 125,35 125,55 C125,75 115,85 100,85 C85,85 75,75 75,55 C75,35 85,20 100,20 M100,85 L120,100 L140,180 L130,220 L100,180 L70,220 L60,180 L80,100 Z M100,180 L110,240 L120,330 L100,330 L80,330 L90,240 Z" 
                  fill="url(#bodyGradient)"
                  filter="url(#3d-depth)"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                {/* Muscle Layer (Amber) */}
                <motion.rect
                  animate={{ height: `${muscle}%`, y: 330 - (330 * muscle / 100) }}
                  x="0" y="0" width="200" height="350"
                  fill="#fbbf24"
                  opacity="0.4"
                  clipPath="url(#bodyClip)"
                />

                {/* Water Layer (Blue) */}
                <motion.rect
                  animate={{ height: `${water}%`, y: 330 - (330 * water / 100) }}
                  x="0" y="0" width="200" height="350"
                  fill="#3b82f6"
                  opacity="0.3"
                  clipPath="url(#bodyClip)"
                />

                {/* Fat Overlay (Red Glow) */}
                <motion.path
                  animate={{ 
                    strokeWidth: fat / 4,
                    opacity: fat / 100
                  }}
                  d="M100,20 C115,20 125,35 125,55 C125,75 115,85 100,85 C85,85 75,75 75,55 C75,35 85,20 100,20 M100,85 L120,100 L140,180 L130,220 L100,180 L70,220 L60,180 L80,100 Z M100,180 L110,240 L120,330 L100,330 L80,330 L90,240 Z" 
                  fill="none"
                  stroke="#ef4444"
                />
              </svg>

              {/* Enhanced Data Overlays */}
              <div className="absolute top-10 left-10 space-y-4">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg">
                    <FiZap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Muscle</p>
                    <p className="text-sm font-black text-slate-900">{muscle}%</p>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg">
                    <FiDroplet size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Water</p>
                    <p className="text-sm font-black text-slate-900">{water}%</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-10 right-10 text-right">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-green-500 text-white px-6 py-2 rounded-2xl shadow-xl border border-green-400 font-black text-sm tracking-widest"
                >
                  HEALTHY
                </motion.div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Status: Optimal</p>
              </div>
            </div>

            {/* Floating 3D Icon */}
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotateZ: [0, 5, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-blue-600 border border-slate-50 relative z-20"
            >
              <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] animate-pulse" />
              <FiUser size={40} className="relative z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
