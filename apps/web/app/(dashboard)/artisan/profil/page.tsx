'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, MapPin, Star, Briefcase, Wifi, WifiOff, Loader2 } from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api-client';

export default function ArtisanProfilPage() {
  const { user, fetchMe } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Form states
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiClient<any>('/artisans/profile');
        setProfile(data);
        setBio(data?.bio || '');
        setExperienceYears(data?.experienceYears || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient('/artisans/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio, experienceYears }),
      });
      showSuccessToast('Profil mis à jour avec succès');
      const updated = await apiClient<any>('/artisans/profile');
      setProfile(updated);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAvailability = async () => {
    setIsToggling(true);
    const newState = !profile?.isAvailable;
    try {
      await apiClient('/artisans/availability', {
        method: 'PUT',
        body: JSON.stringify({ isAvailable: newState }),
      });
      setProfile({ ...profile, isAvailable: newState });
      showSuccessToast(newState ? 'Vous êtes maintenant disponible' : 'Vous êtes maintenant indisponible');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations et votre disponibilité</p>
      </div>

      {/* Avatar & Status */}
      <div className="bento-card flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-muted-foreground">{bio || 'Artisan professionnel'}</p>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{profile?.rating || '4.8'}</span>
            <span className="text-xs text-muted-foreground">({profile?.totalJobs || 0} missions)</span>
          </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="bento-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${profile?.isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
            {profile?.isAvailable ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
          </div>
          <div>
            <p className="text-sm font-medium">{profile?.isAvailable ? 'Disponible' : 'Indisponible'}</p>
            <p className="text-xs text-muted-foreground">Les clients peuvent vous trouver sur la carte</p>
          </div>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={isToggling}
          className={`relative h-7 w-12 rounded-full transition-colors ${profile?.isAvailable ? 'bg-primary' : 'bg-muted'} ${isToggling ? 'opacity-50' : ''}`}
        >
          <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${profile?.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bento-card flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Position GPS</p>
            <p className="text-xs text-muted-foreground">
              {profile?.lastLat && profile?.lastLng ? 'Enregistrée' : 'Non enregistrée'}
            </p>
          </div>
        </div>
        <div className="bento-card flex items-center gap-3">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{experienceYears} ans</p>
            <p className="text-xs text-muted-foreground">Expérience</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bento-card space-y-4">
        <h3 className="font-semibold">Modifier mon profil professionnel</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Description (Bio)</label>
            <textarea 
              className="w-full mt-1.5 min-h-[100px] p-3 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez votre expérience, vos spécialités et pourquoi les clients devraient vous choisir..."
            />
          </div>
          
          <div>
            <Input 
              label="Années d'expérience" 
              type="number" 
              value={experienceYears} 
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)} 
            />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-1.5" /> Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}