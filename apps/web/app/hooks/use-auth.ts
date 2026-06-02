'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { showErrorToast, showSuccessToast } from '../lib/error-handler';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, register, logout, fetchMe } = useAuthStore();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const loggedInUser = await login(email, password);
      showSuccessToast('Connexion réussie !');
      // Use the returned user (fresh data) instead of stale closure state
      if (loggedInUser?.role === 'ARTISAN') {
        router.push('/artisan');
      } else if (loggedInUser?.role === 'ADMIN') {
        router.push('/admin/disputes');
      } else {
        router.push('/client');
      }
    } catch (error) {
      showErrorToast(error);
    }
  }, [login, router]);

  const handleRegister = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'CLIENT' | 'ARTISAN';
  }) => {
    try {
      await register(data);
      showSuccessToast('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      router.push('/login');
    } catch (error) {
      showErrorToast(error);
    }
  }, [register, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    showSuccessToast('Déconnexion réussie');
    router.push('/');
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchMe,
  };
}