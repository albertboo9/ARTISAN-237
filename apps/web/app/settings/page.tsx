'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Sun, Moon, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { PageTransition } from '../components/shared/page-transition';
import { ProtectedRoute } from '../components/auth/protected-route';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { showSuccessToast, showErrorToast } from '../lib/error-handler';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../lib/api-client';
import { useTheme } from 'next-themes';

const sections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Apparence', icon: Sun },
];

export default function SettingsPage() {
  const { user, fetchMe } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      // Assuming a generic /auth/me or /users/me endpoint for base profile info
      // If such endpoint doesn't exist yet, this is a placeholder
      await apiClient('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ firstName, lastName, email, phoneNumber }),
      });
      await fetchMe();
      showSuccessToast('Profil mis à jour');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      showErrorToast('Les mots de passe ne correspondent pas');
      return;
    }
    setIsSaving(true);
    try {
      await apiClient('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      showSuccessToast('Mot de passe mis à jour');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos préférences et votre compte</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button 
                    key={sec.id} 
                    onClick={() => setActiveSection(sec.id)} 
                    className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left', 
                      activeSection === sec.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-container'
                    )}
                  >
                    <Icon className="h-5 w-5" /> {sec.label}
                  </button>
                );
              })}
            </div>
            
            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input label="Téléphone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  <Button onClick={handleUpdateProfile} isLoading={isSaving}>Enregistrer</Button>
                </motion.div>
              )}
              
              {activeSection === 'security' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Sécurité</h3>
                  <Input 
                    label="Mot de passe actuel" 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                  />
                  <Input 
                    label="Nouveau mot de passe" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                  <Input 
                    label="Confirmer le mot de passe" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <Button onClick={handleUpdatePassword} isLoading={isSaving}>Mettre à jour</Button>
                </motion.div>
              )}
              
              {activeSection === 'notifications' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Notifications</h3>
                  {['Notifications push', 'Notifications email', 'Rappels de mission', 'Nouveaux devis'].map((n) => (
                    <label key={n} className="flex items-center justify-between py-2">
                      <span className="text-sm">{n}</span>
                      <div className="relative h-6 w-10 rounded-full bg-primary cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
                      </div>
                    </label>
                  ))}
                </motion.div>
              )}
              
              {activeSection === 'theme' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Apparence</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setTheme('light')}
                      className={cn("flex-1 p-4 rounded-xl border-2 text-center transition-all", theme !== 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface-container')}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                      <span className="text-sm font-medium">Clair</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={cn("flex-1 p-4 rounded-xl border-2 text-center transition-all", theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface-container')}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-sm font-medium">Sombre</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}