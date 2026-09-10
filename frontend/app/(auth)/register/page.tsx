'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiAtSign,
  FiPhone
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { getGoogleLoginUrl } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.password_confirmation) {
      setError('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setFieldErrors({ username: ['Username hanya boleh huruf, angka, strip, dan underscore.'] });
      return;
    }
    if (formData.password.length < 8) {
      setFieldErrors({ password: ['Password minimal 8 karakter.'] });
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setFieldErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] });
      return;
    }
    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    if (result.success) {
      setIsSuccess(true);
    } else {
      if ('errors' in result && result.errors) {
        setFieldErrors(result.errors as Record<string, string[]>);
      }
      setError(result.message || 'Mendaftar gagal. Periksa kembali form Anda.');
    }
    setIsLoading(false);
  };

  const waLink = 'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo Admin DietCare, saya ingin bertanya tentang pendaftaran.');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  } satisfies Variants;

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  } satisfies Variants;

  const Field = ({ id, label, name, type = 'text', placeholder, autoComplete, value, icon, error: ferr }: {
    id: string;
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    autoComplete?: string;
    value: string;
    icon: React.ReactNode;
    error?: string;
  }) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-black text-[var(--muted-foreground)] mb-3 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-green-500 transition-colors">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`w-full h-14 pl-14 pr-6 rounded-2xl bg-[var(--background-soft)] border ${ferr ? 'border-red-500/50' : 'border-[var(--border-color)]'} text-[var(--foreground)] font-bold text-sm focus:ring-2 ${ferr ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-green-500/20 focus:border-green-500'} transition-all outline-none placeholder:text-[var(--muted-foreground)]/50 shadow-inner`}
        />
      </div>
      {ferr && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{ferr}</p>}
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6 relative overflow-hidden">
        <Scene3DBackground subtle />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center bg-[var(--background-elevated)]/40 backdrop-blur-3xl border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-2xl relative z-10"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-green-500/10 border border-green-500/20 text-green-500">
            <FiCheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] mb-3 tracking-tight">Pendaftaran Berhasil! 🎉</h1>
          <p className="text-[var(--muted-foreground)] font-medium text-base mb-6">Akun Anda telah berhasil dibuat.</p>

          <div className="mb-8 rounded-2xl border border-green-500/20 bg-green-500/5 px-5 py-4 text-sm text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
            <span className="font-bold">📧 Silakan cek email Anda untuk melakukan verifikasi akun sebelum melakukan login.</span>
          </div>

          <Link href="/login" className="block w-full">
            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
              Ke Halaman Login
              <FiArrowRight />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
        className="relative flex flex-1 flex-col justify-center px-6 py-12 lg:max-w-[560px] bg-[var(--background-elevated)]/40 backdrop-blur-3xl border-r border-[var(--border-color)] z-10 overflow-y-auto no-scrollbar"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto w-full max-w-md my-auto">
          {/* Brand Logo */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
              className="inline-flex items-center gap-3 text-lg font-semibold text-[var(--foreground)] hover:text-green-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiArrowLeft className="w-5 h-5 text-green-500" />
                Beranda
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
              Mulai perjalanan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">sehatmu ✨</span>
            </h1>
            <p className="mt-3 text-[var(--muted-foreground)] font-medium text-base">
              Daftar dan buat akun barumu hari ini.
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-6 flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <FiAlertCircle size={20} />
                </div>
                <span className="font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <Field id="register-name" label="Nama Lengkap" name="name" placeholder="Nama Lengkap" autoComplete="name" value={formData.name} icon={<FiUser size={20} />} error={fieldErrors.name?.[0]} />
              <Field id="register-username" label="Username" name="username" placeholder="username" autoComplete="username" value={formData.username} icon={<FiAtSign size={20} />} error={fieldErrors.username?.[0]} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Field id="register-email" label="Email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" value={formData.email} icon={<FiMail size={20} />} error={fieldErrors.email?.[0]} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Field id="register-phone" label="Nomor HP" name="phone" type="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" value={formData.phone} icon={<FiPhone size={20} />} error={fieldErrors.phone?.[0]} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="register-password" className="block text-xs font-black text-[var(--muted-foreground)] mb-3 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-green-500 transition-colors">
                  <FiLock size={20} />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-14 pl-14 pr-14 rounded-2xl bg-[var(--background-soft)] border ${fieldErrors.password ? 'border-red-500/50' : 'border-[var(--border-color)]'} text-[var(--foreground)] font-bold text-sm focus:ring-2 ${fieldErrors.password ? 'focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-green-500/20 focus:border-green-500'} transition-all outline-none placeholder:text-[var(--muted-foreground)]/50 shadow-inner`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-green-500 transition-colors">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{fieldErrors.password[0]}</p>}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Field id="register-password-confirm" label="Konfirmasi Password" name="password_confirmation" type={showPassword ? 'text' : 'password'} placeholder="Ulangi password" autoComplete="new-password" value={formData.password_confirmation} icon={<FiLock size={20} />} error={fieldErrors.password_confirmation?.[0]} />
            </motion.div>

            <motion.div variants={itemVariants} className="px-1">
              <label htmlFor="agree-terms" className="flex items-start gap-4 cursor-pointer">
                <div className="relative pt-0.5">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreedToTerms ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-[var(--border-color)] bg-[var(--background-soft)]'}`}>
                    {agreedToTerms && <FiCheckCircle size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--muted-foreground)] leading-snug hover:text-[var(--foreground)] transition-colors">
                  Saya setuju dengan{' '}
                  <Link href="/syarat-ketentuan" className="text-green-500 hover:text-green-400 font-black">Syarat & Ketentuan</Link>
                  {' '}dan{' '}
                  <Link href="/kebijakan-privasi" className="text-green-500 hover:text-green-400 font-black">Kebijakan Privasi</Link>
                </span>
              </label>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button type="submit" id="register-submit" disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Daftar Sekarang
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">atau</span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </motion.div>

              {/* Google OAuth */}
              <motion.div variants={itemVariants}>
                <a
                  href={getGoogleLoginUrl()}
                  className="w-full h-14 rounded-2xl bg-white dark:bg-slate-800 border border-[var(--border-color)] text-[var(--foreground)] font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <FcGoogle size={20} />
                  Daftar dengan Google
                </a>
              </motion.div>
            </form>

          <motion.p variants={itemVariants} className="mt-8 text-center text-sm font-bold text-[var(--muted-foreground)]">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-green-500 hover:text-green-400 font-black tracking-tight underline underline-offset-4 decoration-2 decoration-green-500/30">
              Masuk di sini
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
              Mulai Hidup Sehat <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Hari Ini</span>
            </h2>

            <p className="text-slate-400 text-lg font-medium max-w-sm mb-12 leading-relaxed">
              Bergabunglah bersama ratusan klien yang berhasil mencapai target kesehatan dengan bimbingan ahli gizi profesional.
            </p>

            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {[
                { icon: '💬', text: 'Konsultasi 1-on-1 dengan ahli gizi' },
                { icon: '🍱', text: 'Meal plan personal sesuai kebutuhanmu' },
                { icon: '📈', text: 'Tracking progres & food diary harian' },
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
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Butuh bantuan?</p>
          <p className="text-sm font-black text-[var(--foreground)]">Chat Admin</p>
        </div>
        <div className="w-16 h-16 rounded-[1.75rem] bg-[#25D366] text-white flex items-center justify-center shadow-[0_20px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_25px_50px_rgba(37,211,102,0.4)] hover:-translate-y-2 transition-all duration-500 text-3xl">
          <FaWhatsapp />
        </div>
      </a>
    </div>
  );
}
