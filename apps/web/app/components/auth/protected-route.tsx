'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { LoadingScreen } from '../shared/loading-screen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ('CLIENT' | 'ARTISAN' | 'ADMIN')[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasToken) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, hasToken, router]);

  if (isLoading) {
    return <LoadingScreen message="Chargement..." />;
  }

  if (!isAuthenticated && !hasToken) {
    return null;
  }

  if (requiredRole && user && !requiredRole.includes(user.role as any)) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}