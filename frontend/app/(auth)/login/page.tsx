'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
    if (!loginIdentifier || !password) { setError('Mohon isi email/username dan password.'); return; }
    setIsLoading(true);
    const result = await login(loginIdentifier, password);
    if (!result.success) setError(result.message);
    setIsLoading(false);
  };

  const waLink = 'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo Admin DietCare, saya ingin berkonsultasi gratis.');

  return (
    <div className="min-h-screen flex bg-gray-950 relative">
      <Scene3DBackground subtle />
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>
      {/* Form Panel */}
      <div className="relative flex flex-1 flex-col justify-center px-8 py-12 lg:max-w-[540px] bg-gray-950 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="relative mx-auto w-full max-w-sm">

          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">DietCare</span>
              <span className="text-emerald-400"> </span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              Selamat datang<br/>kembali 👋
            </h1>
            <p className="mt-2.5 text-sm text-gray-400">Masuk untuk lanjutkan perjalanan sehatmu.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email atau Username</label>
              <input
                id="login-identifier" type="text" autoComplete="username"
                placeholder="nama@email.com atau username"
                value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)}
                className="form-control"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="form-control pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword
                    ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="remember-me" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-700 bg-gray-900 accent-emerald-500 cursor-pointer"/>
                <span className="text-xs text-gray-500">Ingat saya</span>
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Lupa password?</Link>
            </div>

            <button
              type="submit" id="login-submit" disabled={isLoading}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <span className="flex items-center justify-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memproses...</span>
                : 'Masuk ke Dashboard'
              }
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">atau</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <a href={waLink} target="_blank" rel="noopener noreferrer" id="login-whatsapp"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gray-800 bg-gray-900 px-5 py-3.5 text-sm font-semibold text-[#25D366] transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326z"/></svg>
            Konsultasi Gratis via WhatsApp
          </a>

          <p className="mt-8 text-center text-xs text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Daftar sekarang</Link>
          </p>
        </div>
      </div>

      {/* Visual Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-teal-500/15 blur-[100px]" />
        <TiltCard className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center glass-panel rounded-3xl mx-10 py-12">
          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white/5 border border-white/10 shadow-2xl">
            <svg className="h-14 w-14" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="24" stroke="#34d399" strokeWidth="2" strokeOpacity=".3"/>
              <circle cx="32" cy="32" r="16" stroke="#34d399" strokeWidth="1" strokeOpacity=".15"/>
              <path d="M22 32l7 7 14-16" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
            Transform Your Health<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">with Smart Nutrition</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-10">Platform gizi terdepan dengan panduan personal dari ahli gizi bersertifikat.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[['🥗','Meal plan personal harian'],['📊','Tracking kalori & makro real-time'],['💬','Konsultasi langsung ahli gizi']].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/8 px-5 py-3.5 text-left">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-gray-300">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex gap-8 pt-8 border-t border-white/10 w-full max-w-xs justify-center">
            {[['500+','Klien Puas'],['4.9★','Rating'],['50+','Program']].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-bold text-white">{v}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
