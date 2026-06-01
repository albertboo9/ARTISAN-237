'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/ui.store';

const steps = [
  { title: 'Bienvenue sur Artisan237', desc: 'La marketplace intelligente des artisans à Douala.' },
  { title: 'Carte interactive', desc: 'Trouvez des artisans près de chez vous sur la carte.' },
  { title: 'Créez un compte', desc: 'Inscrivez-vous comme client ou artisan pour commencer.' },
  { title: 'Publiez une mission', desc: 'Décrivez votre besoin et recevez des devis.' },
];

export function OnboardingTour() {
  const { hasCompletedOnboarding, completeOnboarding, skipOnboarding } = useUIStore();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('artisan237-onboarded');
    if (!onboarded) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || hasCompletedOnboarding) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      setIsVisible(false);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md glass rounded-2xl p-5 shadow-xl border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          Étape {step + 1}/{steps.length}
        </span>
        <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">
          Passer
        </button>
      </div>
      <div className="flex gap-1 mb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{steps[step].title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{steps[step].desc}</p>
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          {step < steps.length - 1 ? 'Suivant' : 'Commencer'}
        </button>
      </div>
    </div>
  );
}