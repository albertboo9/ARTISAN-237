'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertTriangle, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { cn } from '../../lib/cn';
import { PageTransition } from '../../components/shared/page-transition';
import { ProtectedRoute } from '../../components/auth/protected-route';

const disputes = [
  { id: '1', job: 'Plomberie salle de bain', client: 'Jean Dupont', artisan: 'Paul Tchuente', status: 'OPEN', date: '30 mai', reason: 'Retard important' },
  { id: '2', job: 'Installation électrique', client: 'Marie Ngono', artisan: 'Marc Ndjonga', status: 'INVESTIGATING', date: '28 mai', reason: 'Désaccord sur le prix' },
  { id: '3', job: 'Peinture salon', client: 'Pierre Kamga', artisan: 'Alice Moukouri', status: 'RESOLVED', date: '25 mai', reason: 'Qualité du travail' },
];

const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
  OPEN: { label: 'Ouvert', style: 'bg-red-100 text-red-700', icon: AlertTriangle },
  INVESTIGATING: { label: 'En cours', style: 'bg-amber-100 text-amber-700', icon: Clock },
  RESOLVED: { label: 'Résolu', style: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function AdminDisputesPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <PageTransition>
        <div className="space-y-6">
          <div><h1 className="text-2xl font-bold">Litiges</h1><p className="text-muted-foreground">Gérez les conflits entre clients et artisans</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Litiges ouverts', value: '1', color: 'bg-red-500/10 text-red-600' },
              { label: 'En investigation', value: '1', color: 'bg-amber-500/10 text-amber-600' },
              { label: 'Résolus', value: '1', color: 'bg-green-500/10 text-green-600' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bento-card">
                <div className="flex items-center gap-4"><div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', s.color)}><Scale className="h-6 w-6" /></div><div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></div>
              </motion.div>
            ))}
          </div>
          <div className="bento-card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-muted-foreground text-xs uppercase tracking-wider">
                <tr><th className="text-left p-4 font-medium">Mission</th><th className="text-left p-4 font-medium hidden sm:table-cell">Parties</th><th className="text-left p-4 font-medium">Statut</th><th className="text-left p-4 font-medium hidden md:table-cell">Raison</th></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {disputes.map((d, i) => {
                  const config = statusConfig[d.status];
                  const Icon = config.icon;
                  return (
                    <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-container/50 transition-colors">
                      <td className="p-4"><span className="font-medium text-foreground">{d.job}</span><p className="text-xs text-muted-foreground">{d.date}</p></td>
                      <td className="p-4 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{d.client} vs {d.artisan}</span></td>
                      <td className="p-4"><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', config.style)}><Icon className="h-3 w-3" />{config.label}</span></td>
                      <td className="p-4 hidden md:table-cell text-xs text-muted-foreground">{d.reason}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}