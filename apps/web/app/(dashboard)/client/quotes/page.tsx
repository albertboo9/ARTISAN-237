'use client';

import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { cn } from '../../../lib/cn';

const quotes = [
  { id: '1', artisan: 'Paul Tchuente', service: 'Plomberie', amount: 25000, status: 'PENDING', date: '2026-05-30' },
  { id: '2', artisan: 'Marc Ndjonga', service: 'Électricité', amount: 35000, status: 'ACCEPTED', date: '2026-05-28' },
];

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes devis</h1>
        <p className="text-muted-foreground">Consultez et acceptez les devis de vos artisans</p>
      </div>
      <div className="space-y-3">
        {quotes.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bento-card flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{q.artisan}</h3>
              <p className="text-xs text-muted-foreground">{q.service} — {q.amount.toLocaleString()} FCFA</p>
            </div>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', statusStyles[q.status])}>{q.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}