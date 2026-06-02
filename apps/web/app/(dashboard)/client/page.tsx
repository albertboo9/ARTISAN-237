'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Briefcase, FileText, Clock, ArrowRight, TrendingUp, Star, MapPin } from 'lucide-react';
import Button from '../../components/ui/button';
import { cn } from '../../lib/cn';
import { Chart } from '../../components/ui/chart';
import { PageTransition, StaggerContainer, StaggerItem } from '../../components/shared/page-transition';

import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../lib/api-client';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ active: 0, quotes: 0, inProgress: 0, completed: 0 });
  const [missions, setMissions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const json = await apiClient<any>(`/jobs?clientId=${user.id}`);
        const list = json?.data || json || [];
        setMissions(list.slice(0, 5));

        setStats({
          active: list.filter((j: any) => j.status === 'SEARCHING' || j.status === 'QUOTE_ACCEPTED').length,
          quotes: list.filter((j: any) => j.status === 'QUOTE_ACCEPTED').length,
          inProgress: list.filter((j: any) => j.status === 'IN_PROGRESS').length,
          completed: list.filter((j: any) => j.status === 'COMPLETED').length,
        });

        // Mock chart data for now - will be replaced with real stats API
        setChartData([
          { name: 'Jan', missions: 4, devis: 2 },
          { name: 'Fév', missions: 3, devis: 5 },
          { name: 'Mar', missions: 6, devis: 3 },
          { name: 'Avr', missions: 8, devis: 4 },
          { name: 'Mai', missions: 5, devis: 7 },
          { name: 'Jun', missions: 7, devis: 5 },
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statItems = [
    { label: 'Missions actives', value: stats.active.toString(), icon: Briefcase, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Devis reçus', value: stats.quotes.toString(), icon: FileText, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'En cours', value: stats.inProgress.toString(), icon: Clock, color: 'bg-green-500/10 text-green-600' },
    { label: 'Complétées', value: stats.completed.toString(), icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">Gérez vos missions et suivez vos projets</p>
          </div>
          <Link href="/client/create">
            <Button><Plus className="h-4 w-4 mr-1.5" /> Nouvelle mission</Button>
          </Link>
        </div>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <div className="bento-card">
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{isLoading ? '-' : stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Chart */}
        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-4">Activité mensuelle</h3>
          <Chart data={chartData} lines={[
            { key: 'missions', color: '#006c49', label: 'Missions' },
            { key: 'devis', color: '#f59e0b', label: 'Devis' },
          ]} type="area" />
        </div>

        {/* Missions récentes */}
        <StaggerContainer>
          <h2 className="text-lg font-semibold text-foreground mb-4">Missions récentes</h2>
          {missions.length === 0 && !isLoading ? (
            <div className="bento-card text-center py-12 flex flex-col items-center justify-center border-dashed border-2 bg-surface-container/30">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Aucune mission publiée</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Vous n'avez pas encore publié de mission. Créez votre première mission pour recevoir des devis de nos artisans.
              </p>
              <Link href="/client/create">
                <Button><Plus className="h-4 w-4 mr-1.5" /> Nouvelle mission</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.map((m: any, i: number) => (
                <StaggerItem key={m.id || i}>
                  <div className="bento-card flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{m.title || 'Mission'}</h3>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1', 
                        m.status === 'SEARCHING' ? 'bg-amber-100 text-amber-700' : 
                        m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      )}>{m.status || 'SEARCHING'}</span>
                    </div>
                    <Link href={`/client/missions/${m.id}`}><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
                  </div>
                </StaggerItem>
              ))}
            </div>
          )}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}