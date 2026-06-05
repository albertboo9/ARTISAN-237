import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../lib/api.client';

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
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      fetchMe: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const user = await apiClient.get<User>('/users/me').then(res => res.data);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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