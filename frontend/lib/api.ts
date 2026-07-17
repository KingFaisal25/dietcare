import axios from 'axios';
import Cookies from 'js-cookie';
import { ensureCsrfCookie, readCsrfToken, clearCsrfToken } from './sanctum';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

/**
 * Interceptor REQUEST:
 * Untuk setiap mutasi (POST/PUT/PATCH/DELETE), pastikan header X-CSRF-TOKEN
 * tersedia. Kirim sebagai X-CSRF-TOKEN (bukan X-XSRF-TOKEN) karena:
 * - X-CSRF-TOKEN: Laravel membaca plain text langsung dari header → tidak perlu dekripsi
 * - X-XSRF-TOKEN: Laravel mendekripsi menggunakan encrypter (butuh cookie terenkripsi)
 * 
 * Token didapat dari /api/csrf via ensureCsrfCookie() dan disimpan di memori.
 */
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() ?? '';

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    let token = readCsrfToken();

    // Jika belum ada token, ambil dari server
    if (!token) {
      try {
        await ensureCsrfCookie();
        token = readCsrfToken();
      } catch {
        // Jika gagal ambil token, lanjutkan saja — server akan merespons 419
        // dan retry handler di bawah akan menanganinya
      }
    }

    if (token) {
      // KRITIS: Gunakan X-CSRF-TOKEN (plain), bukan X-XSRF-TOKEN (butuh enkripsi)
      config.headers.set('X-CSRF-TOKEN', token);
    }
  }

  return config;
});

/**
 * Interceptor RESPONSE:
 * Jika server merespons 419 (CSRF token mismatch/expired):
 * 1. Clear token cache
 * 2. Ambil token baru dari server
 * 3. Coba ulang request satu kali
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _csrfRetried?: boolean }) | undefined;

    if (error.response?.status === 419 && originalRequest && !originalRequest._csrfRetried) {
      originalRequest._csrfRetried = true;
      clearCsrfToken();

      try {
        await ensureCsrfCookie();
        const token = readCsrfToken();
        if (token) {
          originalRequest.headers.set('X-CSRF-TOKEN', token);
        }
      } catch {
        // ignore — biarkan request gagal
      }

      return api.request(originalRequest);
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove('role', { path: '/' });
        clearCsrfToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
