'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { cn } from '@artisan237/ui';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { SheetProvider } from '@radix-ui/react-sheet';

// Create QueryClient outside component to avoid re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
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

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="artisan237-theme"
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={200}>
              <SheetProvider>
                {children}
              </SheetProvider>
            </TooltipProvider>
            <ReactQueryDevtools initialIsOpen={process.env.NODE_ENV === 'development'} />
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-popover text-popover-foreground border border-border',
              success: 'bg-green-500 text-white',
              error: 'bg-red-500 text-white',
              warning: 'bg-yellow-500 text-white',
              info: 'bg-blue-500 text-white',
            },
          }}
        />
      </body>
    </html>
  );
}