'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Calendar, Clock, FileText, MessageSquare, Star, CheckCircle, Loader2 } from 'lucide-react';
import Button from '../../../../components/ui/button';
import { PageTransition } from '../../../../components/shared/page-transition';
import { ChatWindow } from '../../../../components/chat/chat-window';
import { apiClient } from '../../../../lib/api-client';
import { showSuccessToast, showErrorToast } from '../../../../lib/error-handler';
import Link from 'next/link';
import { cn } from '../../../../lib/cn';

export default function MissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [mission, setMission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMission() {
      try {
        const data = await apiClient<any>(`/jobs/${id}`);
        setMission(data);
      } catch (err) {
        showErrorToast(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchMission();
  }, [id]);

  const completeMission = async () => {
    try {
      await apiClient(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      setMission({ ...mission, status: 'COMPLETED' });
      showSuccessToast('Mission marquée comme terminée !');
    } catch (err) {
      showErrorToast(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mission introuvable</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        
        <div className="bento-card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{mission.service?.name || mission.title || 'Mission'}</h1>
              <p className="text-sm text-muted-foreground mt-1">Mission #{id?.toString().slice(0,8)}</p>
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', 
              mission.status === 'SEARCHING' ? 'bg-amber-100 text-amber-700' : 
              mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            )}>
              {mission.status || 'En recherche'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {mission.address || 'Douala'}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> {mission.scheduledFor ? new Date(mission.scheduledFor).toLocaleDateString('fr-FR') : 'Dès que possible'}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Normale</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" /> {mission.service?.category?.name || 'Général'}</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{mission.description}</p>
        </div>

        {/* Quotes section */}
        <div className="bento-card">
          <h2 className="font-semibold mb-4">Devis reçus ({mission.quotes?.length || 0})</h2>
          {mission.quotes?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun devis reçu pour le moment.</p>
          ) : (
            mission.quotes?.map((q: any, i: number) => (
              <motion.div key={q.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl hover:bg-surface-container transition-colors mb-3 border border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Devis #{q.id?.slice(0,6)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.amount?.toLocaleString()} FCFA - {q.description || 'Proposition de service'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', 
                      q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      q.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {q.status || 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-center self-end mt-2 sm:mt-0">
                  {q.status === 'PENDING' && (
                    <Link href={`/client/payment?quoteId=${q.id}&jobId=${id}`}>
                      <Button size="sm">Accepter & Payer</Button>
                    </Link>
                  )}
                  {q.status === 'ACCEPTED' && (
                    <Button size="sm" variant="secondary" onClick={() => setShowChat(!showChat)}>
                      <MessageSquare className="h-4 w-4 mr-1.5" /> Contacter
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        {mission.status !== 'COMPLETED' && (
          <div className="flex gap-3 mt-8">
            <Button onClick={() => setShowChat(!showChat)} variant="secondary" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1.5" /> Poser une question
            </Button>
            <Button onClick={completeMission} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="h-4 w-4 mr-1.5" /> Marquer comme terminé
            </Button>
          </div>
        )}

        {showChat && <ChatWindow jobId={id as string} onClose={() => setShowChat(false)} />}
      </div>
    </PageTransition>
  );
}