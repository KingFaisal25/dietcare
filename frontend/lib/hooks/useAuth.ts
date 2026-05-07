'use client';

import { useCallback } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { User } from '@/types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export function useAuth() {
  const router = useRouter();
  const { setUser, setToken, clearAuth, setLoading } = useAuthStore();

  const login = useCallback(
    async (login: string, password: string) => {
      setLoading(true);
      try {
        const response = await api.post<LoginResponse>('/login', {
          login,
          password,
        });

        const { user, access_token } = response.data.data;

        setToken(access_token);
        setUser(user);

        // Redirect based on role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'nutritionist':
            router.push('/nutritionist/dashboard');
            break;
          case 'client':
          default:
            router.push('/klien-dashboard');
            break;
        }

        return { success: true, message: response.data.message };
      } catch (error) {
        const apiError = error as AxiosError<ApiErrorResponse>;
        const status = apiError.response?.status;
        const data = apiError.response?.data;

        let message = 'Terjadi kesalahan. Silakan coba lagi.';

        if (status === 401) {
          message = 'Email atau password salah.';
        } else if (status === 403) {
          message = 'Email belum diverifikasi. Silakan cek email Anda.';
        } else if (status === 422 && data?.errors) {
          const firstError = Object.values(data.errors)[0];
          message = firstError?.[0] || data.message;
        } else if (status === 429) {
          message = 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.';
        } else if (data?.message) {
          message = data.message;
        }

        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setToken, setLoading]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      try {
        const response = await api.post<RegisterResponse>('/register', data);
        return { success: true, message: response.data.message };
      } catch (error) {
        const apiError = error as AxiosError<ApiErrorResponse>;
        const status = apiError.response?.status;
        const errorData = apiError.response?.data;

        let message = 'Terjadi kesalahan. Silakan coba lagi.';

        if (status === 422 && errorData?.errors) {
          // Return field-level errors
          return {
            success: false,
            message: errorData.message || 'Validasi gagal.',
            errors: errorData.errors,
          };
        } else if (errorData?.message) {
          message = errorData.message;
        }

        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  const getUser = useCallback(async () => {
    try {
      const response = await api.get('/me');
      const user = response.data.data as User;
      setUser(user);
      return user;
    } catch {
      clearAuth();
      return null;
    }
  }, [setUser, clearAuth]);

  return { login, register, logout, getUser };
}
