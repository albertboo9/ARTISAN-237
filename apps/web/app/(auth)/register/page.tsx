'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import { useAuthStore } from '../stores/auth.store';

export default function RegisterPage({ defaultTab }: { defaultTab?: 'login' | 'register' }) {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/marketplace');
    }
  }, [isInitialized, isAuthenticated, router]);

  return <AuthForm defaultTab={defaultTab} />;
}