'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiLayout, FiShoppingCart } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import { Button } from './ui/Button';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [programDropdown, setProgramDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Program', href: '#', hasDropdown: true },
    { name: 'Ahli Gizi', href: '/ahli-gizi' },
    { name: 'Harga', href: '/harga' },
    { name: '🧮 Kalkulator Gratis', href: '/kalkulator-gratis' },
    { name: 'Blog', href: '/blog' },
    { name: 'Shop', href: '/shop' },
  ];

  const programs = [
    { name: 'Body Goals', href: '/program/body-goals', icon: '🎯' },
    { name: 'Body for Baby', href: '/program/body-for-baby', icon: '👶' },
    { name: 'Clinicare', href: '/program/clinicare', icon: '🏥' },
  ];

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-300 md:px-6 ${scrolled ? 'backdrop-blur-xl' : ''
          }`}
      >
        <div className="page-shell">
          <div className={`theme-transition flex h-[72px] items-center justify-between rounded-[28px] border px-4 md:px-6 ${scrolled
              ? 'surface-panel border-black/5 shadow-float'
              : 'surface-card'
            }`}>
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-secondary-500 text-white shadow-green">
                <FaLeaf className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <p className="text-base font-extrabold tracking-tight text-neutral-900">DietCare</p>
              </div>
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setProgramDropdown(true)}
                  onMouseLeave={() => link.hasDropdown && setProgramDropdown(false)}
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center gap-1 py-2 text-sm font-semibold transition-colors ${pathname === link.href ? 'text-brand-600' : 'text-neutral-600 hover:text-brand-600'
                      }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <FiChevronDown className={`transition-transform duration-200 ${programDropdown ? 'rotate-180' : ''}`} />
                    )}
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500"
                      />
                    )}
                  </Link>

                  {link.hasDropdown && (
                    <AnimatePresence>
                      {programDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.18 }}
                          className="surface-card absolute left-0 top-full mt-3 w-64 rounded-[24px] p-2 shadow-float"
                        >
                          {programs.map((prog) => (
                            <Link
                              key={prog.name}
                              href={prog.href}
                              className="theme-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
                            >
                              <span className="text-lg">{prog.icon}</span>
                              <span>{prog.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/shop/cart" className="theme-transition relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200/70 bg-white text-neutral-600 shadow-card hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-600">
                <FiShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="group relative">
                  <button className="theme-transition flex items-center gap-3 rounded-full border border-neutral-200/80 bg-white/85 px-2 py-1.5 shadow-card hover:-translate-y-0.5">
                    <div className="hidden text-right xl:block">
                      <p className="text-xs font-semibold text-neutral-900">{user.name}</p>
                      <p className="text-[10px] capitalize text-neutral-500">{user.role}</p>
                    </div>
                    <div className="overflow-hidden rounded-full border border-brand-100">
                      <Image
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f0fdf4&color=1da271`}
                        alt={user.name}
                        width={38}
                        height={38}
                      />
                    </div>
                    <FiChevronDown className="mr-1 text-neutral-400" />
                  </button>

                  <div className="surface-card invisible absolute right-0 top-full mt-3 w-56 rounded-[24px] p-2 opacity-0 shadow-float transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'nutritionist' ? '/nutritionist/dashboard' : '/klien-dashboard'} className="theme-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700">
                      <FiLayout size={16} className="text-brand-500" />
                      Dashboard
                    </Link>
                    <Link href="/profil" className="theme-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700">
                      <FiUser size={16} className="text-brand-500" />
                      Profil Saya
                    </Link>
                    <button
                      onClick={clearAuth}
                      className="theme-transition flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-danger hover:bg-danger/10"
                    >
                      <FiLogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">Masuk</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Mulai Gratis</Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                className="theme-transition flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/70 bg-white text-neutral-600 shadow-card hover:text-brand-600"
                onClick={() => setIsOpen(true)}
                aria-label="Buka menu"
              >
                <FiMenu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-neutral-950/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-sm flex-col border-l border-neutral-100 bg-white p-6 shadow-modal"
            >
              <div className="mb-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-secondary-500 text-white">
                    <FaLeaf size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">DietCare</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-brand-600">Healthy Living</p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="theme-transition rounded-full border border-neutral-200 p-2 text-neutral-500 hover:text-brand-600"
                  aria-label="Tutup menu"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.hasDropdown ? (
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">Program</p>
                        {programs.map((prog) => (
                          <Link
                            key={prog.name}
                            href={prog.href}
                            className="theme-transition flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <span className="text-lg">{prog.icon}</span>
                            {prog.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={`block rounded-2xl px-4 py-3 text-base font-semibold ${pathname === link.href
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-neutral-700'
                          }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-3 border-t border-neutral-100 pt-6">
                <Link href="/shop/cart" className="theme-transition flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold">
                  <span>Keranjang</span>
                  {isMounted && (
                    <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[11px] text-white">{totalItems}</span>
                  )}
                </Link>
                {user ? (
                  <>
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'nutritionist' ? '/nutritionist/dashboard' : '/klien-dashboard'} className="block">
                      <Button variant="outline" className="w-full">Dashboard</Button>
                    </Link>
                    <Button onClick={clearAuth} variant="ghost" className="w-full text-danger">Keluar</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">Masuk</Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button className="w-full">Mulai Gratis</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
