import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api-client';

export interface User {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  role: 'CLIENT' | 'ARTISAN' | 'ADMIN' | 'SUPPORT';
  status: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'CLIENT' | 'ARTISAN';
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        const res = await apiClient<{
          accessToken: string;
          refreshToken?: string;
          user: User;
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          skipAuth: true,
        });

        if ('accessToken' in res && 'user' in res) {
          localStorage.setItem('accessToken', res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem('refreshToken', res.refreshToken);
          }
          set({ user: res.user, isAuthenticated: true });
        }
        return res.user;
      },

      register: async (data) => {
        const res = await apiClient<{ user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
          skipAuth: true,
        });
        set({ user: res.user, isAuthenticated: false });
      },

      logout: async () => {
        try {
          await apiClient('/auth/logout', { method: 'POST' });
        } catch {
          // Ignore logout errors
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const user = await apiClient<User>('/users/me');
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'artisan237-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);