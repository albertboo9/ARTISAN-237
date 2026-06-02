'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, Loader2, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import { showErrorToast, showSuccessToast } from '../../../lib/error-handler';
import Button from '../../../components/ui/button';
import { PageTransition } from '../../../components/shared/page-transition';

export default function ArtisanDevisPage() {
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      if (!user?.id) return;
      try {
        const data = await apiClient<any[]>(`/quotes?artisanId=${user.id}`);
        setQuotes(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, [user]);

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Voulez-vous vraiment annuler ce devis ?')) return;
    try {
      await apiClient(`/quotes/${quoteId}`, { method: 'DELETE' });
      setQuotes(quotes.filter(q => q.id !== quoteId));
      showSuccessToast('Devis annulé');
    } catch (err) {
      showErrorToast(err);
    }
  };

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
          <p className="text-muted-foreground">Suivez les devis que vous avez soumis aux clients</p>
        </div>

        {quotes.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Aucun devis soumis</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Vous n'avez pas encore soumis de devis. Parcourez les missions disponibles pour proposer vos services.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quotes.map((d, i) => {
              const config = statusConfig[d.status || 'PENDING'] || statusConfig.PENDING;
              const Icon = config.icon;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bento-card flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold truncate text-foreground">{d.job?.title || 'Mission'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Soumis le {new Date(d.createdAt).toLocaleDateString('fr-FR')} • {d.amount?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-border sm:border-0">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.style)}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </span>
                    
                    {d.status === 'PENDING' && (
                      <div className="flex items-center gap-2 ml-auto sm:ml-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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