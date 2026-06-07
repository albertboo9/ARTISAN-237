'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Briefcase, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/button';
import { cn } from '../../../lib/cn';
import apiClient from '../../../lib/api.client';

const statusStyles: Record<string, string> = {
  SEARCHING: 'bg-amber-100 text-amber-700',
  QUOTE_ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/jobs')
      .then(({ data }) => {
        const list = data?.data || data || [];
        setMissions(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes missions</h1>
          <p className="text-muted-foreground">Suivez l'état de vos demandes</p>
        </div>
        <Link href="/client/create"><Button><Plus className="h-4 w-4 mr-1.5" /> Nouvelle mission</Button></Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : missions.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">Aucune mission</h3>
          <p className="text-muted-foreground mb-6">Créez votre première mission pour trouver un artisan</p>
          <Link href="/client/create"><Button>Créer une mission</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission: any, i: number) => (
            <motion.div key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bento-card flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{mission.description || 'Mission'}</h3>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1', statusStyles[mission.status] || 'bg-gray-100 text-gray-700')}>
                  {mission.status || 'SEARCHING'}
                </span>
              </div>
              <Link href={`/client/missions/${mission.id}`}><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}