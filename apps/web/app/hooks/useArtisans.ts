/**
 * ARTISAN-237 — Hook : Artisans
 * Requêtes TanStack Query pour la recherche et les profils artisans.
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api.client';

// ── Types pour la recherche IA ──────────────────────
export interface ArtisanSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  rating: number;
  totalJobs: number;
  experienceYears: number;
  isAvailable: boolean;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  aiScore: number;
  aiRank: number;
  skills: { serviceId: string; serviceName: string }[];
}

export interface ArtisanSearchParams {
  serviceId?: string;
  repere?: string;
}

export interface SearchResponse {
  total: number;
  ia_used: boolean;
  repère: string;
  artisans: ArtisanSearchResult[];
}

// ── Type pour le profil complet ─────────────────────
export interface ArtisanProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string | null;
  phoneNumber: string;
  bio: string | null;
  rating: number;
  totalJobs: number;
  experienceYears: number;
  isAvailable: boolean;
  skills: { service: { name: string } }[];
  trustScore?: {
    overall: number;
    verificationScore: number;
    reliabilityScore: number;
    experienceScore: number;
    responsivenessScore: number;
  };
}

// ── Recherche intelligente avec classement IA ───────
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

// ── Artisan par ID ──────────────────────────────────
export function useArtisanById(id: string) {
  return useQuery<ArtisanProfile>({
    queryKey: ['artisans', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}