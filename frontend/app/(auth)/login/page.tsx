'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier || !password) {
      setError('Mohon isi email/username dan password.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(loginIdentifier, password);
      if (!result.success) {
        setError(result.message || 'Login gagal. Periksa kembali kredensial Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const waLink = 'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo Admin DietCare, saya ingin berkonsultasi gratis.');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  } satisfies Variants;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  } satisfies Variants;

  return (
    <div className="min-h-screen flex bg-[var(--background)] transition-colors duration-500 relative overflow-hidden">
      <Scene3DBackground subtle />
      
      <div className="absolute right-6 top-6 z-50 flex items-center gap-4">
        <ThemeToggle />
      </div>

      {/* LEFT: FORM SECTION */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative flex flex-1 flex-col justify-center px-6 py-12 lg:max-w-[560px] bg-[var(--background-elevated)]/40 backdrop-blur-3xl border-r border-[var(--border-color)] z-10"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto w-full max-w-md">
          {/* Brand Logo */}
          <motion.div variants={itemVariants} className="mb-12">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter text-[var(--foreground)] block">DietCare</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Premium Health</span>
              </div>
            </Link>
          </motion.div>

          {/* Link Beranda */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 text-lg font-semibold text-[var(--foreground)] hover:text-brand-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiArrowLeft className="w-5 h-5 text-brand-600" />
                Beranda
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
              Selamat datang <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">kembali 👋</span>
            </h1>
            <p className="mt-4 text-[var(--muted-foreground)] font-medium text-lg">
              Masuk untuk melanjutkan perjalanan sehatmu hari ini.
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-8 flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <FiAlertCircle size={20} />
                </div>
                <span className="font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-black text-[var(--muted-foreground)] mb-3 uppercase tracking-[0.2em] ml-1">Email atau Username</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-green-500 transition-colors">
                  <FiMail size={20} />
                </div>
                <input
                  type="text"
                  placeholder="nama@email.com atau username"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)] text-[var(--foreground)] font-bold text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none placeholder:text-[var(--muted-foreground)]/50 shadow-inner"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-xs font-black text-[var(--muted-foreground)] mb-3 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-green-500 transition-colors">
                  <FiLock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-14 pl-14 pr-14 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)] text-[var(--foreground)] font-bold text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none placeholder:text-[var(--muted-foreground)]/50 shadow-inner"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-green-500 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only" 
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-[var(--border-color)] bg-[var(--background-soft)]'}`}>
                    {rememberMe && <FiCheckCircle size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Ingat saya</span>
              </label>
              <Link href="/forgot-password" className="text-xs font-black text-green-500 hover:text-green-400 tracking-tight">
                Lupa password?
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk Sekarang
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Social Logins */}
          <motion.div variants={itemVariants} className="mt-10">
            <div className="relative flex items-center gap-4 mb-8">
              <div className="h-px flex-grow bg-[var(--border-color)]" />
              <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.3em]">atau masuk dengan</span>
              <div className="h-px flex-grow bg-[var(--border-color)]" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <FcGoogle size={24} />, label: 'Google' },
                { icon: <FaApple size={24} className="text-[var(--foreground)]" />, label: 'Apple' },
                { icon: <FiGithub size={24} className="text-[var(--foreground)]" />, label: 'GitHub' },
              ].map((social, i) => (
                <button 
                  key={i}
                  type="button"
                  className="h-14 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--background-elevated)] hover:border-green-500/30 hover:-translate-y-1 transition-all shadow-sm group"
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {social.icon}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-12 text-center text-sm font-bold text-[var(--muted-foreground)]">
            Belum memiliki akun?{' '}
            <Link href="/register" className="text-green-500 hover:text-green-400 font-black tracking-tight underline underline-offset-4 decoration-2 decoration-green-500/30">
              Daftar Gratis
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* RIGHT: VISUAL SECTION */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/40 via-slate-900 to-emerald-950/40" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px]" 
          />
        </div>

        <TiltCard className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-16 shadow-2xl overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
          
          <div className="flex flex-col items-center text-center">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-12 w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-4xl shadow-inner">
                🥗
              </div>
            </motion.div>

            <h2 className="text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Health Game</span>
            </h2>
            
            <p className="text-slate-400 text-lg font-medium max-w-sm mb-12 leading-relaxed">
              Platform gizi pintar dengan analisis AI dan pendampingan ahli gizi profesional.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {[
                { icon: '📊', text: 'Real-time Nutrition Analytics' },
                { icon: '👩‍⚕️', text: 'Certified Nutritionist Consultation' },
                { icon: '🏆', text: 'Personalized Meal Plans' },
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                >
                  <span className="text-2xl">{feat.icon}</span>
                  <span className="text-sm font-black text-slate-200 uppercase tracking-widest">{feat.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 flex gap-12 pt-12 border-t border-white/10 w-full justify-center">
              {[
                { v: '50k+', l: 'Users' },
                { v: '4.9/5', l: 'Rating' },
                { v: '100+', l: 'Recipes' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-white tracking-tighter">{stat.v}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Floating Support Button */}
      <a 
        href={waLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] group flex items-center gap-4"
      >
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-[var(--border-color)] shadow-2xl opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Butuh Bantuan?</p>
          <p className="text-sm font-black text-[var(--foreground)]">Chat Admin</p>
        </div>
        <div className="w-16 h-16 rounded-[1.75rem] bg-[#25D366] text-white flex items-center justify-center shadow-[0_20px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_25px_50px_rgba(37,211,102,0.4)] hover:-translate-y-2 transition-all duration-500 text-3xl">
          <FaWhatsapp />
        </div>
      </a>
    </div>
  );
}
