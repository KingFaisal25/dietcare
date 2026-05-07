'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiArrowLeft, FiUser, FiMapPin, FiPhone,
  FiTruck, FiClock, FiCreditCard, FiCheckCircle, FiShoppingCart,
} from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BG  = { background: '#0f172a' } as const;
const CARD = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18 } as const;
const CARD2 = { background: '#273449', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 } as const;

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
  const { token, user } = useAuthStore();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState(user?.name ?? '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant');
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>('pagi');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');

  const subtotal = totalPrice();
  const deliveryFee = deliveryType === 'instant' ? 15000 : 10000;
  const total = subtotal + deliveryFee;
  const stepIdx = STEPS.findIndex((s) => s.key === step);

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={BG}>
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-bold text-white">Keranjang kosong</h2>
        <Link href="/shop" className="text-green-400 hover:underline font-medium">← Kembali ke Toko</Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4" style={BG}>
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Login diperlukan</h2>
        <p className="text-sm text-slate-400 text-center max-w-xs">Anda harus login untuk melanjutkan checkout.</p>
        <Link href="/login" className="btn-green px-6 py-3 text-sm">Login Sekarang</Link>
      </div>
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
      const res = await fetch(`${API}/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Gagal');
      setOrderNumber(data.data.order_number);
      clearCart();
      setStep('success');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
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

  /* ── Success ─────────────────────────────────────────────── */
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={BG}>
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40 animate-bounce-in animate-pulse-green">
          <FiCheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white mb-2">Pesanan Berhasil! 🎉</h1>
          <p className="text-slate-400 text-sm mb-1">No. Pesanan:</p>
          <p className="text-2xl font-extrabold text-yellow-400 font-mono">{orderNumber}</p>
        </div>
        <div className="p-5 space-y-2 text-sm text-slate-400 max-w-sm w-full rounded-3xl" style={CARD}>
          <p className="text-white font-semibold mb-3">Langkah Selanjutnya</p>
          <p>✅ Pesanan sedang <span className="text-green-400 font-semibold">diproses</span></p>
          <p>📦 Kami sedang menyiapkan pesanan Anda</p>
          <p>🚚 Estimasi: <span className="text-white font-semibold">{deliveryType === 'instant' ? '30–60 menit' : 'Sesuai jadwal'}</span></p>
          {payment === 'transfer' && <p>💳 Transfer ke <span className="text-white font-semibold">BCA 1234567890 a/n DietCare</span></p>}
        </div>
        <div className="flex gap-3">
          <Link href={`/shop/orders/${orderNumber}`}
            className="btn-green px-5 py-3 text-sm">Lacak Pesanan</Link>
          <Link href="/shop"
            className="px-5 py-3 rounded-2xl text-sm font-bold text-slate-300 border border-white/[0.08] hover:bg-white/5 transition-all"
            style={CARD2}>Belanja Lagi</Link>
        </div>
      </div>
    );
  }

  const inputCls = "input-dark w-full";

  return (
    <div className="min-h-screen" style={BG}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: '#0f172a' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-green-400 transition-all">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Checkout</h1>
        </div>

        {/* Step Progress */}
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-1.5 ${stepIdx >= i ? 'text-green-400' : 'text-slate-600'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                    stepIdx > i  ? 'bg-green-500 border-green-500 text-white'
                    : stepIdx === i ? 'border-green-500 text-green-400'
                    : 'border-slate-700 text-slate-600'
                  }`}>
                    {stepIdx > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-[11px] font-bold hidden sm:block ${stepIdx >= i ? 'text-green-400' : 'text-slate-600'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${stepIdx > i ? 'bg-green-500' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-5">
        {/* Form */}
        <div className="md:col-span-2">
          <div className="p-6 space-y-5 animate-fade-up" style={CARD}>

            {/* ── Info ────────────────────────────────────────── */}
            {step === 'info' && (
              <>
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <FiUser className="w-5 h-5" /> Data Penerima
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Nama Lengkap *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama lengkap" className={inputCls} style={{ paddingLeft: 40 }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Alamat Lengkap *</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jl. Contoh No. 1, Kecamatan, Kota, Kode Pos" rows={3}
                        className={inputCls + ' resize-none'} style={{ paddingLeft: 40 }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Nomor HP *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx" className={inputCls} style={{ paddingLeft: 40 }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Catatan (opsional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instruksi khusus untuk kurir..." rows={2}
                      className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </>
            )}

            {/* ── Delivery ────────────────────────────────────── */}
            {step === 'delivery' && (
              <>
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <FiTruck className="w-5 h-5" /> Pilih Pengiriman
                </div>
                <div className="space-y-3">
                  {[
                    { value: 'instant' as DeliveryType, label: 'Instan', desc: '30–60 menit sampai', fee: 15000, icon: '⚡' },
                    { value: 'scheduled' as DeliveryType, label: 'Terjadwal', desc: 'Pilih waktu pengiriman', fee: 10000, icon: '📅' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setDeliveryType(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        deliveryType === opt.value
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-slate-700 hover:border-green-500/40'
                      }`} style={{ background: deliveryType === opt.value ? undefined : '#273449' }}>
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.desc}</p>
                      </div>
                      <p className="text-sm font-extrabold text-yellow-400">{fmt(opt.fee)}</p>
                    </button>
                  ))}
                </div>

                {deliveryType === 'scheduled' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-3">
                      <FiClock className="w-4 h-4 text-green-400" /> Pilih Waktu
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'pagi' as DeliveryTime, label: 'Pagi', sub: '07–11', icon: '🌅' },
                        { value: 'siang' as DeliveryTime, label: 'Siang', sub: '11–15', icon: '☀️' },
                        { value: 'malam' as DeliveryTime, label: 'Malam', sub: '17–21', icon: '🌙' },
                      ].map((t) => (
                        <button key={t.value} onClick={() => setDeliveryTime(t.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                            deliveryTime === t.value ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-green-500/40'
                          }`} style={{ background: deliveryTime === t.value ? undefined : '#273449' }}>
                          <span className="text-xl">{t.icon}</span>
                          <p className="font-bold text-sm text-white">{t.label}</p>
                          <p className="text-[10px] text-slate-500">{t.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Payment ─────────────────────────────────────── */}
            {step === 'payment' && (
              <>
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <FiCreditCard className="w-5 h-5" /> Metode Pembayaran
                </div>
                <div className="space-y-3">
                  {[
                    { value: 'cod' as PaymentMethod, label: 'COD (Bayar di Tempat)', desc: 'Bayar saat paket tiba', icon: '💵' },
                    { value: 'transfer' as PaymentMethod, label: 'Transfer Bank', desc: 'BCA / BNI / Mandiri / BRI', icon: '🏦' },
                    { value: 'ewallet' as PaymentMethod, label: 'E-Wallet', desc: 'GoPay / OVO / DANA', icon: '📱' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setPayment(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        payment === opt.value ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-green-500/40'
                      }`} style={{ background: payment === opt.value ? undefined : '#273449' }}>
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{opt.label}</p>
                        <p className="text-xs text-slate-400">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === opt.value ? 'border-green-500' : 'border-slate-600'}`}>
                        {payment === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Review ──────────────────────────────────────── */}
            {step === 'review' && (
              <>
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <FiCheckCircle className="w-5 h-5" /> Konfirmasi Pesanan
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Data Penerima', content: (
                      <div className="space-y-1.5 text-sm">
                        <div className="flex gap-2"><FiUser className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" /><span className="text-slate-200">{name}</span></div>
                        <div className="flex gap-2"><FiMapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" /><span className="text-slate-200">{address}</span></div>
                        <div className="flex gap-2"><FiPhone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" /><span className="text-slate-200">{phone}</span></div>
                      </div>
                    )},
                    { label: 'Pengiriman & Pembayaran', content: (
                      <div className="text-sm space-y-1.5">
                        <p className="text-slate-200">🚚 {deliveryType === 'instant' ? 'Instan (30–60 menit)' : `Terjadwal – ${deliveryTime}`}</p>
                        <p className="text-slate-200">💳 {payment === 'cod' ? 'COD' : payment === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}</p>
                        {notes && <p className="text-slate-400 text-xs">📝 {notes}</p>}
                      </div>
                    )},
                  ].map(({ label, content }) => (
                    <div key={label} className="rounded-2xl p-4" style={CARD2}>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">{label}</p>
                      {content}
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                    ⚠️ {error}
                  </div>
                )}
              </>
            )}

            {/* Nav Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={back}
                className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-white/5 hover:text-white transition-all">
                ← Kembali
              </button>
              <button onClick={next} disabled={!canProceed() || loading}
                className="flex-1 btn-green py-3 text-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...
                  </span>
                ) : step === 'review' ? '✓ Buat Pesanan' : 'Lanjut →'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          <div className="p-5 sticky top-32 space-y-4" style={CARD}>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <FiShoppingCart className="w-4 h-4 text-green-400" /> Pesanan
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-2 text-xs">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#273449' }}>
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=P&background=1e3a2f&color=22c55e&size=36`; }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 font-medium leading-tight line-clamp-1">{item.product.name}</p>
                    <p className="text-slate-500">×{item.quantity}</p>
                  </div>
                  <p className="font-bold text-slate-300 flex-shrink-0">{fmt(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white font-semibold">{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Ongkos Kirim</span><span>{fmt(deliveryFee)}</span></div>
              <div className="flex justify-between text-base font-extrabold pt-1 border-t border-white/[0.06]">
                <span className="text-white">Total</span>
                <span className="text-yellow-400">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
