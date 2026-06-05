'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { StripeProvider } from '../../../components/payment/stripe-provider';
import { PaymentForm } from '../../../components/payment/payment-form';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';
import axios from 'axios';
import Button from '../../../components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
function unwrap(data: any) { return data?.data ?? data; }

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const quoteId = searchParams?.get('quoteId');
  const jobId = searchParams?.get('jobId');
  
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  };

  useEffect(() => {
    async function loadData() {
      if (!quoteId) { setIsLoading(false); return; }
      try {
        // Fetch quotes for this job to find the one we accepted
        if (jobId) {
          const { data } = await axios.get(`${API_URL}/quotes/job/${jobId}`, getHeaders());
          const quotes = unwrap(data);
          if (Array.isArray(quotes)) {
            const found = quotes.find((q: any) => q.id === quoteId);
            if (found) setQuote(found);
          }
        }
      } catch (err) {
        // Fallback: show minimal data from URL params
        setQuote({ id: quoteId, jobId, estimatedPrice: 0 });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [quoteId, jobId]);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      // In real app: confirm PaymentIntent via backend
      // For demo: simulate success then update job status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update job status to IN_PROGRESS after payment
      if (jobId) {
        await axios.patch(`${API_URL}/jobs/${jobId}/status`, 
          { status: 'IN_PROGRESS' },
          getHeaders()
        ).catch(() => {}); // Non-blocking
      }
      
      setIsSuccess(true);
      showSuccessToast('Paiement réussi ! Les fonds sont sécurisés.');
    } catch (err) {
      showErrorToast('Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const amount = quote?.estimatedPrice || 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!quote && !isSuccess) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">Devis introuvable ou paramètres manquants.</p>
        <Link href="/client/quotes">
          <Button variant="secondary" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devis</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
        className="max-w-md mx-auto text-center space-y-6 py-12"
      >
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Paiement validé !</h2>
          <p className="text-on-surface-variant mt-2">
            Votre paiement de <strong>{amount.toLocaleString()} FCFA</strong> est sécurisé via Escrow. 
            L'artisan va commencer les travaux.
          </p>
        </div>
        <div className="pt-6">
          <Link href={`/client/missions/${jobId || quote?.jobId}`}>
            <Button size="lg" className="w-full bg-brand-primary text-white hover:bg-brand-hover">
              Aller à la mission
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Paiement Sécurisé</h1>
          <p className="text-on-surface-variant text-sm">Réglez votre devis pour démarrer la mission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Résumé du devis */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-on-surface">
            <FileText className="h-4 w-4 text-brand-primary" /> Résumé du devis
          </h3>
          <div className="bento-card p-6 space-y-4">
            <div>
              <p className="text-xs text-on-surface-variant">Artisan</p>
              <p className="font-medium text-on-surface">
                {quote?.artisan?.user?.firstName || 'Artisan'} {quote?.artisan?.user?.lastName || ''}
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-on-surface-variant">Description</p>
              <p className="text-sm mt-1 text-on-surface-variant">{quote?.description || 'Devis accepté'}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Total à payer</span>
                <span className="text-2xl font-bold text-on-surface">{amount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-xl text-sm border border-brand-primary/20">
            <ShieldCheck className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
            <p className="text-on-surface-variant">
              <strong className="text-on-surface">Garantie Escrow :</strong> Vos fonds sont bloqués et ne seront reversés qu'à la validation des travaux.
            </p>
          </div>
        </div>

        {/* Formulaire de paiement */}
        <div className="bento-card p-6">
          <StripeProvider>
            <PaymentForm 
              amount={amount} 
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
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}