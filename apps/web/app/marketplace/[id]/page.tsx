'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, User, Briefcase, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import apiClient from '../../lib/api.client';
import { showSuccessToast } from '../../lib/error-handler';
import { useAuthStore } from '../../stores/auth.store';

export default function MarketplaceMissionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMission();
  }, [id]);

  const loadMission = async () => {
    try {
      const { data } = await apiClient.get(`/jobs/${id}`);
      setMission(data?.data ?? data);
    } catch (err) {
      console.error('Erreur chargement mission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/marketplace/' + id);
      return;
    }
    router.push(`/artisan/devis?jobId=${id}`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!mission) return <div className="text-center py-20"><p>Mission introuvable</p></div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour à la marketplace
      </button>

      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {mission.service?.name || 'Service'}
            </span>
            <h1 className="text-xl font-bold mt-2">{mission.service?.name || 'Mission'} — {mission.address || 'Douala'}</h1>
            <p className="text-sm text-muted-foreground mt-1">Publié le {new Date(mission.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
            {mission.status === 'SEARCHING' ? 'En recherche' : mission.status}
          </span>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{mission.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{mission.address || 'Douala'}</div>
          <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />{mission.service?.category?.name || 'Général'}</div>
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" />{mission.client?.firstName} {mission.client?.lastName}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Dès que possible</div>
        </div>

        {mission.status === 'SEARCHING' && (
          <button onClick={handleSubmitQuote} className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Faire un devis <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}