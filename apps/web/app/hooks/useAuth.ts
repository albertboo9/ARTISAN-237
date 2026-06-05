/**
 * ARTISAN-237 — Hook : Authentification
 * Connexion au backend NestJS : login, register, logout, profil.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api.client';

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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber: string;
    status: string;
  };
}

// ── Login ──────────────────────────────────────────────
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
}

// ── Register ───────────────────────────────────────────
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });
}

// ── Profil utilisateur connecté ────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/me');
      return data;
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
    },
    onSettled: () => {
      window.location.href = '/login';
    },
  });
}