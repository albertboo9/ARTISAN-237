'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import apiClient from '../../../lib/api.client';
import { useAuthStore } from '../../../stores/auth.store';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';

export default function ArtisanKycPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'loading' | 'info' | 'session' | 'pending' | 'verified'>('loading');
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('NONE');

  useEffect(() => {
    if (user?.id) checkExistingKyc();
  }, [user]);

  const checkExistingKyc = async () => {
    try {
      const { data: raw } = await apiClient.get('/artisans/kyc/status');
      const status = raw?.status || raw?.data?.status || 'NONE';
      setKycStatus(status);
      if (status === 'VERIFIED') setStep('verified');
      else if (status === 'PENDING') setStep('pending');
      else setStep('info');
    } catch { setStep('info'); }
  };

  const handleInitSession = async () => {
    setLoading(true);
    try {
      const { data: raw } = await apiClient.post('/artisans/kyc/initiate');
      const body = raw?.data ?? raw;
      setSessionUrl(body.verificationUrl);
      setSessionId(body.id);
      setStep('session');
      showSuccessToast('Session KYC créée avec Didit.');
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || 'Erreur lors de l\'initialisation KYC');
    } finally { setLoading(false); }
  };

  const handleCheckStatus = async () => {
    try {
      await checkExistingKyc();
      if (kycStatus === 'VERIFIED') showSuccessToast('Identité vérifiée !');
    } catch { showErrorToast('Erreur de vérification'); }
  };

  if (step === 'loading') {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vérification KYC</h1>
            <p className="text-muted-foreground">Vérifiez votre identité avec Didit</p>
          </div>
        </div>

        {step === 'info' && (
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Pourquoi vérifier votre identité ?</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><span>Badge "Vérifié" visible par les clients</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><span>Plus de missions et de devis</span></li>
              <li className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary mt-0.5" /><span>Votre identité est sécurisée via Didit</span></li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium">Vérification via Didit — pièce d'identité valide requise (CNI, Passeport).</p>
            </div>
            <button onClick={handleInitSession} disabled={loading} className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Initialisation...' : 'Lancer la vérification Didit'}
            </button>
          </div>
        )}

        {step === 'session' && sessionUrl && (
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <h3 className="text-lg font-semibold text-green-700">Session Didit initialisée</h3>
              </div>
              <p className="text-sm text-muted-foreground">Cliquez sur le bouton pour ouvrir la session de vérification Didit.</p>
              <a href={sessionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                <ExternalLink className="h-4 w-4" /> Ouvrir la session Didit
              </a>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">Après vérification, revenez ici et cliquez sur "Vérifier le statut".</p>
              </div>
            </div>
            <button onClick={handleCheckStatus} className="w-full py-3 border border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" /> Vérifier le statut
            </button>
          </div>
        )}

        {step === 'pending' && (
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold">Demande en cours</h3>
            <p className="text-sm text-muted-foreground">Votre demande KYC est en attente de validation.</p>
            <button onClick={handleCheckStatus} className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary/5 transition-colors">
              <RefreshCw className="h-4 w-4" /> Vérifier le statut
            </button>
          </div>
        )}

        {step === 'verified' && (
          <div className="bg-card border border-green-200 rounded-2xl p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700">Identité vérifiée</h3>
            <p className="text-sm text-muted-foreground">Votre identité a été vérifiée avec succès via Didit.</p>
          </div>
        )}

      </motion.div>
    </div>
  );
}