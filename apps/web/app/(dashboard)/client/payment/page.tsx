'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { StripeProvider } from '../../../components/payment/stripe-provider';
import { PaymentForm } from '../../../components/payment/payment-form';
import { apiClient } from '../../../lib/api-client';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';
import Button from '../../../components/ui/button';
import { PageTransition } from '../../../components/shared/page-transition';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const quoteId = searchParams?.get('quoteId');
  const jobId = searchParams?.get('jobId');
  
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      if (!quoteId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch quote details (simulated with api client for now)
        // In real app: const data = await apiClient(`/quotes/${quoteId}`);
        const data = await apiClient<any>(`/quotes?id=${quoteId}`).catch(() => null);
        
        // Mock data if API is not ready
        setQuote(data?.[0] || {
          id: quoteId,
          jobId: jobId,
          amount: 25000,
          artisan: { firstName: 'Paul', lastName: 'Tchuente' },
          description: 'Devis pour réparation plomberie',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchQuote();
  }, [quoteId, jobId]);

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    setIsProcessing(true);
    try {
      // In a real app, send paymentMethodId to backend to confirm PaymentIntent
      /*
      await apiClient(`/financial/escrow/fund`, {
        method: 'POST',
        body: JSON.stringify({ jobId, quoteId, paymentMethodId })
      });
      */
      
      // We simulate backend delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      showSuccessToast('Paiement réussi ! Les fonds sont sécurisés.');
    } catch (err) {
      showErrorToast(err);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote && !isSuccess) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Devis introuvable ou paramètres manquants.</p>
        <Link href="/client/quotes">
          <Button variant="ghost" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devis</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Paiement validé !</h2>
          <p className="text-muted-foreground mt-2">
            Votre paiement de <strong>{quote?.amount?.toLocaleString() || 25000} FCFA</strong> a été placé sous séquestre. 
            L'artisan va être notifié pour commencer les travaux.
          </p>
        </div>
        <div className="pt-6">
          <Link href={`/client/missions/${jobId || quote?.jobId}`}>
            <Button size="lg" className="w-full">Aller à la mission</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Paiement Sécurisé</h1>
          <p className="text-muted-foreground text-sm">Réglez votre devis pour démarrer la mission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Résumé du devis */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Résumé du devis
          </h3>
          <div className="bento-card p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Artisan</p>
              <p className="font-medium">{quote.artisan?.firstName} {quote.artisan?.lastName}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm mt-1">{quote.description}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total à payer</span>
                <span className="text-2xl font-bold text-foreground">{quote.amount?.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl text-sm">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Garantie Artisan237 :</strong> Vos fonds sont bloqués sur un compte sécurisé et ne seront reversés à l'artisan qu'une fois la mission validée par vous.
            </p>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <div className="bento-card p-6">
          <StripeProvider>
            <PaymentForm 
              amount={quote.amount} 
              onSuccess={handlePaymentSuccess}
              isLoading={isProcessing}
            />
          </StripeProvider>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <PageTransition>
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <PaymentContent />
      </Suspense>
    </PageTransition>
  );
}
