'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Briefcase, FileText, Clock, ArrowRight, TrendingUp, Star, MapPin } from 'lucide-react';
import Button from '../../components/ui/button';
import { cn } from '../../lib/cn';

export default function ClientDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Gérez vos missions et suivez vos projets</p>
        </div>
        <Link href="/dashboard/client/create">
          <Button><Plus className="h-4 w-4 mr-1.5" /> Nouvelle mission</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Missions actives', value: '3', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Devis reçus', value: '12', icon: FileText, color: 'bg-amber-500/10 text-amber-600' },
          { label: 'En cours', value: '2', icon: Clock, color: 'bg-green-500/10 text-green-600' },
          { label: 'Complétées', value: '28', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card"
            >
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent missions + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Missions récentes</h2>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">Réparation plomberie salle de bain</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">En attente</span>
                  <span className="text-xs text-muted-foreground">Il y a 2 jours</span>
                </div>
              </div>
              <Link href={`/dashboard/client/missions`}>
                <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Artisans recommandés</h2>
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                  PT
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">Paul Tchuente</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500" /> 4.8</span>
                    <span><MapPin className="h-3 w-3 inline" /> 2.3 km</span>
                  </div>
                </div>
                <div className="flex h-7 items-center px-2 rounded-md bg-primary/5 text-[10px] font-semibold text-primary">
                  Match 96%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}