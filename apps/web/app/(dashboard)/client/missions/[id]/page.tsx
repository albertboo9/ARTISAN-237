'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Calendar, Clock, FileText, MessageSquare, Star, CheckCircle, Loader2, Sparkles, ShieldCheck, User } from 'lucide-react';
import Button from '../../../../components/ui/button';
import { PageTransition } from '../../../../components/shared/page-transition';
import { ChatWindow } from '../../../../components/chat/ChatWindow';
import { showSuccessToast, showErrorToast } from '../../../../lib/error-handler';
import apiClient from '../../../../lib/api.client';
import Link from 'next/link';
import { cn } from '../../../../lib/cn';

function unwrap(data: any) {
  return data?.data ?? data;
}

export default function MissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [mission, setMission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    async function fetchMission() {
      try {
        // Fetch mission details
        const { data: missionData } = await apiClient.get(`/jobs/${id}`);
        const missionBody = unwrap(missionData);
        setMission(missionBody);

        // Fetch AI matches
        setLoadingMatches(true);
        try {
          const { data: matchesData } = await apiClient.get(`/jobs/${id}/matches`);
          const matchesBody = unwrap(matchesData);
          if (matchesBody?.artisans) {
            setMatches(matchesBody.artisans);
          }
        } catch (err) {
          console.warn('Could not fetch AI matches:', err);
        }
        setLoadingMatches(false);
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
      await apiClient.patch(`/jobs/${id}/status`, { status: 'COMPLETED' });
      setMission({ ...mission, status: 'COMPLETED' });
      showSuccessToast('Mission marquée comme terminée !');
    } catch (err) {
      showErrorToast(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">Mission introuvable</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        
        {/* Mission details card */}
        <div className="bento-card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">
                {mission.service?.name || mission.description?.slice(0, 60) || 'Mission'}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">Mission #{(id as string)?.slice(0, 8)}</p>
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium',
              mission.status === 'SEARCHING' ? 'bg-amber-100 text-amber-700' :
              mission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              mission.status === 'QUOTE_ACCEPTED' ? 'bg-blue-100 text-blue-700' :
              mission.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            )}>
              {mission.status === 'SEARCHING' ? 'En recherche' :
               mission.status === 'QUOTE_ACCEPTED' ? 'Devis accepté' :
               mission.status === 'IN_PROGRESS' ? 'En travaux' :
               mission.status === 'COMPLETED' ? 'Terminé' : mission.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <MapPin className="h-4 w-4 text-brand-primary" /> {mission.address || 'Douala'}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Calendar className="h-4 w-4 text-brand-primary" /> {mission.scheduledFor ? new Date(mission.scheduledFor).toLocaleDateString('fr-FR') : 'Dès que possible'}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Briefcase className="h-4 w-4 text-brand-primary" /> {mission.service?.category?.name || mission.service?.name || 'Général'}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <ShieldCheck className="h-4 w-4 text-brand-primary" /> 
              {mission.escrow ? `${Number(mission.escrow.amount).toLocaleString()} FCFA` : 'Pas de fonds'}
            </div>
          </div>
          <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">{mission.description}</p>
        </div>

        {/* AI Match Proposals */}
        {mission.status === 'SEARCHING' && (
          <div className="bento-card">
            <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-ai" />
              Artisans recommandés par l'IA
              {loadingMatches && <Loader2 className="h-4 w-4 animate-spin text-brand-ai" />}
            </h2>
            
            {loadingMatches ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl border border-surface-container-high">
                    <div className="w-12 h-12 bg-surface-container rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-container rounded w-1/3" />
                      <div className="h-3 bg-surface-container rounded w-1/4" />
                      <div className="h-3 bg-surface-container rounded w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">
                Aucun artisan disponible pour le moment. Revenez plus tard ou élargissez votre recherche.
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((artisan: any, idx: number) => (
                  <motion.div
                    key={artisan.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-surface-container-high hover:border-brand-ai/30 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ai/10 text-brand-ai font-semibold text-sm flex-shrink-0">
                      {artisan.firstName?.[0]}{artisan.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-on-surface">{artisan.firstName} {artisan.lastName}</p>
                        {artisan.aiScore && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-ai/10 text-brand-ai text-xs font-semibold">
                            <Sparkles size={12} /> Match {Math.round(artisan.aiScore)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {artisan.rating ? `⭐ ${artisan.rating.toFixed(1)}/5` : ''}
                        {artisan.distance ? ` • À ${artisan.distance.toFixed(1)} km` : ''}
                        {artisan.totalJobs ? ` • ${artisan.totalJobs} missions` : ''}
                      </p>
                      {artisan.explanation && (
                        <p className="text-xs text-brand-ai mt-1 italic">{artisan.explanation}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/artisan/${artisan.id}`}>
                        <Button size="sm" variant="secondary" className="text-xs">
                          <User size={14} className="mr-1" /> Profil
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quotes section */}
        <div className="bento-card">
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-accent" />
            Devis reçus ({mission.quotes?.length || 0})
          </h2>
          {!mission.quotes || mission.quotes.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">Aucun devis reçu pour le moment.</p>
          ) : (
            mission.quotes.map((q: any, i: number) => (
              <motion.div key={q.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors mb-3 border border-surface-container-high"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent font-semibold text-sm flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">
                    {q.artisan?.user?.firstName ? `Devis de ${q.artisan.user.firstName} ${q.artisan.user.lastName}` : `Devis #${q.id?.slice(0, 6)}`}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {q.estimatedPrice ? `${Number(q.estimatedPrice).toLocaleString()} FCFA` : ''}
                    {q.description ? ` — ${q.description.slice(0, 100)}` : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                      q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      q.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {q.status === 'ACCEPTED' ? 'Accepté' : q.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {q.status === 'PENDING' && (
                    <Link href={`/client/payment?quoteId=${q.id}&jobId=${id}`}>
                      <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-hover">
                        Accepter & Payer
                      </Button>
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

        {/* Escrow tracker */}
        {mission.escrow && (
          <div className="bento-card">
            <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              Fonds sécurisés
            </h2>
            <div className="flex items-center justify-between p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
              <div>
                <p className="text-sm font-medium text-on-surface">Montant sécurisé</p>
                <p className="text-2xl font-bold text-brand-primary">{Number(mission.escrow.amount).toLocaleString()} FCFA</p>
              </div>
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold',
                mission.escrow.status === 'FUNDED' ? 'bg-green-100 text-green-700' :
                mission.escrow.status === 'RELEASED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              )}>
                {mission.escrow.status === 'FUNDED' ? 'Bloqués' :
                 mission.escrow.status === 'RELEASED' ? 'Libérés' : 'En attente'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {mission.status === 'IN_PROGRESS' && (
          <div className="flex gap-3 mt-8">
            <Button onClick={() => setShowChat(!showChat)} variant="secondary" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1.5" /> Chat avec l'artisan
            </Button>
            <Button onClick={completeMission} className="flex-1 bg-brand-primary text-white hover:bg-brand-hover">
              <CheckCircle className="h-4 w-4 mr-1.5" /> Marquer terminé
            </Button>
          </div>
        )}

        {showChat && <ChatWindow jobId={id as string} otherUserName={mission.artisan?.user?.firstName || 'Artisan'} currentUserId={mission.clientId || ''} onClose={() => setShowChat(false)} />}
      </div>
    </PageTransition>
  );
}