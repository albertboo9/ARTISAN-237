/**
 * ARTISAN-237 — Hook : Authentification
 * Connexion au backend NestJS : login, register, logout, profil.
 * Utilise axios DIRECTEMENT (pas apiClient) pour éviter l'intercepteur 401
 * qui redirigerait vers /login en cas d'échec.
 * 
 * Source unique de vérité : React Query.
 * Le store Zustand est synchronisé après chaque opération.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import apiClient from '../lib/api.client';
import { useAuthStore } from '../stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ── Types ──────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'CLIENT' | 'ARTISAN';
}

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

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ── Helper : synchroniser Zustand avec React Query ─────
function syncAuthStore(user: User | null) {
  useAuthStore.getState().setUser(user || null);
}

// ── Login (sans intercepteur !) ────────────────────────
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post(`${API_URL}/auth/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Debug: voir la structure réelle de la réponse
      // eslint-disable-next-line no-console
      console.log('LOGIN RAW RESPONSE:', JSON.stringify(res.data).slice(0, 500));
      
      const raw = res.data;
      // Gère les deux formats: avec ou sans TransformInterceptor
      let body: any = raw;
      // Si enveloppé par l'interceptor: { success, data, meta }
      if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
        body = body.data;
      }
      return body as LoginResponse;
    },
    onSuccess: async (data) => {
      // Debug: voir ce qu'on reçoit
      // eslint-disable-next-line no-console
      console.log('LOGIN ONSUCCESS DATA:', JSON.stringify(data).slice(0, 500));
      
      if (!data || !data.accessToken) {
        throw new Error('Réponse de login invalide');
      }
      
      // Stocker les tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken || '');
      
      // Cookie de session pour le middleware Next.js (renouvelé à chaque login)
      document.cookie = 'session=active; path=/; max-age=86400; SameSite=Lax';

      // Mettre à jour le cache React Query avec l'utilisateur
      if (data.user) {
        queryClient.setQueryData(['auth', 'me'], data.user);
        syncAuthStore(data.user);
      } else {
        // Si user non fourni, essayer de le récupérer
        try {
          const { data: userData } = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          const userBody = (userData?.data ?? userData) as User;
          queryClient.setQueryData(['auth', 'me'], userBody);
          syncAuthStore(userBody);
        } catch {
          // On laisse la redirection se faire
        }
      }
    },
  });
}

// ── Register ───────────────────────────────────────────
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post(`${API_URL}/auth/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const raw = res.data;
      const body = raw?.data ?? raw;
      return body as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      syncAuthStore(data.user);
    },
  });
}

// ── Profil utilisateur connecté ────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data as User;
    },
    retry: false,
    staleTime: 60_000,
  });
}

// ── Logout ─────────────────────────────────────────────
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Même si le serveur est down, on déconnecte localement
      }
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.removeQueries();
      syncAuthStore(null);
    },
    onSettled: () => {
      window.location.href = '/login';
    },
  });
}