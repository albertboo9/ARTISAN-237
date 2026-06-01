'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Image, Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { cn } from '../../../lib/cn';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';

const steps = ['Service', 'Localisation', 'Description', 'Confirmation'];

export default function CreateMissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<{ id: string; name: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [position, setPosition] = useState({ lat: 4.0511, lng: 9.7085 });

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/services')
      .then(r => r.json())
      .then(d => setServices(d?.data || d || []))
      .catch(() => {});
  }, []);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          description: 'Mission description',
          lat: position.lat,
          lng: position.lng,
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de la création');
      showSuccessToast('Mission créée avec succès !');
      router.push('/dashboard/client/missions');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <h1 className="text-2xl font-bold text-foreground">Créer une mission</h1>
      <p className="text-muted-foreground mt-1">Décrivez votre besoin en quelques étapes</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mt-8 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all',
              i <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground',
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
              {s}
            </span>
            {i < steps.length - 1 && <div className={cn('flex-1 h-0.5 rounded', i < step ? 'bg-primary' : 'bg-muted')} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Jardinage'].map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedService(s); setStep(1); }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  selectedService === s ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
                )}
              >
                <h3 className="font-medium text-foreground">{s}</h3>
                <p className="text-xs text-muted-foreground mt-1">À partir de 5 000 FCFA</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Input label="Adresse" placeholder="Ex: Akwa, Douala" icon={<MapPin className="h-4 w-4" />} />
            <p className="text-xs text-muted-foreground">Position : {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
            <Button onClick={() => setStep(2)} className="w-full">Continuer <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Description du besoin</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-border bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Décrivez précisément ce que vous souhaitez..."
              />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border cursor-pointer hover:bg-surface-container transition-colors">
              <Image className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ajouter des photos (optionnel)</span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Retour</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Continuer <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bento-card space-y-3">
              <h3 className="font-semibold">Récapitulatif</h3>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service</span><span>{selectedService}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Adresse</span><span>Douala, Cameroun</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Statut</span><span className="text-amber-600 font-medium">Recherche d'artisans</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Modifier</Button>
              <Button onClick={onSubmit} isLoading={isLoading} className="flex-1">
                {isLoading ? 'Création...' : 'Publier la mission'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}