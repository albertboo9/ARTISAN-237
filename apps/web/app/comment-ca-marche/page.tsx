'use client';

import { motion } from 'framer-motion';
import { Search, FileText, Handshake, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../components/ui/button';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/shared/page-transition';

const steps = [
  { icon: Search, title: 'Recherchez', desc: 'Trouvez l\'artisan idéal près de chez vous sur la carte interactive.' },
  { icon: FileText, title: 'Comparez', desc: 'Recevez des devis détaillés et comparez les offres.' },
  { icon: Handshake, title: 'Choisissez', desc: 'Sélectionnez l\'artisan qui vous convient et validez.' },
  { icon: Star, title: 'Notez', desc: 'Après la mission, évaluez la qualité du travail.' },
];

export default function HowItWorksPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Comment ça marche</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Trouvez le meilleur artisan pour vos projets en quelques clics.</p>
          </div>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={i} className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4"><Icon className="h-8 w-8 text-primary" /></div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
          <div className="flex gap-4 justify-center">
            <Link href="/register"><Button size="lg">Créer un compte <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            <Link href="/"><Button variant="secondary" size="lg">Voir la carte</Button></Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}