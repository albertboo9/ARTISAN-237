'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, MapPin, Star, Briefcase, Wifi, WifiOff } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { showSuccessToast } from '../../../lib/error-handler';

export default function ArtisanProfilPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    showSuccessToast('Profil mis à jour');
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations et votre disponibilité</p>
      </div>

      {/* Avatar & Status */}
      <div className="bento-card flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">PT</div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Paul Tchuente</h2>
          <p className="text-sm text-muted-foreground">Plombier professionnel — 10 ans d'expérience</p>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">4.8</span>
            <span className="text-xs text-muted-foreground">(15 missions)</span>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="bento-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isAvailable ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
          </div>
          <div>
            <p className="text-sm font-medium">{isAvailable ? 'Disponible' : 'Indisponible'}</p>
            <p className="text-xs text-muted-foreground">Les clients peuvent vous trouver sur la carte</p>
          </div>
        </div>
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className={`relative h-7 w-12 rounded-full transition-colors ${isAvailable ? 'bg-primary' : 'bg-muted'}`}
        >
          <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${isAvailable ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bento-card flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-sm font-medium">Akwa, Douala</p><p className="text-xs text-muted-foreground">Localisation</p></div>
        </div>
        <div className="bento-card flex items-center gap-3">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <div><p className="text-sm font-medium">Plomberie, Électricité</p><p className="text-xs text-muted-foreground">Compétences</p></div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bento-card space-y-4">
        <h3 className="font-semibold">Modifier mon profil</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom" defaultValue="Paul" />
          <Input label="Nom" defaultValue="Tchuente" />
        </div>
        <Input label="Bio" defaultValue="Plombier expérimenté basé à Akwa." />
        <Button onClick={handleSave} isLoading={isSaving}><Save className="h-4 w-4 mr-1.5" /> Enregistrer</Button>
      </div>
    </div>
  );
}