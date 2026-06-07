'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Sparkles, Loader2, Check, Wrench } from 'lucide-react';
import Button from '../../../components/ui/button';
import { cn } from '../../../lib/cn';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';
import apiClient from '../../../lib/api.client';

export default function CreateMissionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'describe' | 'location' | 'confirm' | 'sending'>('describe');
  const [description, setDescription] = useState('');
  const [detectedService, setDetectedService] = useState<any>(null);
  const [detecting, setDetecting] = useState(false);
  const [position, setPosition] = useState({ lat: 4.0511, lng: 9.7085 });
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleAutoDetect = async () => {
    if (!description.trim() || description.length < 10) {
      showErrorToast('Veuillez décrire votre problème en quelques mots.');
      return;
    }
    setDetecting(true);
    try {
      const { data: raw } = await apiClient.post('/jobs/auto-detect', { description });
      const result = raw?.data ?? raw;
      if (result?.service) {
        setDetectedService(result);
        setStep('location');
      } else {
        showErrorToast('Impossible de détecter le métier. Veuillez préciser votre besoin.');
      }
    } catch {
      showErrorToast('Erreur lors de la détection. Réessayez.');
    } finally { setDetecting(false); }
  };

  const handleSubmit = async () => {
    if (!detectedService?.service?.id) return;
    setIsLoading(true);
    try {
      const result = await apiClient.post('/jobs', {
        serviceId: detectedService.service.id,
        description,
        address: address || 'Douala',
        lat: position.lat,
        lng: position.lng,
      });
      const raw = result.data;
      const jobData = raw?.data ?? raw;
      const jobId = jobData?.id ?? jobData?.jobId;
      showSuccessToast('Mission créée ! Redirection vers les recommandations IA...');
      if (jobId) {
        setTimeout(() => router.push(`/client/results/${jobId}`), 800);
      } else {
        router.push('/client/missions');
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || 'Erreur lors de la création');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="text-2xl font-bold text-foreground">Créer une mission</h1>
      <p className="text-muted-foreground mt-1">Décrivez votre problème, notre IA détecte le métier qu'il vous faut</p>

      <div className="mt-8 space-y-6">
        {step === 'describe' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-ai font-semibold">
                <Sparkles className="h-4 w-4" /> Détection IA du métier
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Mon chauffe-eau fuit depuis hier..."
              />
              <Button onClick={handleAutoDetect} isLoading={detecting} className="w-full">
                {detecting ? 'Analyse IA en cours...' : 'Détecter le métier et continuer'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'location' && detectedService && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card border border-primary/30 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Métier détecté</p>
                  <p className="text-lg font-bold text-primary">{detectedService.service.name}</p>
                  <p className="text-xs text-muted-foreground">Confiance IA : {detectedService.confidence}%</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <label className="text-sm font-medium">Adresse (optionnel)</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Akwa, Douala"
              />
              <div className="flex items-center justify-between bg-surface-container rounded-xl p-3">
                <p className="text-xs text-muted-foreground">GPS: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
                <button onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    );
                  }
                }} className="text-xs text-primary font-medium hover:underline">
                  Actualiser
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('describe')} className="flex-1">Modifier</Button>
              <Button onClick={() => setStep('confirm')} className="flex-1">Continuer</Button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && detectedService && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold">Récapitulatif</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Problème :</span> {description}</p>
                <p><span className="text-muted-foreground">Métier :</span> <span className="text-primary font-semibold">{detectedService.service.name}</span></p>
                <p><span className="text-muted-foreground">Adresse :</span> {address || 'Douala'}</p>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <p className="text-sm text-amber-800">Votre mission sera visible par tous les artisans {detectedService.service.name.toLowerCase()}s autour de vous.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('location')} className="flex-1">Modifier</Button>
              <Button onClick={handleSubmit} isLoading={isLoading} className="flex-1">
                {isLoading ? 'Publication...' : 'Publier la mission'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}