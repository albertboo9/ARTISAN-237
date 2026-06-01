'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/cn';

export default function ArtisanDevisPage() {
  const devis = [
    { id: '1', client: 'Jean Dupont', service: 'Plomberie', amount: 25000, status: 'PENDING', date: '30 mai' },
    { id: '2', client: 'Marie Ngono', service: 'Électricité', amount: 35000, status: 'ACCEPTED', date: '28 mai' },
    { id: '3', client: 'Pierre Kamga', service: 'Menuiserie', amount: 45000, status: 'REJECTED', date: '25 mai' },
  ];

  const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
    PENDING: { label: 'En attente', style: 'bg-amber-100 text-amber-700', icon: Clock },
    ACCEPTED: { label: 'Accepté', style: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Refusé', style: 'bg-red-100 text-red-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes devis</h1>
        <p className="text-muted-foreground">Suivez les devis que vous avez soumis</p>
      </div>
      <div className="space-y-3">
        {devis.map((d, i) => {
          const config = statusConfig[d.status];
          const Icon = config.icon;
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bento-card flex items-center gap-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{d.client}</h3>
                <p className="text-xs text-muted-foreground">{d.service} — {d.amount.toLocaleString()} FCFA</p>
              </div>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', config.style)}>
                <Icon className="h-3 w-3" /> {config.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}