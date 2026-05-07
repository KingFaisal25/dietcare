'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => {
    if (user && user.role) {
      Cookies.set('role', user.role, { 
        expires: 7, 
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict',
      });
    } else {
      Cookies.remove('role', { path: '/' });
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      // Set cookie so Next.js middleware can read it
      Cookies.set('token', token, { 
        expires: 7, 
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict',
      });
    } else {
      localStorage.removeItem('token');
      Cookies.remove('token', { path: '/' });
    }
    set({ token });
  },

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () => {
    localStorage.removeItem('token');
    Cookies.remove('token', { path: '/' });
    Cookies.remove('role', { path: '/' });
    set({ user: null, token: null, isLoading: false });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      set({ token, isLoading: false });
    }
  },
}));
