'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, TrendingUp, Star, ShieldCheck, Clock, Settings, ArrowRight, Users } from 'lucide-react';
import Button from '../../components/ui/button';
import { cn } from '../../lib/cn';

export default function ArtisanDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace Artisan</h1>
          <p className="text-muted-foreground">Gérez votre profil, soumettez des devis et suivez vos missions</p>
        </div>
        <Link href="/dashboard/artisan/profil">
          <Button variant="secondary"><Settings className="h-4 w-4 mr-1.5" /> Modifier mon profil</Button>
        </Link>
      </div>

      {/* KYC Banner */}
      <div className="bento-card bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200/50">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">Vérification KYC requise</h3>
            <p className="text-xs text-amber-700/80">Pour recevoir des missions, vérifiez votre identité via Didit.</p>
          </div>
          <Link href="/dashboard/artisan/kyc">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Vérifier maintenant</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Devis soumis', value: '8', icon: FileText, color: 'bg-blue-500/10 text-blue-600' },
          { label: 'Devis acceptés', value: '5', icon: Star, color: 'bg-amber-500/10 text-amber-600' },
          { label: 'Missions en cours', value: '2', icon: Clock, color: 'bg-green-500/10 text-green-600' },
          { label: 'Missions complétées', value: '15', icon: TrendingUp, color: 'bg-purple-500/10 text-purple-600' },
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

      {/* Recent quotes + Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Devis récents</h2>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">Réparation plomberie - Douala</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">En attente</span>
                  <span className="text-xs text-muted-foreground">25 000 FCFA</span>
                </div>
              </div>
              <Link href="/dashboard/artisan/devis">
                <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Votre profil</h2>
          <div className="bento-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
                PT
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Paul Tchuente</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 4.8
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-container text-center">
                <p className="text-lg font-semibold text-foreground">10+</p>
                <p className="text-xs text-muted-foreground">Ans d'exp.</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container text-center">
                <p className="text-lg font-semibold text-green-600">Disponible</p>
                <p className="text-xs text-muted-foreground">Statut</p>
              </div>
            </div>
            <Link href="/dashboard/artisan/profil">
              <Button variant="secondary" size="sm" className="w-full"><Users className="h-4 w-4 mr-1.5" /> Voir mon profil</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}