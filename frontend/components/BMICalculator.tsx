"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { TiltCard } from './ui/TiltCard';
import { FiInfo, FiActivity, FiArrowRight } from 'react-icons/fi';

export const BMICalculator = () => {
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(170);
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(bmiValue.toFixed(1)));

    if (bmiValue < 18.5) {
      setStatus('Berat Badan Kurang');
      setColor('text-blue-500');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setStatus('Normal (Ideal)');
      setColor('text-brand-600');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setStatus('Kelebihan Berat Badan');
      setColor('text-warning');
    } else {
      setStatus('Obesitas');
      setColor('text-danger');
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [weight, height]);

  return (
    <TiltCard className="surface-panel rounded-[2.5rem] p-8 md:p-12 shadow-float border-white/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Inputs */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">Kalkulator BMI</h3>
            <p className="text-neutral-500 font-medium">Ketahui indeks massa tubuh Anda dalam hitungan detik.</p>
          </div>

          <div className="space-y-10">
            {/* Weight Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Berat Badan</label>
                <span className="text-2xl font-black text-brand-600">{weight} <span className="text-sm font-bold text-neutral-400">kg</span></span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            {/* Height Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Tinggi Badan</label>
                <span className="text-2xl font-black text-brand-600">{height} <span className="text-sm font-bold text-neutral-400">cm</span></span>
              </div>
              <input
                type="range"
                min="100"
                max="220"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl border border-brand-100">
            <FiInfo className="text-brand-600 shrink-0" size={20} />
            <p className="text-xs font-medium text-brand-700 leading-relaxed">
              BMI (Body Mass Index) adalah indikator sederhana dari lemak tubuh untuk orang dewasa.
            </p>
          </div>
        </div>

        {/* Right Side: Visualization Area */}
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden min-h-[450px]">
          {/* 3D-like Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 270, 180, 90, 0],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={bmi}
              initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -45 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="relative z-10 text-center space-y-8"
              style={{ perspective: "1000px" }}
            >
              {/* 3D Gauge Effect */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-110" />
                <svg className="w-56 h-56 transform -rotate-90 drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]">
                  {/* Outer glow ring */}
                  <circle
                    cx="112"
                    cy="112"
                    r="104"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    className="opacity-50"
                  />
                  {/* Main track */}
                  <circle
                    cx="112"
                    cy="112"
                    r="92"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-neutral-100/80"
                  />
                  {/* Progress ring with gradient */}
                  <defs>
                    <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="92"
                    stroke="currentColor"
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={578}
                    initial={{ strokeDashoffset: 578 }}
                    animate={{ strokeDashoffset: 578 - (Math.min(bmi || 0, 40) / 40) * 578 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={color}
                  />
                </svg>
                
                {/* Floating Value Card */}
                <motion.div 
                  initial={{ z: 0 }}
                  whileHover={{ z: 50 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl border border-white flex flex-col items-center">
                    <motion.span 
                      key={bmi}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-6xl font-black text-neutral-900 leading-none"
                    >
                      {bmi}
                    </motion.span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-2">Indeks Massa</span>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-2">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`inline-block px-6 py-2 rounded-full bg-white shadow-sm border border-neutral-100 text-lg font-black ${color}`}
                >
                  {status}
                </motion.div>
                <p className="text-sm font-bold text-neutral-500/80 uppercase tracking-widest">Kategori Kesehatan</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-neutral-100 w-full">
            <Link href="/program/body-goals" className="w-full">
              <Button className="w-full group h-12">
                Lihat Rekomendasi Program
                <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

import Link from 'next/link';
