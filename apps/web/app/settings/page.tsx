'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Sun, Moon, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { PageTransition } from '../components/shared/page-transition';
import { ProtectedRoute } from '../components/auth/protected-route';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { showSuccessToast } from '../lib/error-handler';

const sections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Apparence', icon: Sun },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <div><h1 className="text-2xl font-bold text-foreground">Paramètres</h1><p className="text-muted-foreground">Gérez vos préférences et votre compte</p></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left', activeSection === sec.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-container')}>
                    <Icon className="h-5 w-5" /> {sec.label}
                  </button>
                );
              })}
            </div>
            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4"><Input label="Prénom" defaultValue="Paul" /><Input label="Nom" defaultValue="Tchuente" /></div>
                  <Input label="Email" type="email" defaultValue="paul@example.com" />
                  <Input label="Téléphone" defaultValue="+237 6XX XXX XXX" />
                  <Button onClick={() => showSuccessToast('Profil mis à jour')}>Enregistrer</Button>
                </motion.div>
              )}
              {activeSection === 'security' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Sécurité</h3>
                  <Input label="Mot de passe actuel" type="password" />
                  <Input label="Nouveau mot de passe" type="password" />
                  <Input label="Confirmer le mot de passe" type="password" />
                  <Button>Mettre à jour</Button>
                </motion.div>
              )}
              {activeSection === 'notifications' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Notifications</h3>
                  {['Notifications push', 'Notifications email', 'Rappels de mission', 'Nouveaux devis'].map((n) => (
                    <label key={n} className="flex items-center justify-between py-2"><span className="text-sm">{n}</span>
                      <div className="relative h-6 w-10 rounded-full bg-primary cursor-pointer"><div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" /></div>
                    </label>
                  ))}
                </motion.div>
              )}
              {activeSection === 'theme' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bento-card space-y-4">
                  <h3 className="font-semibold">Apparence</h3>
                  <div className="flex gap-3">
                    <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-surface-container text-center"><Sun className="h-6 w-6 mx-auto mb-1 text-amber-500" /><span className="text-sm font-medium">Clair</span></button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-border hover:border-primary/30 text-center"><Moon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" /><span className="text-sm font-medium">Sombre</span></button>
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