'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api-client';
import Button from '../../../components/ui/button';
import Link from 'next/link';
import { PageTransition } from '../../../components/shared/page-transition';

export default function QuotesPage() {
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      if (!user?.id) return;
      try {
        const data = await apiClient<any[]>(`/quotes?clientId=${user.id}`);
        setQuotes(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, [user]);

  const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
    PENDING: { label: 'En attente', style: 'bg-amber-100 text-amber-700', icon: Clock },
    ACCEPTED: { label: 'Accepté', style: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Refusé', style: 'bg-red-100 text-red-700', icon: XCircle },
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Mes devis</h1>
          <p className="text-muted-foreground">Consultez et acceptez les devis de vos artisans</p>
        </div>

        {quotes.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Aucun devis reçu</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Vous n'avez pas encore reçu de devis pour vos missions. Patientez un peu, les artisans vont bientôt répondre.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q, i) => {
              const config = statusConfig[q.status || 'PENDING'] || statusConfig.PENDING;
              const Icon = config.icon;
              return (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bento-card flex flex-col sm:flex-row sm:items-center gap-4 border border-border/50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate">{q.job?.title || 'Mission'} - Par {q.artisan?.firstName || 'Artisan'}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reçu le {new Date(q.createdAt).toLocaleDateString('fr-FR')} — {q.amount?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-border sm:border-0 justify-between sm:justify-end">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.style)}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </span>
                    
                    {q.status === 'PENDING' && (
                      <Link href={`/client/payment?quoteId=${q.id}&jobId=${q.jobId}`}>
                        <Button size="sm">
                          Payer <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Button>
                      </Link>
                    )}
                    {q.status === 'ACCEPTED' && (
                      <Link href={`/client/missions/${q.jobId}`}>
                        <Button variant="secondary" size="sm">Voir la mission</Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}