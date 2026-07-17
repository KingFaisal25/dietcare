  'use client';

  import { useEffect, useRef, useState } from 'react';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import { useCartStore } from '@/store/cartStore';
  import { useAuthStore } from '@/lib/store/authStore';
  import api from '@/lib/api';
  import { gsap } from 'gsap';
  import { Button } from '@/components/ui/Button';
  import { Input } from '@/components/ui/Input';
  import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
  import {
    FiArrowLeft, FiUser, FiMapPin, FiPhone,
    FiTruck, FiClock, FiCreditCard, FiCheckCircle, FiShoppingCart,
  } from 'react-icons/fi';

  const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  type Step = 'info' | 'delivery' | 'payment' | 'review' | 'success';
  type DeliveryType = 'instant' | 'scheduled';
  type DeliveryTime = 'pagi' | 'siang' | 'malam';
  type PaymentMethod = 'cod' | 'transfer' | 'ewallet';

  const STEPS: { key: Step; label: string }[] = [
    { key: 'info', label: 'Penerima' },
    { key: 'delivery', label: 'Pengiriman' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'review', label: 'Konfirmasi' },
  ];

  export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCartStore();
    const { user, isLoading } = useAuthStore();
    const [step, setStep] = useState<Step>('info');
    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [error, setError] = useState('');
    const pageRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotionRef = useRef(false);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant');
    const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>('pagi');
    const [payment, setPayment] = useState<PaymentMethod>('cod');
    const [notes, setNotes] = useState('');

    useEffect(() => {
      if (user && !name) {
        setName(user.name ?? '');
      }
    }, [user]);

    useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotionRef.current) return;

    if (
      !pageRef.current ||
      !headerRef.current ||
      !formRef.current ||
      !summaryRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        [formRef.current, summaryRef.current],
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.05,
        }
      );
    }, pageRef);

    return () => ctx.revert();

    }, []);

  useEffect(() => {
    if (prefersReducedMotionRef.current) return;
    if (step === 'success') return;
    gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [step]);

  const subtotal = totalPrice();
  const deliveryFee = deliveryType === 'instant' ? 15000 : 10000;
  const total = subtotal + deliveryFee;
  const stepIdx = STEPS.findIndex((s) => s.key === step);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
        <Scene3DBackground subtle />
        <div className="absolute inset-0 bg-3d-grid opacity-60" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-5xl shadow-xl">
            🛒
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Keranjang kosong</h2>
          <p className="text-[var(--muted-foreground)] text-base max-w-sm leading-relaxed">
            Silakan pilih menu sehat di toko terlebih dahulu.
          </p>
          <Link href="/shop">
            <Button size="lg" icon={<FiShoppingCart className="w-5 h-5" />}>
              Kembali ke Toko
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
        <Scene3DBackground subtle />
        <div className="absolute inset-0 bg-3d-grid opacity-60" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-5xl shadow-xl">
            🔒
          </div>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Login diperlukan</h2>
          <p className="text-[var(--muted-foreground)] text-base max-w-sm leading-relaxed">
            Anda harus login untuk melanjutkan checkout dan melacak pesanan.
          </p>
          <Link href="/login">
            <Button size="lg">Login Sekarang</Button>
          </Link>
        </div>
      </main>
    );
  }

  async function handlePlaceOrder() {
    setLoading(true); setError('');
    try {
      const body = {
        customer_name: name, address, phone,
        delivery_type: deliveryType,
        delivery_time: deliveryType === 'scheduled' ? deliveryTime : undefined,
        payment_method: payment,
        notes: notes || undefined,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      };
      const res = await api.post('/shop/orders', body);
      setOrderNumber(res.data.data.order_number);
      clearCart();
      setStep('success');
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? 'Gagal');
    } finally {
      setLoading(false);
    }
  }

  function canProceed() {
    if (step === 'info') return name.trim() && address.trim() && phone.trim();
    return true;
  }
  function next() {
    if (step === 'info') setStep('delivery');
    else if (step === 'delivery') setStep('payment');
    else if (step === 'payment') setStep('review');
    else handlePlaceOrder();
  }
  function back() {
    if (step === 'info') router.push('/shop/cart');
    else if (step === 'delivery') setStep('info');
    else if (step === 'payment') setStep('delivery');
    else setStep('payment');
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
        <Scene3DBackground subtle />
        <div className="absolute inset-0 bg-3d-grid opacity-60" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-6 px-6">
          <div className="w-24 h-24 rounded-[2.5rem] bg-green-600 flex items-center justify-center shadow-2xl shadow-green-500/25">
          <FiCheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-[var(--foreground)] mb-2 tracking-tight">Pesanan Berhasil!</h1>
          <p className="text-[var(--muted-foreground)] text-sm mb-1 font-medium">No. Pesanan</p>
          <p className="text-2xl font-black text-green-700 dark:text-green-400 font-mono">{orderNumber}</p>
        </div>

        <div className="p-6 space-y-2 text-sm max-w-sm w-full rounded-[2rem] bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-2xl shadow-black/5 text-[var(--muted-foreground)]">
          <p className="text-[var(--foreground)] font-black mb-3">Langkah Selanjutnya</p>
          <p>
            Pesanan sedang <span className="text-green-700 dark:text-green-400 font-black">diproses</span>
          </p>
          <p>Kami sedang menyiapkan pesanan Anda</p>
          <p>
            Estimasi:{' '}
            <span className="text-[var(--foreground)] font-black">
              {deliveryType === 'instant' ? '30–60 menit' : 'Sesuai jadwal'}
            </span>
          </p>
          {payment === 'transfer' && (
            <p>
              Transfer ke <span className="text-[var(--foreground)] font-black">BCA 1234567890 a/n DietCare</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link href={`/shop/orders/${orderNumber}`}>
            <Button size="lg">Lacak Pesanan</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Belanja Lagi
            </Button>
          </Link>
        </div>
      </div>
      </main>
    );
  }

  const textareaCls =
    'w-full rounded-[20px] border border-[var(--border-color)] bg-white px-4 py-3 text-base font-bold text-[var(--foreground)] placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/10 focus-visible:border-green-500 transition-all';

  return (
    <main ref={pageRef} className="min-h-screen bg-[var(--background)] relative overflow-hidden transition-colors duration-500">
      <Scene3DBackground subtle />
      <div className="absolute inset-0 bg-3d-grid opacity-60" />

      <div className="relative z-10">
        <div ref={headerRef} className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            <button
              onClick={back}
              className="w-11 h-11 rounded-2xl bg-[var(--background-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-green-600 hover:border-green-200 transition-colors"
              aria-label="Kembali"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight">Checkout</h1>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">
                Langkah {stepIdx + 1} dari {STEPS.length}
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-5">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-2 ${stepIdx >= i ? 'text-green-700 dark:text-green-400' : 'text-[var(--muted-foreground)]'}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${
                        stepIdx > i
                          ? 'bg-green-600 border-green-600 text-white'
                          : stepIdx === i
                            ? 'border-green-600 text-green-700 dark:text-green-400 bg-white'
                            : 'border-[var(--border-color)] text-[var(--muted-foreground)] bg-[var(--background-elevated)]'
                      }`}
                    >
                      {stepIdx > i ? '✓' : i + 1}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest hidden sm:block ${
                      stepIdx >= i ? 'text-green-700 dark:text-green-400' : 'text-[var(--muted-foreground)]'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-3 rounded-full ${stepIdx > i ? 'bg-green-600' : 'bg-[var(--border-color)]'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <div ref={formRef} className="p-6 sm:p-8 rounded-[2.25rem] bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-2xl shadow-black/5">
              <div ref={contentRef} className="space-y-6">
                {step === 'info' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                        <FiUser className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[var(--foreground)]">Data Penerima</h2>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Pastikan alamat & kontak bisa dihubungi</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input label="Nama Lengkap *" value={name} onChange={(e) => setName(e.target.value)} icon={<FiUser className="w-4 h-4" />} placeholder="Masukkan nama lengkap" />

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">Alamat Lengkap *</p>
                        <div className="relative">
                          <div className="absolute left-4 top-4 text-slate-400">
                            <FiMapPin className="w-4 h-4" />
                          </div>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Jl. Contoh No. 1, Kecamatan, Kota, Kode Pos"
                            rows={3}
                            className={`${textareaCls} pl-12 resize-none`}
                          />
                        </div>
                      </div>

                      <Input label="Nomor HP *" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<FiPhone className="w-4 h-4" />} placeholder="08xxxxxxxxxx" />

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">Catatan (opsional)</p>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Instruksi khusus untuk kurir (mis. patokan rumah, jangan pakai sambal, dll.)"
                          rows={2}
                          className={`${textareaCls} resize-none`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 'delivery' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                        <FiTruck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[var(--foreground)]">Pilih Pengiriman</h2>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Atur waktu yang paling nyaman untuk Anda</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { value: 'instant' as DeliveryType, label: 'Instan', desc: '30–60 menit sampai', fee: 15000, icon: '⚡' },
                        { value: 'scheduled' as DeliveryType, label: 'Terjadwal', desc: 'Pilih waktu pengiriman', fee: 10000, icon: '📅' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDeliveryType(opt.value)}
                          className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-colors text-left ${
                            deliveryType === opt.value
                              ? 'border-green-600 bg-green-500/10'
                              : 'border-[var(--border-color)] bg-[var(--background-soft)] hover:border-green-200'
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div className="flex-1">
                            <p className="font-black text-[var(--foreground)] text-sm">{opt.label}</p>
                            <p className="text-sm text-[var(--muted-foreground)] font-medium">{opt.desc}</p>
                          </div>
                          <p className="text-sm font-black text-[var(--foreground)]">{fmt(opt.fee)}</p>
                        </button>
                      ))}
                    </div>

                    {deliveryType === 'scheduled' && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 text-[var(--foreground)] font-black text-sm mb-3">
                          <FiClock className="w-4 h-4 text-green-600" /> Pilih Waktu
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'pagi' as DeliveryTime, label: 'Pagi', sub: '07–11', icon: '🌅' },
                            { value: 'siang' as DeliveryTime, label: 'Siang', sub: '11–15', icon: '☀️' },
                            { value: 'malam' as DeliveryTime, label: 'Malam', sub: '17–21', icon: '🌙' },
                          ].map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setDeliveryTime(t.value)}
                              className={`flex flex-col items-center gap-1.5 p-4 rounded-[1.5rem] border-2 transition-colors ${
                                deliveryTime === t.value
                                  ? 'border-green-600 bg-green-500/10'
                                  : 'border-[var(--border-color)] bg-[var(--background-soft)] hover:border-green-200'
                              }`}
                            >
                              <span className="text-xl">{t.icon}</span>
                              <p className="font-black text-sm text-[var(--foreground)]">{t.label}</p>
                              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{t.sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {step === 'payment' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                        <FiCreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[var(--foreground)]">Metode Pembayaran</h2>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Pilih opsi yang paling mudah</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { value: 'cod' as PaymentMethod, label: 'COD (Bayar di Tempat)', desc: 'Bayar saat paket tiba', icon: '💵' },
                        { value: 'transfer' as PaymentMethod, label: 'Transfer Bank', desc: 'BCA / BNI / Mandiri / BRI', icon: '🏦' },
                        { value: 'ewallet' as PaymentMethod, label: 'E-Wallet', desc: 'GoPay / OVO / DANA', icon: '📱' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPayment(opt.value)}
                          className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-colors text-left ${
                            payment === opt.value
                              ? 'border-green-600 bg-green-500/10'
                              : 'border-[var(--border-color)] bg-[var(--background-soft)] hover:border-green-200'
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div className="flex-1">
                            <p className="font-black text-[var(--foreground)] text-sm">{opt.label}</p>
                            <p className="text-sm text-[var(--muted-foreground)] font-medium">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === opt.value ? 'border-green-600' : 'border-[var(--border-color)]'}`}>
                            {payment === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-green-600" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 'review' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                        <FiCheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[var(--foreground)]">Konfirmasi Pesanan</h2>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Periksa kembali sebelum membuat pesanan</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-[1.5rem] p-5 bg-[var(--background-soft)] border border-[var(--border-color)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Data Penerima</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2 items-start">
                            <FiUser className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[var(--foreground)] font-bold">{name}</span>
                          </div>
                          <div className="flex gap-2 items-start">
                            <FiMapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[var(--foreground)] font-bold">{address}</span>
                          </div>
                          <div className="flex gap-2 items-start">
                            <FiPhone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[var(--foreground)] font-bold">{phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] p-5 bg-[var(--background-soft)] border border-[var(--border-color)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Pengiriman & Pembayaran</p>
                        <div className="space-y-2 text-sm text-[var(--foreground)] font-bold">
                          <p>🚚 {deliveryType === 'instant' ? 'Instan (30–60 menit)' : `Terjadwal – ${deliveryTime}`}</p>
                          <p>💳 {payment === 'cod' ? 'COD' : payment === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}</p>
                          {notes && <p className="text-[var(--muted-foreground)] font-medium">📝 {notes}</p>}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-[1.25rem] p-4 text-sm font-bold">
                        {error}
                      </div>
                    )}
                  </>
                )}

                <div className="pt-2 flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={back}>
                    Kembali
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={next}
                    isLoading={loading}
                    disabled={!canProceed()}
                    icon={step === 'review' ? <FiCheckCircle className="w-5 h-5" /> : undefined}
                  >
                    {step === 'review' ? 'Buat Pesanan' : 'Lanjut'}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div ref={summaryRef} className="p-6 rounded-[2.25rem] bg-[var(--background-elevated)] border border-[var(--border-color)] shadow-2xl shadow-black/5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-[var(--foreground)]">
                  <FiShoppingCart className="w-4 h-4 text-green-600" /> Pesanan
                </div>
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

              <div className="pt-4 border-t border-[var(--border-color)] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)] font-medium">Subtotal</span>
                  <span className="font-black text-[var(--foreground)]">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)] font-medium">Ongkos Kirim</span>
                  <span className="font-bold text-[var(--foreground)]">{fmt(deliveryFee)}</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] p-4 bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[var(--foreground)]">Total</span>
                  <span className="text-lg font-black text-green-700 dark:text-green-400">{fmt(total)}</span>
                </div>
              </div>

              <Link
                href="/shop/cart"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-green-600 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Edit Keranjang
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
