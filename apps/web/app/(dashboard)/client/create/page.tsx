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
import apiClient from '../../../lib/api.client';
import axios from 'axios';

const steps = ['Service', 'Localisation', 'Description', 'Confirmation'];

export default function CreateMissionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<{ id: string; name: string; category: any }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(true);
  
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [position, setPosition] = useState({ lat: 4.0511, lng: 9.7085 });
  const [address, setAddress] = useState('Akwa, Douala');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadServices() {
      try {
        const { data } = await axios.get('/services', {
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
        });
        // Le TransformInterceptor enveloppe dans { success, data, meta }
        const servicesList = data?.data ?? data;
        setServices(Array.isArray(servicesList) ? servicesList : []);
      } catch (err) {
        showErrorToast('Impossible de charger les services');
      } finally {
        setIsFetchingServices(false);
      }
    }
    loadServices();
    
    // Attempt to get user's real location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Geolocation denied or unavailable')
      );
    }
  }, []);

  const onSubmit = async () => {
    if (!selectedService || !description) return;
    
    setIsLoading(true);
    try {
      await axios.post('/jobs', {
        serviceId: selectedService,
        description,
        address,
        lat: position.lat,
        lng: position.lng,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      });
      showSuccessToast('Mission créée avec succès !');
      router.push('/client/missions');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceName = (id: string | null) => {
    if (!id) return '';
    return services.find(s => s.id === id)?.name || id;
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
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all flex-shrink-0',
              i <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground',
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block truncate', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
              {s}
            </span>
            {i < steps.length - 1 && <div className={cn('flex-1 h-0.5 rounded w-full', i < step ? 'bg-primary' : 'bg-muted')} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            {isFetchingServices ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.length > 0 ? services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s.id); setStep(1); }}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      selectedService === s.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
                    )}
                  >
                    <h3 className="font-medium text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.category?.name || 'Service général'}
                    </p>
                  </button>
                )) : (
                  // Fallback if DB is empty
                  ['Plomberie', 'Électricité', 'Menuiserie', 'Peinture'].map((s) => (
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
                  ))
                )}
              </div>
            )}
            {selectedService && (
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button onClick={() => setStep(1)}>Continuer <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="bento-card p-6 space-y-4">
              <Input 
                label="Adresse détaillée" 
                placeholder="Ex: Akwa, Rue Drouot, Douala" 
                icon={<MapPin className="h-4 w-4" />} 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Position GPS</p>
                  <p className="text-xs text-muted-foreground">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    );
                  }
                }}>
                  <MapPin className="h-4 w-4 mr-1.5" /> Actualiser
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">Retour</Button>
              <Button onClick={() => setStep(2)} disabled={!address.trim()} className="flex-1">Continuer <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bento-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Description détaillée de votre besoin</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Décrivez précisément ce que vous souhaitez réaliser, les contraintes éventuelles, etc..."
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border cursor-pointer hover:bg-surface-container transition-colors">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ajouter des photos (optionnel)</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Retour</Button>
              <Button onClick={() => setStep(3)} disabled={!description.trim()} className="flex-1">Continuer <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bento-card p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-3">Récapitulatif</h3>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-start text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-right">{getServiceName(selectedService)}</span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium text-right max-w-[200px]">{address}</span>
                </div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-right max-w-[200px] truncate" title={description}>{description}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-sm text-amber-800">
                  En publiant cette mission, elle sera visible par tous les artisans qualifiés autour de vous. Vous recevrez des devis sous peu.
                </p>
              </div>
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