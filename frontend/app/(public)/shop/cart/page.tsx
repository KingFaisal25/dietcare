'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/Button';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotionRef = useRef(false);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const qtyRefs = useRef<Record<number, HTMLSpanElement | null>>({});

  const subtotal = totalPrice();
  const deliveryFee = 15000;

  function handleRemove(id: number) {
    const el = itemRefs.current[id];
    if (!el || prefersReducedMotionRef.current) {
      removeItem(id);
      return;
    }

    gsap.to(el, {
      opacity: 0,
      x: -24,
      scale: 0.98,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => removeItem(id),
    });
  }

  function handleQtyChange(id: number, nextQty: number) {
    updateQuantity(id, nextQty);
    const el = qtyRefs.current[id];
    if (!el || prefersReducedMotionRef.current) return;
    gsap.fromTo(el, { scale: 1 }, { scale: 1.18, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1 });
  }

  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
      );

      const itemEls = rootRef.current?.querySelectorAll('[data-cart-item]');
      if (itemEls?.length) {
        gsap.fromTo(
          itemEls,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.06, delay: 0.05 }
        );
      }

      gsap.fromTo(
        summaryRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.12 }
      );
    }, rootRef);

    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
        <Scene3DBackground subtle />
        <div className="absolute inset-0 bg-3d-grid opacity-60" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-5xl shadow-xl">
            🛒
          </div>
          <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Keranjang kosong</h2>
          <p className="text-[var(--muted-foreground)] text-base max-w-sm leading-relaxed">
            Tambahkan produk sehat favoritmu, lalu lanjutkan checkout dengan cepat.
          </p>
          <Link href="/shop">
            <Button size="lg" icon={<FiShoppingCart className="w-5 h-5" />}>
              Mulai Belanja
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main ref={rootRef} className="min-h-screen bg-[var(--background)] relative overflow-hidden transition-colors duration-500">
      <Scene3DBackground subtle />
      <div className="absolute inset-0 bg-3d-grid opacity-60" />

      <div className="relative z-10">
        <div ref={headerRef} className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            <Link
              href="/shop"
              className="w-11 h-11 rounded-2xl bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-green-600 hover:border-green-200 transition-colors"
              aria-label="Kembali ke toko"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight">Keranjang Belanja</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">{items.length} produk dipilih</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                ref={(el) => {
                  itemRefs.current[item.product.id] = el;
                }}
                data-cart-item
                className="p-5 sm:p-6 rounded-[2rem] bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-xl shadow-black/5 flex gap-5"
              >
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-[var(--background-soft)] border border-[var(--border-color)] flex-shrink-0">
                  <img
                    src={
                      item.product.image_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.product.name)}&background=f0fdf4&color=16a34a&size=200&bold=true`
                    }
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.product.name)}&background=f0fdf4&color=16a34a&size=200&bold=true`;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/shop/${item.product.slug}`} className="block">
                        <h3 className="font-black text-[var(--foreground)] text-base sm:text-lg leading-snug hover:text-green-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-[var(--muted-foreground)] font-medium mt-1">🔥 {item.product.calories} kcal / porsi</p>
                      <p className="text-lg font-black text-[var(--foreground)] mt-3">{fmt(item.product.price)}</p>
                    </div>

                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="w-10 h-10 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)] text-[var(--muted-foreground)] hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center"
                      aria-label={`Hapus ${item.product.name} dari keranjang`}
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-[var(--background-soft)] border border-[var(--border-color)]">
                      <button
                        onClick={() => handleQtyChange(item.product.id, item.quantity - 1)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>

                      <span
                        ref={(el) => {
                          qtyRefs.current[item.product.id] = el;
                        }}
                        className="w-10 text-center text-base font-black text-[var(--foreground)]"
                      >
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleQtyChange(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm font-black text-[var(--muted-foreground)]">
                      Subtotal: <span className="text-[var(--foreground)]">{fmt(item.product.price * item.quantity)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" /> Hapus semua produk
            </button>
          </section>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div ref={summaryRef} className="p-6 rounded-[2rem] bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-2xl shadow-black/5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[var(--foreground)] tracking-tight">Ringkasan Pesanan</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">DietCare</span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-[var(--muted-foreground)] font-medium truncate">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="font-black text-[var(--foreground)] whitespace-nowrap">{fmt(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)] font-medium">Subtotal</span>
                  <span className="font-black text-[var(--foreground)]">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)] font-medium">Ongkos kirim (estimasi)</span>
                  <span className="font-bold text-[var(--foreground)]">{fmt(deliveryFee)}</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] p-4 bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[var(--foreground)]">Total</span>
                  <span className="text-lg font-black text-green-700 dark:text-green-400">{fmt(subtotal + deliveryFee)}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-medium mt-1">
                  Ongkir final ditentukan saat checkout
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                icon={<FiArrowRight className="w-5 h-5" />}
                onClick={() => router.push('/shop/checkout')}
              >
                Checkout
              </Button>

              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-green-600 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Lanjutkan Belanja
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
