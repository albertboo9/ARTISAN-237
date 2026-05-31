'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@artisan237/ui/components/ui/card';
import { LoadingSpinner } from '@artisan237/ui/components/ui/loading-spinner';
import { Users, Wrench, StarTrending, DollarSign } from 'lucide-react';

// Placeholder — real dashboard to be built after core modules are live
export default function AdminDashboardPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Fetch dashboard stats
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || loading) return <LoadingSpinner />;
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Artisans</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtisans ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Missions</CardTitle>
            <StarTrending className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMissions ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyRevenue ?? 0} FCFA</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}