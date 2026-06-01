'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { cn } from './lib/cn';
import { Navbar } from './components/navbar';
import { useAuthStore } from './stores/auth.store';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchMe();
    setMounted(true);
  }, [fetchMe]);

  // Hide navbar on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="artisan237-theme"
    >
      <QueryClientProvider client={queryClient}>
        {!isAuthPage && <Navbar />}
        <main className={cn(
          'min-h-screen',
          !isAuthPage && 'pt-16',
        )}>
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-popover text-popover-foreground border border-border shadow-lg rounded-xl',
              success: 'bg-green-500 text-white border-green-600',
              error: 'bg-red-500 text-white border-red-600',
            },
            duration: 4000,
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}