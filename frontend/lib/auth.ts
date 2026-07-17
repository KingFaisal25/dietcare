import api from './api';
import { User } from '@/types';
import { buildApiUrl } from './url';
import { ensureCsrfCookie, readCsrfToken } from './sanctum';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    redirect: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export { ensureCsrfCookie, getCsrfCookie } from './sanctum';

export async function sanctumFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    await ensureCsrfCookie();
  } catch {
    // CSRF prefetch gagal — lanjutkan, interceptor di api.ts akan retry jika perlu
  }

  const csrfToken = readCsrfToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Gunakan X-CSRF-TOKEN (plain text) bukan X-XSRF-TOKEN (butuh dekripsi)
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

/**
 * Login flow: try CSRF setup first, then POST /api/login.
 */
export async function loginApi(login: string, password: string): Promise<LoginResponse> {
  try {
    await ensureCsrfCookie();
  } catch {
    // Local dev may skip CSRF — login still proceeds
  }

  const response = await api.post<LoginResponse>('/login', { login, password });
  return response.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await ensureCsrfCookie();
  } catch {
    // ignore
  }
  await api.post('/logout');
}

export async function getUserApi(): Promise<User> {
  const response = await api.get<{ data: User }>('/me');
  return response.data.data;
}

export function resolveApiUrl(path: string): string {
  return buildApiUrl(path);
}
