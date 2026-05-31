'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { useAuthStore } from '../stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/marketplace');
    }
  }, [isInitialized, isAuthenticated, router]);

  return <AuthForm defaultTab="login" />;
}