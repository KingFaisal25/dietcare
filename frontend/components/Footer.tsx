'use client';

import Link from 'next/link';
import {
  FiCheckCircle, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import { FaLeaf, FaWhatsapp } from 'react-icons/fa';
import { ThemeToggle } from './ui/ThemeToggle';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden pb-10 pt-24">
      <div className="hero-orb left-0 top-0 h-72 w-72 bg-brand-500/20" />
      <div className="hero-orb bottom-0 right-0 h-80 w-80 bg-secondary-500/10" />

      <div className="page-shell relative z-10">
        <div className="surface-card rounded-[36px] px-6 py-8 md:px-10 md:py-10">
          <div className="grid-12 mb-12">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Link href="/" className="group flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-secondary-500 text-white shadow-green">
                  <FaLeaf className="transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <div>
                  <p className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-0">DietCare</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
                    Better Nutrition Everyday
                  </p>
                </div>
              </Link>

              <p className="max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                Platform kesehatan gizi yang membantu pengguna membangun pola makan sehat melalui program personal, dashboard progres, dan konsultasi bersama ahli gizi tersertifikasi.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                  <FiCheckCircle size={14} />
                  Ahli Gizi Tersertifikasi
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-600 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
                  WCAG-friendly UI
                </span>
              </div>
            </div>

            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-neutral-900 dark:text-neutral-0">Program</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { name: 'Body Goals', href: '/program/body-goals' },
                  { name: 'Body for Baby', href: '/program/body-for-baby' },
                  { name: 'Clinicare', href: '/program/clinicare' },
                  { name: 'Harga', href: '/harga' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="theme-transition text-neutral-600 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-300">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-6 md:col-span-4 lg:col-span-2">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-neutral-900 dark:text-neutral-0">Navigasi</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { name: 'Beranda', href: '/' },
                  { name: 'Ahli Gizi', href: '/ahli-gizi' },
                  { name: 'Blog', href: '/blog' },
                  { name: 'Shop', href: '/shop' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="theme-transition text-neutral-600 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-300">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-12 md:col-span-4 lg:col-span-4">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-neutral-900 dark:text-neutral-0">Kontak</h4>
              <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-3">
                  <FiMail className="mt-0.5 text-brand-500" />
                  <span>admin@dietcare.id</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiPhone className="mt-0.5 text-brand-500" />
                  <span>+62 812 3456 7890</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 text-brand-500" />
                  <span>Jl. Kesehatan No. 123, Jakarta Selatan, DKI Jakarta 12345</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {[
                    { icon: <FiInstagram />, label: 'Instagram', href: '#' },
                    { icon: <FiTwitter />, label: 'Twitter', href: '#' },
                    { icon: <FiFacebook />, label: 'Facebook', href: '#' },
                    { icon: <FiYoutube />, label: 'Youtube', href: '#' },
                    { icon: <FaWhatsapp />, label: 'WhatsApp', href: '#' },
                  ].map((social) => (
                    <Link
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="theme-transition inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-card hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:text-brand-300"
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[color:var(--border-color)] pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span>&copy; {currentYear} DietCare. All rights reserved.</span>
              <Link href="/syarat-ketentuan" className="theme-transition hover:text-brand-600 dark:hover:text-brand-300">
                Syarat & Ketentuan
              </Link>
              <Link href="/kebijakan-privasi" className="theme-transition hover:text-brand-600 dark:hover:text-brand-300">
                Kebijakan Privasi
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
