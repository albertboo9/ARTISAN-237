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
      return;
    }
    
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    if (!isLoading && requiredRole && user && !requiredRole.includes(user.role as any)) {
      router.replace('/');
      return;
    }
  }, [hasToken, isLoading, isAuthenticated, requiredRole, user, router]);

  if (!hasToken) {
    return <LoadingScreen message="Redirection vers la connexion..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Chargement..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Session invalide, redirection..." />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role as any)) {
    return <LoadingScreen message="Accès non autorisé..." />;
  }

  // Si pas de user mais isAuthenticated est true (incohérence), on attend
  if (!user) {
    return <LoadingScreen message="Chargement du profil..." />;
  }

  return <>{children}</>;
}