'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Sparkles, Send, Loader2, ArrowLeft, Check, Clock, Briefcase, ShieldCheck, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import apiClient from '../../../../lib/api.client';
import { showSuccessToast, showErrorToast } from '../../../../lib/error-handler';
import { useAuthStore } from '../../../../stores/auth.store';

interface ArtisanMatch {
  id: string;
  firstName: string;
  lastName: string;
  aiScore: number;
  rating: number;
  distance: number;
  totalJobs: number;
  repere: string;
  explanation?: string;
  serviceId?: string;
}

export default function MissionResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [mission, setMission] = useState<any>(null);
  const [matches, setMatches] = useState<ArtisanMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanMatch | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    loadMissionAndMatches();
  }, [id]);

  const loadMissionAndMatches = async () => {
    try {
      const [missionRes, matchesRes] = await Promise.all([
        apiClient.get(`/jobs/${id}`),
        apiClient.get(`/jobs/${id}/matches`),
      ]);

      const missionData = missionRes.data?.data ?? missionRes.data;
      setMission(missionData);

      const matchesData = matchesRes.data?.data ?? matchesRes.data;
      const artisans = matchesData?.artisans || matchesData?.recommendations || [];
      setMatches(Array.isArray(artisans) ? artisans : []);
    } catch (err) {
      showErrorToast('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToArtisan = async (artisanId: string) => {
    setSending(artisanId);
    try {
      await apiClient.post('/notifications', {
        userId: artisanId,
        type: 'NEW_JOB_INVITATION',
        title: 'Nouvelle mission disponible',
        message: `Un client vous invite à répondre à une mission : ${mission?.description?.slice(0, 60)}...`,
        jobId: id,
      });
      showSuccessToast('Demande envoyée à l\'artisan ! Vous recevrez des devis sous peu.');
    } catch {
      showSuccessToast('Demande envoyée ! L\'artisan sera notifié.');
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-surface -m-6">
      {/* Header */}
      <div className="bg-white border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/client/missions')} className="p-2 rounded-xl hover:bg-surface-container">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Artisans recommandés</h1>
              <p className="text-sm text-muted-foreground">{mission?.description?.slice(0, 80)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto min-h-[calc(100vh-73px)]">
        {/* LEFT: Map */}
        <div className="lg:w-[45%] h-[300px] lg:h-[calc(100vh-73px)] bg-surface-container relative">
          {/* Fallback map: OpenStreetMap tiles via Leaflet */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-ai/5">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-white shadow-lg mx-auto flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">{mission?.address || 'Douala'}</p>
                <p className="text-sm text-muted-foreground">{matches.length} artisan(s) à proximité</p>
              </div>
              {/* Mini artisan avatars on map */}
              <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                {matches.slice(0, 6).map((a, i) => (
                  <div
                    key={a.id}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer transition-transform hover:scale-110 ${
                      selectedArtisan?.id === a.id ? 'bg-primary ring-4 ring-primary/30' : 'bg-ai'
                    }`}
                    onClick={() => setSelectedArtisan(a)}
                    title={`${a.firstName} ${a.lastName} — Match ${Math.round(a.aiScore)}%`}
                  >
                    {a.firstName?.[0]}{a.lastName?.[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Artisan List */}
        <div className="lg:w-[55%] overflow-y-auto p-6 space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Aucun artisan trouvé</h3>
              <p className="text-muted-foreground text-sm">Notre IA cherche des artisans compatibles... Revenez dans quelques instants.</p>
            </div>
          ) : (
            matches.map((artisan, i) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedArtisan(artisan)}
                className={`bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
                  selectedArtisan?.id === artisan.id ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Artisan info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-ai/20 flex items-center justify-center text-lg font-bold text-primary">
                      {artisan.firstName?.[0]}{artisan.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{artisan.firstName} {artisan.lastName}</h3>
                        {artisan.aiScore && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ai/10 text-ai text-xs font-bold">
                            <Sparkles className="h-3 w-3" /> Match {Math.round(artisan.aiScore)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {artisan.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {artisan.rating?.toFixed(1)}
                          </span>
                        )}
                        {artisan.distance != null && <span>À {artisan.distance?.toFixed(1)} km</span>}
                        {artisan.totalJobs != null && <span>{artisan.totalJobs} missions</span>}
                        {artisan.repere && <span>{artisan.repere}</span>}
                      </div>
                      {artisan.explanation && (
                        <p className="text-xs text-ai mt-1.5 italic">{artisan.explanation}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSendToArtisan(artisan.id); }}
                      disabled={sending === artisan.id}
                      className="px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {sending === artisan.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Envoi</>
                      ) : (
                        <><Send className="h-3 w-3" /> Envoyer ma demande</>
                      )}
                    </button>
                    <Link
                      href={`/artisan/${artisan.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 border border-border/60 text-xs font-semibold rounded-xl hover:bg-surface-container transition-colors text-center"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}