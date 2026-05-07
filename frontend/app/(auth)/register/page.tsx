'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name:'', username:'', email:'', password:'', password_confirmation:'', phone:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string,string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({});
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.password_confirmation) {
      setError('Mohon lengkapi semua field yang wajib diisi.'); return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) { setFieldErrors({ username: ['Username hanya boleh huruf, angka, strip, dan underscore.'] }); return; }
    if (formData.password.length < 8) { setFieldErrors({ password: ['Password minimal 8 karakter.'] }); return; }
    if (formData.password !== formData.password_confirmation) { setFieldErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] }); return; }
    if (!agreedToTerms) { setError('Anda harus menyetujui Syarat & Ketentuan.'); return; }
    setIsLoading(true);
    const result = await register(formData);
    if (result.success) { setIsSuccess(true); }
    else {
      if ('errors' in result && result.errors) setFieldErrors(result.errors as Record<string,string[]>);
      setError(result.message);
    }
    setIsLoading(false);
  };

  if (isSuccess) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
          <svg className="h-12 w-12 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Pendaftaran Berhasil! 🎉</h1>
        <p className="text-gray-400 text-sm mb-6">Akun Anda telah berhasil dibuat.</p>
        <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-emerald-400 font-medium">📧 Silakan cek email Anda untuk melakukan verifikasi akun sebelum login.</p>
        </div>
        <Link href="/login" className="block w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.01] transition-all text-center">
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );

  const Field = ({ id, label, name, type='text', placeholder, autoComplete, value, error: ferr }: {
    id:string; label:string; name:string; type?:string; placeholder:string; autoComplete?:string; value:string; error?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input id={id} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={handleChange}
        className={`form-control ${ferr ? 'error' : ''}`}
      />
      {ferr && <p className="mt-1.5 text-xs text-red-400">{ferr}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-950 relative">
      <Scene3DBackground subtle />
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>
      {/* Form */}
      <div className="relative flex flex-1 flex-col justify-center px-8 py-10 lg:max-w-[560px] bg-gray-950 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[100px]" />
        <div className="relative mx-auto w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight"><span className="text-white">DietCare</span><span className="text-emerald-400"> </span></span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Buat Akun Baru ✨</h1>
            <p className="mt-2 text-sm text-gray-400">Daftar dan mulai perjalanan sehat Anda hari ini.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" id="register-form">
            <div className="grid grid-cols-2 gap-3">
              <Field id="register-name" label="Nama Lengkap" name="name" placeholder="Nama lengkap" autoComplete="name" value={formData.name} error={fieldErrors.name?.[0]}/>
              <Field id="register-username" label="Username" name="username" placeholder="username" autoComplete="username" value={formData.username} error={fieldErrors.username?.[0]}/>
            </div>
            <Field id="register-email" label="Email" name="email" type="email" placeholder="nama@email.com" autoComplete="email" value={formData.email} error={fieldErrors.email?.[0]}/>
            <Field id="register-phone" label="Nomor HP" name="phone" type="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" value={formData.phone} error={fieldErrors.phone?.[0]}/>

            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter"
                  autoComplete="new-password" value={formData.password} onChange={handleChange}
                  className={`form-control pr-12 ${fieldErrors.password ? 'error' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password[0]}</p>}
            </div>

            <Field id="register-password-confirm" label="Konfirmasi Password" name="password_confirmation" type={showPassword ? 'text' : 'password'} placeholder="Ulangi password" autoComplete="new-password" value={formData.password_confirmation} error={fieldErrors.password_confirmation?.[0]}/>

            <label htmlFor="agree-terms" className="flex items-start gap-3 cursor-pointer pt-1">
              <input type="checkbox" id="agree-terms" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-gray-900 accent-emerald-500 cursor-pointer"/>
              <span className="text-xs text-gray-400 leading-snug">
                Saya setuju dengan{' '}
                <Link href="/syarat-ketentuan" className="text-emerald-400 hover:text-emerald-300 font-semibold">Syarat & Ketentuan</Link>
                {' '}dan{' '}
                <Link href="/kebijakan-privasi" className="text-emerald-400 hover:text-emerald-300 font-semibold">Kebijakan Privasi</Link>
              </span>
            </label>

            <button type="submit" id="register-submit" disabled={isLoading}
              className="w-full mt-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <span className="flex items-center justify-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Mendaftar...</span>
                : 'Daftar Sekarang'
              }
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Masuk di sini</Link>
          </p>
        </div>
      </div>

      {/* Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-gray-900 to-emerald-950" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-teal-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-1/3 left-1/4 h-[280px] w-[280px] rounded-full bg-emerald-500/15 blur-[80px]" />
        <TiltCard className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center glass-panel rounded-3xl mx-10 py-12">
          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white/5 border border-white/10 shadow-2xl">
            <svg className="h-14 w-14" viewBox="0 0 64 64" fill="none">
              <rect x="14" y="10" width="36" height="44" rx="6" stroke="#34d399" strokeWidth="2" strokeOpacity=".4" fill="white" fillOpacity=".05"/>
              <path d="M22 22h20M22 30h20M22 38h14" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeOpacity=".7"/>
              <circle cx="48" cy="48" r="10" fill="url(#rg)" fillOpacity=".8"/>
              <path d="M44 48l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop stopColor="#34d399"/><stop offset="1" stopColor="#0d9488"/></radialGradient></defs>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
            Mulai Hidup Sehat<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Hari Ini</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-10">
            Bergabunglah bersama ratusan klien yang berhasil mencapai target kesehatan dengan bimbingan ahli gizi bersertifikat.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              ['✅','Konsultasi 1-on-1 dengan ahli gizi'],
              ['🍱','Meal plan personal sesuai kebutuhanmu'],
              ['📈','Tracking progres & food diary harian'],
            ].map(([icon,text], i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/8 px-5 py-3.5 text-left">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
