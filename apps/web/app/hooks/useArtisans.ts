/**
 * ARTISAN-237 — Hook : Artisans
 * Requêtes TanStack Query pour la recherche et les profils artisans.
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api.client';

// ── Types ──────────────────────────────────────────────
export interface ArtisanResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string | null;
  phoneNumber: string;
  artisanProfile: {
    id: string;
    bio: string | null;
    rating: number;
    totalJobs: number;
    experienceYears: number;
    isAvailable: boolean;
    lastLat: number | null;
    lastLng: number | null;
    skills: { service: { name: string } }[];
  } | null;
  trustScore?: {
    overall: number;
    verificationScore: number;
    reliabilityScore: number;
    experienceScore: number;
    responsivenessScore: number;
  };
}

export interface ArtisanSearchParams {
  serviceId?: string;
  repere?: string;
  lat?: number;
  lng?: number;
}

export interface SearchResponse {
  total: number;
  ia_used: boolean;
  repère: string;
  artisans: ArtisanResult[];
}

// ── Recherche intelligente avec classement IA ───────────
export function useSearchArtisans(params: ArtisanSearchParams) {
  return useQuery<SearchResponse>({
    queryKey: ['artisans', 'search', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/artisans/search', { params });
      return data;
    },
    enabled: !!params.serviceId || !!params.repere,
    staleTime: 60_000,
  });
}

// ── Artisan par ID ─────────────────────────────────────
export function useArtisanById(id: string) {
  return useQuery<ArtisanResult>({
    queryKey: ['artisans', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── Tous les artisans (Marketplace) ────────────────────
export function useAllArtisans() {
  return useQuery<ArtisanResult[]>({
    queryKey: ['artisans', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', {
        params: { role: 'ARTISAN', limit: 50 },
      });
      return data;
    },
    staleTime: 60_000,
  });
}