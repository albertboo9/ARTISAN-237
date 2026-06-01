'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ExternalLink, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../../components/ui/button';
import { cn } from '../../../lib/cn';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';

export default function KycPage() {
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected' | 'unverified'>('unverified');
  const [isLoading, setIsLoading] = useState(false);

  const initiateKyc = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/artisans/kyc/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      showSuccessToast('Session KYC créée ! Vérifiez vos emails');
      setStatus('pending');
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
            'flex h-24 w-24 items-center justify-center rounded-3xl',
            status === 'verified' ? 'bg-green-100' :
            status === 'rejected' ? 'bg-red-100' :
            status === 'pending' ? 'bg-amber-100' : 'bg-primary/5',
          )}>
            {status === 'verified' ? <CheckCircle className="h-12 w-12 text-green-600" /> :
             status === 'rejected' ? <XCircle className="h-12 w-12 text-red-600" /> :
             status === 'pending' ? <Clock className="h-12 w-12 text-amber-600" /> :
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
            {status === 'unverified' && 'Pour garantir la confiance, vérifiez votre identité via Didit.'}
            {status === 'pending' && 'Votre demande est en cours de traitement. Cela prend généralement quelques minutes.'}
            {status === 'verified' && 'Votre identité a été vérifiée avec succès. Vous pouvez recevoir des missions.'}
            {status === 'rejected' && 'Votre vérification a été rejetée. Veuillez réessayer avec des documents valides.'}
          </p>
        </div>

        {(status === 'unverified' || status === 'rejected') && (
          <Button onClick={initiateKyc} isLoading={isLoading} size="lg" className="w-full">
            <ShieldCheck className="h-4 w-4 mr-2" />
            {status === 'rejected' ? 'Réessayer la vérification' : 'Commencer la vérification'}
          </Button>
        )}

        {status === 'pending' && (
          <Button variant="secondary" className="w-full" disabled>
            <Clock className="h-4 w-4 mr-2 animate-pulse" />
            En attente de confirmation...
          </Button>
        )}

        {status === 'verified' && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Votre profil est certifié
          </div>
        )}
      </div>

      <div className="bento-card p-6 space-y-3">
        <h3 className="font-semibold text-sm">Pourquoi vérifier votre identité ?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Renforce la confiance des clients</li>
          <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Accédez à plus de missions</li>
          <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Badge "Vérifié" visible sur votre profil</li>
        </ul>
      </div>
    </div>
  );
}