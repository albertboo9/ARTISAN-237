/**
 * ARTISAN-237 — Hook : Missions Client
 * Récupère les missions du client connecté via TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api.client';

export interface Mission {
  id: string;
  description: string;
  status: string;
  address: string;
  lat: number;
  lng: number;
  createdAt: string;
  service?: {
    id: string;
    name: string;
  };
  quotes?: {
    id: string;
    estimatedPrice: number;
    status: string;
    artisan: {
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  }[];
  escrow?: {
    id: string;
    amount: number;
    status: string;
  };
}

export function useClientMissions() {
  return useQuery<Mission[]>({
    queryKey: ['client', 'missions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/my');
      // Gère le TransformInterceptor
      return data?.data ?? data ?? [];
    },
  });
}

export function useMissionById(id: string) {
  return useQuery<Mission>({
    queryKey: ['client', 'missions', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}