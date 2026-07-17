import axios from 'axios';

// Cache token dalam memori. Ini OK karena:
// - Token diambil fresh dari server setiap kali tidak ada
// - Retry otomatis saat 419 (lihat api.ts)
// - Tidak bergantung pada cookie XSRF-TOKEN yang sekarang terenkripsi
let cachedCsrfToken: string | null = null;

/**
 * Membaca CSRF token dari cache.
 * Token didapat dari endpoint /api/csrf (web middleware, session-based).
 */
export function readCsrfToken(): string | null {
  return cachedCsrfToken;
}

/**
 * Hapus cache token (dipanggil saat 419 atau logout).
 */
export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

/**
 * Backend origin untuk request Sanctum.
 * Dengan proxy Next.js, panggilan API bersifat same-origin (localhost:3000).
 */
export function getBackendUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';

  if (apiUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, '');
  }

  return apiUrl.replace(/\/api\/?$/, '');
}

const sanctumHeaders = {
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

/**
 * Mengambil CSRF token dengan alur yang benar:
 *
 * 1. GET /sanctum/csrf-cookie → menginisialisasi session Laravel
 *    (Laravel set cookie laravel_session + XSRF-TOKEN terenkripsi)
 * 2. GET /api/csrf → mendapatkan raw CSRF token via JSON
 *    (endpoint ini ada di routes/web.php dengan middleware 'web',
 *     sehingga dapat mengakses session yang sama)
 *
 * Token raw ini kemudian dikirim sebagai header X-CSRF-TOKEN pada
 * setiap request mutasi (POST/PUT/PATCH/DELETE).
 * Laravel membaca X-CSRF-TOKEN secara langsung tanpa dekripsi.
 */
export async function ensureCsrfCookie(): Promise<void> {
  const backendUrl = getBackendUrl();

  // Step 1: Inisialisasi session cookie Sanctum
  await axios.get(`${backendUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: sanctumHeaders,
  });

  // Step 2: Ambil raw CSRF token dari JSON endpoint
  // Endpoint ini menggunakan middleware 'web' sehingga session sudah ada
  const { data } = await axios.get<{ token: string }>(`${backendUrl}/api/csrf`, {
    withCredentials: true,
    headers: sanctumHeaders,
  });

  if (!data?.token) {
    throw new Error('Gagal mendapatkan CSRF token dari server');
  }

  cachedCsrfToken = data.token;
}

/** @deprecated Gunakan ensureCsrfCookie */
export const getCsrfCookie = ensureCsrfCookie;

/** @deprecated Gunakan getBackendUrl */
export const getSanctumOrigin = getBackendUrl;
