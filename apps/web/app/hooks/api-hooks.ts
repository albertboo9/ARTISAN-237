import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Result } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<Result<T>> {
  const token = localStorage.getItem('accessToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }));
    throw new Error(error.error?.message || 'Erreur réseau');
  }

  // Handle 204 No Content
  if (res.status === 204) return { success: true, data: null } as Result<T>;

  return res.json();
}

// ===== Auth Hooks =====

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Erreur de connexion');
      }
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/marketplace');
    },
  });

  const register = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Erreur lors de l\'inscription');
      }
      return res.json();
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiFetch('/users/me'),
    enabled: !!localStorage.getItem('accessToken'),
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: userData?.data,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
    isLoading: login.isLoading || register.isLoading || logout.isLoading || isUserLoading,
    isAuthenticated: !!localStorage.getItem('accessToken'),
  };
}

// ===== Artisan Hooks =====

export function useArtisanSearch() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  return useQuery({
    queryKey: ['artisans', { category, lat, lng }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (lat) params.set('lat', lat);
      if (lng) params.set('lng', lng);
      params.set('pageSize', '20');

      const result = await apiFetch<any>(`/marketplace/search?${params}`);
      return result.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useArtisan(id: string) {
  return useQuery({
    queryKey: ['artisan', id],
    queryFn: () => apiFetch(`/artisans/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ===== Mission Hooks =====

export function useMissions(status?: string) {
  return useQuery({
    queryKey: ['missions', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('pageSize', '20');
      const result = await apiFetch<any>(`/missions?${params}`);
      return result.data;
    },
    staleTime: 1000 * 60 * 1,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch('/missions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missions'] }),
  });
}

// ===== Review Hooks =====

export function useReviews(artisanId: string) {
  return useQuery({
    queryKey: ['reviews', artisanId],
    queryFn: () => apiFetch(`/reviews/${artisanId}?pageSize=10`),
    enabled: !!artisanId,
    staleTime: 1000 * 60 * 5,
  });
}

// ===== Gamification Hooks =====

export function useGamification() {
  return useQuery({
    queryKey: ['gamification'],
    queryFn: () => apiFetch('/gamification/my-progress'),
    staleTime: 1000 * 60 * 5,
  });
}

// ===== Notifications Hooks =====

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: () => apiFetch(`/notifications?unread=${unreadOnly}&pageSize=20`),
    staleTime: 1000 * 30,
  });
}