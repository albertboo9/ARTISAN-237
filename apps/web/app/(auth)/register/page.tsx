'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password || !form.firstName || !form.lastName || !form.phoneNumber) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    try {
      // Le backend détermine le rôle automatiquement.
      // Si l'email contient "admin", l'inscription échouera (admin créé uniquement en seed).
      // Sinon, le backend décide du rôle selon l'email ou d'autres critères métier.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          // Aucun rôle envoyé — c'est le backend qui décide
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.detail || 'Erreur lors de l\'inscription');
      }

      setIsSubmitting(false);
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      if (message.includes('email') || message.includes('Email')) {
        setError('Cet email est déjà utilisé. Veuillez vous connecter.');
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-brand-bg">
      {/* GAUCHE : Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-ai/10" />
        <div className="relative z-10 text-brand-primary font-bold text-2xl tracking-tight">ARTISAN-237</div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-on-surface mb-6 leading-tight">
            Rejoignez la plateforme de confiance.
          </h1>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">100% sécurisé</h3>
                <p className="text-on-surface-variant text-sm mt-1">Paiements bloqués jusqu'à satisfaction. KYC obligatoire pour les artisans.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-ai/10 flex items-center justify-center shrink-0">
                <Sparkles className="text-brand-ai" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Décision intelligente</h3>
                <p className="text-on-surface-variant text-sm mt-1">Notre IA vous recommande les meilleurs artisans de votre quartier.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden text-brand-primary font-bold text-2xl tracking-tight mb-8 text-center">ARTISAN-237</div>
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2">Créer un compte</h2>
            <p className="text-on-surface-variant">C'est rapide et sécurisé.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-on-surface">Prénom</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none mt-1" placeholder="Jean" />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface">Nom</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none mt-1" placeholder="Dupont" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface">Email</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="vous@email.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface">Téléphone</label>
              <div className="relative mt-1">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="2376XXXXXXXX" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface">Mot de passe</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className="w-full h-11 pl-10 pr-10 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-hover disabled:opacity-50 transition-all mt-2">
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              Se connecter <ArrowRight size={14} className="inline" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}