'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/ui.store';
import { Sparkles, Map, UserPlus, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import Button from '../ui/button';
import { cn } from '../../lib/cn';

const steps = [
  { 
    title: 'Bienvenue sur Artisan237', 
    desc: 'La marketplace intelligente qui connecte les meilleurs artisans de Douala à vos besoins.',
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  { 
    title: 'Explorez la carte', 
    desc: 'Trouvez instantanément des professionnels vérifiés près de chez vous grâce à notre carte interactive.',
    icon: Map,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    title: 'Créez votre profil', 
    desc: 'Inscrivez-vous comme client pour publier des missions ou comme artisan pour proposer vos services.',
    icon: UserPlus,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  { 
    title: 'Lancez-vous !', 
    desc: 'Publiez une mission en quelques clics et recevez des devis sécurisés sous séquestre.',
    icon: Briefcase,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
];

export function OnboardingTour() {
  const { hasCompletedOnboarding, completeOnboarding, skipOnboarding } = useUIStore();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on client to avoid hydration mismatch
    const onboarded = localStorage.getItem('artisan237-onboarded');
    if (!onboarded) {
      // Small delay to let the initial map load before showing the onboarding
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || hasCompletedOnboarding) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    setIsVisible(false);
  };

  const handleSkip = () => {
    skipOnboarding();
    setIsVisible(false);
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 isolate">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={handleSkip}
        />

        {/* Modal */}
        <motion.div
          key="onboarding-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden relative"
        >
          {/* Progress Bar at the top */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
            {steps.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-surface-container overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-primary"
                />
              </div>
            ))}
          </div>

          <div className="p-8 pt-10 text-center relative overflow-hidden">
            {/* Background glowing effect */}
            <div className={cn('absolute -top-20 -right-20 w-40 h-40 blur-3xl opacity-20 rounded-full transition-colors duration-500', currentStep.bg)} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className={cn('flex h-20 w-20 items-center justify-center rounded-3xl mb-6 shadow-sm transition-colors duration-500', currentStep.bg, currentStep.color)}>
                  <Icon className="h-10 w-10" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-3">{currentStep.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  {currentStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3 w-full">
              <Button 
                variant="ghost" 
                onClick={handleSkip} 
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Passer
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-[2] group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {step < steps.length - 1 ? (
                    <>Suivant <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" /></>
                  ) : (
                    <>Commencer <CheckCircle2 className="h-4 w-4 ml-1.5" /></>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}