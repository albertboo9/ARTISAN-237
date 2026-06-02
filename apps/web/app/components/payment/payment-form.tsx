'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from '../ui/button';
import { cn } from '../../lib/cn';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  isLoading?: boolean;
}

export function PaymentForm({ amount, onSuccess, isLoading: externalLoading }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      // In a real flow, we would create a PaymentIntent on the server and use its client_secret here
      // For this implementation, we will simulate the token creation or payment method creation
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || 'Une erreur est survenue avec votre carte.');
      } else {
        // Here we simulate success and pass the payment method ID as the intent ID
        // The backend should handle the actual charge logic via webhook or API
        onSuccess(paymentMethod.id);
      }
    } catch (err: any) {
      setError(err.message || 'Le paiement a échoué.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bento-card p-4 space-y-4 border border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Montant à payer</span>
          <span className="text-xl font-bold text-primary">{amount.toLocaleString()} FCFA</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Les fonds seront bloqués sur un compte séquestre jusqu'à la fin de la mission.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Informations de carte</label>
        <div className="p-4 bg-surface rounded-xl border border-border shadow-sm">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
        <Lock className="h-3 w-3" /> Paiement sécurisé par Stripe
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={!stripe || isProcessing || externalLoading}
        isLoading={isProcessing || externalLoading}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Payer {amount.toLocaleString()} FCFA
      </Button>
    </form>
  );
}
