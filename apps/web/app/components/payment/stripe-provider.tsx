'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Remplacer par la clé publique Stripe réelle
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans le .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
