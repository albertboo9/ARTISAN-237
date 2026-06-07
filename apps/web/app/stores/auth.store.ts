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
  isKycVerified?: boolean;
  artisanProfile?: {
    id: string;
    metier?: string;
    repere?: string;
    trustScore?: number;
    totalJobs?: number;
    averageRating?: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      fetchMe: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (!token) {
            set({ isLoading: false });
            return;
  
        }

          const response = await apiClient.get('/users/me');
          // Gère les deux formats: { id, ... } ou { data: { id, ... } }
          const userData = response.data?.data ?? response.data;
          set({ user: userData as User, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          if (error?.response?.status !== 401) {
            // Si ce n'est pas une erreur 401, on garde le state actuel
            set({ isLoading: false });
            return;
          }
          // Token invalide/expiré sans refresh possible
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
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
       
