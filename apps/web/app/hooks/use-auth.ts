'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';
import { showErrorToast, showSuccessToast } from '../lib/error-handler';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, register, logout, fetchMe } = useAuthStore();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const loggedInUser = await login(email, password);
      showSuccessToast('Connexion réussie !');
      // Use window.location for a hard redirect that reinitializes all stores
      if (loggedInUser?.role === 'ARTISAN') {
        window.location.href = '/artisan';
      } else if (loggedInUser?.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/client';
      }
    } catch (error) {
      showErrorToast(error);
    }
  }, [login]);

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
      window.location.href = '/login';
    } catch (error) {
      showErrorToast(error);
    }
  }, [register]);

  const handleLogout = useCallback(async () => {
    await logout();
    showSuccessToast('Déconnexion réussie');
    window.location.href = '/';
  }, [logout]);

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