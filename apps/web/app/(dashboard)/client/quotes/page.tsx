'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle, ArrowRight, Loader2, MessageSquare, MapPin } from 'lucide-react';
import Button from '../../../components/ui/button';
import { showErrorToast, showSuccessToast } from '../../../lib/error-handler';
import apiClient from '../../../lib/api.client';
import Link from 'next/link';
import { cn } from '../../../lib/cn';

function unwrap(data: any) { return data?.data ?? data; }

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const { data } = await apiClient.get('/quotes?status=PENDING,ACCEPTED,REJECTED');
        const raw = data?.data ?? data;
        const list = raw?.data ?? raw;
        setQuotes(Array.isArray(list) ? list : []);
      } catch (err) {
        showErrorToast('Erreur lors du chargement des devis');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  const handleAccept = async (quoteId: string) => {
    setAcceptingId(quoteId);
    try {
      await apiClient.patch(`/quotes/${quoteId}/status`, { status: 'ACCEPTED' });
      showSuccessToast('Devis accepté !');
      const { data } = await apiClient.get('/quotes?status=PENDING,ACCEPTED,REJECTED');
      const raw = data?.data ?? data;
      const list = raw?.data ?? raw;
      setQuotes(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorToast('Erreur lors de l\'acceptation du devis');
    } finally {
      setAcceptingId(null);
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Mes devis reçus</h1>
          <p className="text-on-surface-variant mt-1">Consultez et acceptez les devis de vos artisans</p>
        </div>

        {quotes.length === 0 ? (
          <div className="bento-card text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 mx-auto mb-4">
              <FileText className="h-8 w-8 text-brand-primary" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">Aucun devis reçu</h3>
            <p className="text-on-surface-variant mt-2 max-w-md mx-auto">
              Vous n'avez pas encore reçu de devis pour vos missions. Les artisans vont bientôt répondre.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q: any, i: number) => {
              const config = statusConfig[q.status || 'PENDING'] || statusConfig.PENDING;
              const Icon = config.icon;
              const artisanName = q.artisan?.user?.firstName ? `${q.artisan.user.firstName} ${q.artisan.user.lastName}` : 'Artisan';
              return (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bento-card flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 flex-shrink-0">
                      <FileText className="h-6 w-6 text-brand-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface">{artisanName}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {q.job?.service?.name || 'Mission'} — {q.estimatedPrice ? `${Number(q.estimatedPrice).toLocaleString()} FCFA` : ''}
                      </p>
                      {q.description && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{q.description}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.style)}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </span>
                    
                    {q.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm"
                          isLoading={acceptingId === q.id}
                          onClick={() => handleAccept(q.id)}
                          className="bg-brand-primary text-white hover:bg-brand-hover">
                          <CheckCircle className="h-4 w-4 mr-1" /> Accepter
                        </Button>
                        <Link href={`/client/payment?quoteId=${q.id}&jobId=${q.jobId}`}>
                          <Button size="sm" variant="secondary" className="text-xs">
                            Payer <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                    {q.status === 'ACCEPTED' && (
                      <Link href={`/client/missions/${q.jobId}`}>
                        <Button variant="secondary" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" /> Voir la mission
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}