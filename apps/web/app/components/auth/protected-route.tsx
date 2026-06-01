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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingScreen message="Chargement..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && !requiredRole.includes(user.role as any)) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}