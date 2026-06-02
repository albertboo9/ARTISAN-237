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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Vérification d'Identité (KYC)</h1>
        <p className="text-muted-foreground mt-1">Conformité aux normes bancaires et sécurisation de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-8 border border-border/50 shadow-sm relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-primary/5">
              <ShieldCheck className="w-64 h-64" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className={cn(
                'flex h-24 w-24 items-center justify-center rounded-full transition-colors duration-500 shadow-inner',
                status === 'verified' ? 'bg-green-100/80 ring-8 ring-green-50' :
                status === 'rejected' ? 'bg-red-100/80 ring-8 ring-red-50' :
                status === 'pending' ? 'bg-amber-100/80 ring-8 ring-amber-50' : 'bg-primary/10 ring-8 ring-primary/5',
              )}>
                {status === 'verified' ? <CheckCircle className="h-10 w-10 text-green-600" /> :
                 status === 'rejected' ? <XCircle className="h-10 w-10 text-red-600" /> :
                 status === 'pending' ? <Clock className="h-10 w-10 text-amber-600 animate-pulse" /> :
                 <ShieldCheck className="h-10 w-10 text-primary" />}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {status === 'verified' ? 'Identité vérifiée' :
                   status === 'rejected' ? 'Vérification échouée' :
                   status === 'pending' ? 'Analyse en cours...' :
                   'Vérification requise'}
                </h2>
                <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
                  {status === 'unverified' && 'Pour garantir la sécurité des transactions sur Artisan237, vous devez vérifier votre identité via notre partenaire bancaire agréé (Didit).'}
                  {status === 'pending' && 'Votre dossier est en cours d\'analyse. Ce processus prend généralement moins de 3 minutes. Veuillez patienter.'}
                  {status === 'verified' && 'Votre compte est certifié. Vous pouvez maintenant recevoir des paiements sécurisés et accepter des missions.'}
                  {status === 'rejected' && 'La vérification n\'a pas pu aboutir. Assurez-vous que votre pièce d\'identité est valide et bien éclairée.'}
                </p>
              </div>

              <div className="w-full pt-4">
                {(status === 'unverified' || status === 'rejected') && (
                  <Button onClick={initiateKyc} isLoading={isLoading} size="lg" className="w-full sm:w-2/3 shadow-md">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {status === 'rejected' ? 'Relancer la vérification' : 'Démarrer la vérification sécurisée'}
                  </Button>
                )}

                {status === 'pending' && (
                  <div className="space-y-4 w-full sm:w-2/3 mx-auto">
                    {verificationUrl && (
                      <Button onClick={() => window.open(verificationUrl, '_blank')} variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ouvrir la session Didit
                      </Button>
                    )}
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Vérification automatique en cours...
                    </div>
                  </div>
                )}

                {status === 'verified' && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                    <CheckCircle className="h-5 w-5" />
                    Profil certifié et paiements activés
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bento-card p-6 bg-surface-container/30 border-none shadow-none">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Sécurité Bancaire
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <p>Vos données sont chiffrées de bout en bout et transmises de manière sécurisée.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <p>Nous ne stockons aucune photo de vos documents d'identité sur nos serveurs.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <p>Obligatoire pour lutter contre la fraude et le blanchiment d'argent.</p>
              </li>
            </ul>
          </div>
          
          <div className="bento-card p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Ce qu'il vous faut :</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-foreground">1</div>
                Une pièce d'identité valide (CNI, Passeport).
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-foreground">2</div>
                Un smartphone avec appareil photo.
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-foreground">3</div>
                Un environnement bien éclairé.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}