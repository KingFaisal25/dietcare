'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Mohon isi alamat email Anda.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-950 relative">
        <Scene3DBackground subtle />
        <div className="w-full max-w-md text-center relative z-10 glass-panel rounded-3xl p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-10 w-10 text-emerald-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Tautan Terkirim</h1>
          <p className="text-slate-300 mb-2">Kami sudah mengirim tautan reset password ke email Anda.</p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30">
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950 relative">
      <Scene3DBackground subtle />
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20 xl:px-28 relative z-10">
        <div className="mx-auto w-full max-w-md glass-panel rounded-3xl p-8">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                DC
              </div>
              <span className="text-xl font-bold text-white">
                <span className="text-white">DietCare</span>
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Lupa Password? 🔐
            </h1>
            <p className="mt-2 text-base text-slate-300">
              Masukkan alamat email yang terdaftar, dan kami akan mengirimkan instruksi untuk melakukan reset password Anda.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-in fade-in">
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="forgot-password-form">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Alamat Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="form-control"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-300">
            Ingat password Anda?{' '}
            <Link
              href="/login"
              className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side — Illustration (Desktop Only) */}
      <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-xl animate-pulse" />

        <TiltCard className="relative z-10 max-w-md px-10 text-center glass-panel rounded-3xl py-10">
          <div className="mb-8 flex justify-center">
            <svg className="h-52 w-52 text-white/90 drop-shadow-lg" viewBox="0 0 200 200" fill="none">
              <ellipse cx="100" cy="120" rx="70" ry="20" fill="white" fillOpacity="0.15" />
              <path d="M100 50 L100 100 L130 130" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fillOpacity="0.6"/>
              <circle cx="100" cy="100" r="45" stroke="white" strokeWidth="8" strokeOpacity="0.8" fill="none" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Akses Aman & Mudah
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Dapatkan kembali akses ke akun Anda dengan aman untuk melanjutkan perjalanan hidup sehat bersama DietCare.
          </p>
        </TiltCard>
      </div>
    </div>
  );
}
