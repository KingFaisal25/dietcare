'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => {
    let formattedUser = user;
    if (user && user.avatar && !user.avatar.startsWith('http')) {
      formattedUser = {
        ...user,
        avatar: user.avatar.startsWith('/') ? user.avatar : `/storage/${user.avatar}`
      };
    }

    if (formattedUser && formattedUser.role) {
      Cookies.set('role', formattedUser.role, {
        expires: 7,
        path: '/',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        sameSite: 'Strict',
      });
    } else {
      Cookies.remove('role', { path: '/' });
    }
    set({ user: formattedUser, isLoading: false });
  },

  setToken: (token: string) => {
    // Store token in cookie for API requests
    Cookies.set('token', token, {
      expires: 7,
      path: '/',
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      sameSite: 'Strict',
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () => {
    Cookies.remove('role', { path: '/' });
    Cookies.remove('token', { path: '/' });
    set({ user: null, isLoading: false });
  },

  initialize: () => {
    // With session auth, we'll rehydrate user profile from api.me on app mount
    set({ isLoading: false });
  },
}));

