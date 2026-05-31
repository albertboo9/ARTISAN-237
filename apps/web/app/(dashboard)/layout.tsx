'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useEffect } from 'react';
import { ProtectedRoute } from '../components/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['USER', 'ARTISAN', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}