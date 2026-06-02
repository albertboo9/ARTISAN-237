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
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

  useEffect(() => {
    if (!hasToken) {
      router.replace('/login');
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return <LoadingScreen message="Redirection vers la connexion..." />;
  }

  // Still hydrating from persist
  if (isLoading) {
    return <LoadingScreen message="Chargement..." />;
  }

  // User loaded but doesn't have the right role
  if (requiredRole && user && !requiredRole.includes(user.role as any)) {
    router.replace('/');
    return null;
  }

  return <>{children}</>;
}