'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface APIState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAPIStore = create<APIState>()(
  devtools(
    persist(
      (set) => ({
        isLoading: false,
        error: null,
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setError: (error: string | null) => set({ error: error }),
        clearError: () => set({ error: null }),
      }),
      { name: 'api-store' },
    ),
  ),
);

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        theme: 'system' as 'light' | 'dark' | 'system',
        setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme: theme }),
      }),
      { name: 'ui-store' },
    ),
  ),
);

interface SearchState {
  lastSearch: string;
  lastCategory: string;
  setLastSearch: (search: string, category: string) => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      lastSearch: '',
      lastCategory: '',
      setLastSearch: (search: string, category: string) => set({ lastSearch: search, lastCategory: category }),
    }),
  ),
);

interface MapState {
  center: [number, number];
  zoom: number;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    persist(
      (set) => ({
        center: [4.0511, 9.7679] as [number, number],
        zoom: 13,
        setCenter: (center: [number, number]) => set({ center: center }),
        setZoom: (zoom: number) => set({ zoom: zoom }),
      }),
      { name: 'map-store' },
    ),
  ),
);