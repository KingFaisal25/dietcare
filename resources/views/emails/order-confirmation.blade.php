<x-mail::message>
# Pembayaran Berhasil! 🎉

Halo **{{ $userName }}**,

Terima kasih telah memilih DietCare Salma. Pembayaran Anda telah kami terima.

---

## Detail Pesanan

| | |
|---|---|
| **Kode Order** | {{ $orderCode }} |
| **Program** | {{ $programName }} |
| **Durasi** | {{ $durationDays }} hari |
| **Total Bayar** | {{ $totalAmount }} |
| **Metode Bayar** | {{ $paymentMethod }} |
| **Waktu Bayar** | {{ $paidAt }} |
| **Ahli Gizi** | {{ $nutritionistName }} |

---

## Langkah Selanjutnya

1. **Lengkapi profil gizi Anda** — Isi data fisik, kondisi medis, dan preferensi makanan untuk program yang lebih personal.
2. **Kenalan dengan ahli gizi** — Ahli gizi Anda akan menghubungi dalam 1×24 jam untuk sesi konsultasi awal.
3. **Mulai program** — Meal plan personal dan panduan harian akan segera disiapkan untuk Anda.

<x-mail::button :url="$dashboardUrl">
Buka Dashboard Saya
</x-mail::button>

Jika ada pertanyaan, jangan ragu untuk menghubungi kami via WhatsApp.

Salam sehat,<br>
**Tim DietCare Salma**
</x-mail::message>
