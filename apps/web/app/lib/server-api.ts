import 'server-only';

import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function serverFetch<T>(endpoint: string): Promise<Result<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }));
    throw new Error(error.error?.message || 'Erreur réseau');
  }

  return res.json();
}

type Result<T> = {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export async function getServerArtisans(params?: Record<string, string>) {
  const queryString = params
    ? `?${new URLSearchParams(params).toString()}`
    : '';
  return serverFetch<any[]>(`/marketplace/search${queryString}`);
}

export async function getServerStats() {
  return serverFetch<any>('/marketplace/stats');
}

export async function getServerArtisan(id: string) {
  return serverFetch<any>(`/artisans/${id}`);
}