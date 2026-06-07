'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, Clock, MapPin, User, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import apiClient from '../../../lib/api.client';
import { cn } from '../../../lib/cn';

interface JobRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  address: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  service?: {
    name: string;
  };
}

export default function ArtisanDemandesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [demandes, setDemandes] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      const { data } = await apiClient.get('/jobs?status=SEARCHING');
      const raw = data?.data ?? data;
      const list = raw?.data ?? raw;
      setDemandes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (jobId: string) => {
    router.push(`/artisan/devis?jobId=${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandes disponibles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {demandes.length} demande{demandes.length > 1 ? 's' : ''} près de chez vous
          </p>
        </div>
      </div>

      {demandes.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune demande pour le moment</h3>
          <p className="text-muted-foreground text-sm">Les nouvelles demandes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {demandes.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {job.service?.name || 'Service'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{job.title || 'Nouvelle mission'}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {job.client?.firstName} {job.client?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.address || 'Non précisé'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSubmitQuote(job.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Faire un devis
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}