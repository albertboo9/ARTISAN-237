'use client';

import { motion } from 'framer-motion';
import { Users, Briefcase, Scale, TrendingUp } from 'lucide-react';
import { cn } from '../lib/cn';
import { ProtectedRoute } from '../components/auth/protected-route';

export default function AdminPage() {
  const stats = [
    { label: 'Utilisateurs', value: '248', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Missions', value: '156', icon: Briefcase, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Litiges', value: '3', icon: Scale, color: 'bg-red-500/10 text-red-600' },
    { label: 'Revenus', value: '2.4M FCFA', icon: TrendingUp, color: 'bg-green-500/10 text-green-600' },
  ];

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Administration</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bento-card">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', s.color)}><Icon className="h-6 w-6" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="bento-card"><p className="text-sm text-muted-foreground">Connectez-vous avec un compte ADMIN pour accéder à cette section.</p></div>
      </div>
    </ProtectedRoute>
  );
}