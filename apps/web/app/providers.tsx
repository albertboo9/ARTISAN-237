'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { cn } from './lib/cn';
import { Navbar } from './components/navbar';
import { OnboardingTour } from './components/tour/onboarding-tour';
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

  // Hide navbar on auth pages AND dashboard pages (dashboard has its own sidebar)
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password');
  const isDashboardPage = pathname?.startsWith('/artisan') || pathname?.startsWith('/client');
  const hideNavbar = isAuthPage || isDashboardPage;

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
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
        {!hideNavbar && <Navbar />}
        {!hideNavbar && <OnboardingTour />}
        <main className={cn(
          'min-h-screen',
          !hideNavbar && 'pt-16',
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