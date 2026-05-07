/**
 * wa.ts — Utility untuk membuat link WhatsApp
 *
 * Nomor WA dikonfigurasi dari environment variable NEXT_PUBLIC_WA_NUMBER.
 * Semua komponen WA menggunakan helper ini agar nomor bisa diubah
 * dari satu tempat saja.
 */

// Ambil nomor dari env, fallback ke nomor default
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '6281234567890';

/**
 * Buat link WhatsApp yang siap diklik
 *
 * @param message — Pesan yang akan di-pre-fill di chat WA
 * @param number  — Opsional, override nomor default
 * @returns string — URL wa.me dengan pesan ter-encode
 */
export function getWaLink(message: string, number?: string): string {
  const phone = number || WA_NUMBER;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ── Pre-built pesan untuk berbagai konteks ──────────────

/** Pesan default untuk tombol floating */
export const WA_MSG_DEFAULT =
  'Halo kak, saya mau konsultasi gizi gratis. Boleh bantu rekomendasikan program yang cocok untuk saya?';

/** Pesan untuk tombol di kartu program */
export function getWaProgramMsg(programName: string): string {
  return `Halo kak, saya tertarik dengan program ${programName}. Boleh tanya-tanya dulu sebelum daftar?`;
}

/** Pesan untuk tombol di halaman pricing */
export const WA_MSG_PRICING =
  'Halo kak, saya sudah lihat daftar harga program di website. Boleh konsultasi gratis dulu sebelum saya memilih?';

/** Pesan untuk halaman detail program */
export function getWaProgramDetailMsg(programName: string, price: string): string {
  return `Halo kak, saya mau tanya tentang program ${programName} (${price}). Apakah program ini cocok untuk kondisi saya?`;
}
