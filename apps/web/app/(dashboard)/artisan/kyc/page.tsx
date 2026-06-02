'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ExternalLink, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../../components/ui/button';
import { cn } from '../../../lib/cn';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';

export default function KycPage() {
  const { user, fetchMe } = useAuthStore();
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected' | 'unverified'>('unverified');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  // Check initial KYC status from user object
  useEffect(() => {
    if (!user) return;
    
    // Assuming user object has kycVerifications array from the backend
    const latestKyc = (user as any).kycVerifications?.[0];
    if (latestKyc) {
      if (latestKyc.status === 'VERIFIED') setStatus('verified');
      else if (latestKyc.status === 'REJECTED') setStatus('rejected');
      else if (latestKyc.status === 'PENDING') {
        setStatus('pending');
        if (latestKyc.verificationUrl) {
          setVerificationUrl(latestKyc.verificationUrl);
        }
      }
    }
  }, [user]);

  // Polling when pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending') {
      interval = setInterval(async () => {
        try {
          await fetchMe(); // This will refresh the user object and trigger the first useEffect
        } catch (err) {
          console.error('Failed to poll KYC status', err);
        }
      }, 10000); // Poll every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, fetchMe]);

  const initiateKyc = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<any>('/artisans/kyc/initiate', {
        method: 'POST',
      });
      showSuccessToast('Session KYC créée ! Redirection en cours...');
      setStatus('pending');
      if (data?.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
        // Open Didit session in new tab
        window.open(data.verificationUrl, '_blank');
      }
      await fetchMe();
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Vérification KYC</h1>
        <p className="text-muted-foreground">Vérifiez votre identité pour recevoir des missions en toute confiance</p>
      </div>

      <div className="bento-card text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className={cn(
            'flex h-24 w-24 items-center justify-center rounded-3xl transition-colors duration-500',
            status === 'verified' ? 'bg-green-100' :
            status === 'rejected' ? 'bg-red-100' :
            status === 'pending' ? 'bg-amber-100' : 'bg-primary/5',
          )}>
            {status === 'verified' ? <CheckCircle className="h-12 w-12 text-green-600" /> :
             status === 'rejected' ? <XCircle className="h-12 w-12 text-red-600" /> :
             status === 'pending' ? <Clock className="h-12 w-12 text-amber-600 animate-pulse" /> :
             <ShieldCheck className="h-12 w-12 text-primary" />}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {status === 'verified' ? 'Identité vérifiée' :
             status === 'rejected' ? 'Vérification rejetée' :
             status === 'pending' ? 'Vérification en cours' :
             'Vérification requise'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {status === 'unverified' && 'Pour garantir la confiance de vos clients et recevoir des missions, veuillez vérifier votre identité via notre partenaire Didit.'}
            {status === 'pending' && 'Votre demande est en cours de traitement. Veuillez terminer le processus sur la page Didit. Cette page s\'actualisera automatiquement.'}
            {status === 'verified' && 'Votre identité a été vérifiée avec succès. Vous disposez désormais du badge Artisan Vérifié !'}
            {status === 'rejected' && 'Votre vérification a été rejetée. Veuillez réessayer en fournissant un document d\'identité valide et lisible.'}
          </p>
        </div>

        {(status === 'unverified' || status === 'rejected') && (
          <Button onClick={initiateKyc} isLoading={isLoading} size="lg" className="w-full">
            <ShieldCheck className="h-4 w-4 mr-2" />
            {status === 'rejected' ? 'Réessayer la vérification' : 'Commencer la vérification'}
          </Button>
        )}

        {status === 'pending' && (
          <div className="space-y-3">
            {verificationUrl && (
              <Button onClick={() => window.open(verificationUrl, '_blank')} variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir la session Didit
              </Button>
            )}
            <Button variant="secondary" className="w-full" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Actualisation automatique...
            </Button>
          </div>
        )}

        {status === 'verified' && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
            <CheckCircle className="h-5 w-5" />
            Votre profil est certifié et visible par tous les clients
          </div>
        )}
      </div>

      <div className="bento-card p-6 space-y-4">
        <h3 className="font-semibold text-sm">Pourquoi vérifier votre identité ?</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3"><div className="p-1 rounded bg-primary/10 mt-0.5"><ShieldCheck className="h-4 w-4 text-primary" /></div> <span>Renforce la confiance des clients sur la plateforme.</span></li>
          <li className="flex items-start gap-3"><div className="p-1 rounded bg-primary/10 mt-0.5"><ShieldCheck className="h-4 w-4 text-primary" /></div> <span>Permet d'accéder aux missions et de recevoir des paiements sécurisés.</span></li>
          <li className="flex items-start gap-3"><div className="p-1 rounded bg-primary/10 mt-0.5"><ShieldCheck className="h-4 w-4 text-primary" /></div> <span>Affiche fièrement le badge "Artisan Vérifié" sur votre profil public.</span></li>
        </ul>
      </div>
    </div>
  );
}