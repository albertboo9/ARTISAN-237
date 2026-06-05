'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { cn } from './lib/cn';
import { Navbar } from './components/navbar';
import { OnboardingTour } from './components/tour/onboarding-tour';
import { useAuthStore } from './stores/auth.store';
import { ToastProvider } from './components/ui/Toast';

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
    fetchMe().finally(() => setMounted(true));
  }, [fetchMe]);

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password');
  const isDashboardPage = pathname?.startsWith('/artisan') || pathname?.startsWith('/client');
  const hideNavbar = isAuthPage || isDashboardPage;

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-bg">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#006c49" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="66" opacity={0.8} />
          </svg>
          <span className="text-lg font-bold text-brand-primary">237</span>
        </div>
        <p className="text-sm text-on-surface-variant font-medium mt-6">Chargement...</p>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange storageKey="artisan237-theme">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {!hideNavbar && <Navbar />}
          {!hideNavbar && <OnboardingTour />}
          <main className={cn('min-h-screen', !hideNavbar && 'pt-16')}>
            {children}
          </main>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}