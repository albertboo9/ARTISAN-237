'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Briefcase, UserCheck, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { cn } from '../../lib/cn';

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export default function RegisterPage() {
  const { handleRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CLIENT' | 'ARTISAN'>('CLIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await handleRegister({ ...data, role });
    } catch (error: any) {
      // Handle specific HTTP errors with French messages
      const message = error?.message || '';
      if (message.includes('Email already registered') || message.includes('409')) {
        setServerError('Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.');
      } else if (message.includes('Phone number already registered')) {
        setServerError('Ce numéro de téléphone est déjà associé à un compte.');
      } else if (message.includes('400') || message.includes('validation')) {
        setServerError('Veuillez vérifier les informations saisies.');
      } else {
        setServerError(message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel - Brand (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-semibold text-white">Artisan237</span>
            </Link>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Rejoignez la communauté des artisans à Douala
            </h2>
            <p className="text-white/70 text-lg">
              {role === 'ARTISAN'
                ? 'Développez votre activité, recevez des missions et gérez vos clients en toute simplicité.'
                : 'Trouvez les meilleurs artisans vérifiés près de chez vous, en toute confiance.'}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['J', 'M', 'P', 'A'].map((letter, i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 border-2 border-primary text-xs font-bold text-white">
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/70">+200 utilisateurs actifs</p>
            </div>
          </div>
          <p className="text-sm text-white/40">&copy; 2026 Artisan237. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Artisan237</span>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la marketplace des artisans à Douala</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                role === 'CLIENT'
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <div className={cn('p-2.5 rounded-lg transition-colors', role === 'CLIENT' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                <UserCheck className="h-5 w-5" />
              </div>
              <span className={cn('text-sm font-medium', role === 'CLIENT' ? 'text-primary' : 'text-foreground')}>Client</span>
              <span className="text-xs text-muted-foreground">Je cherche un artisan</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('ARTISAN')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                role === 'ARTISAN'
                  ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <div className={cn('p-2.5 rounded-lg transition-colors', role === 'ARTISAN' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                <Briefcase className="h-5 w-5" />
              </div>
              <span className={cn('text-sm font-medium', role === 'ARTISAN' ? 'text-primary' : 'text-foreground')}>Artisan</span>
              <span className="text-xs text-muted-foreground">Je propose mes services</span>
            </button>
          </div>

          {/* Server Error Banner */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
            >
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">{serverError}</p>
                {serverError.includes('déjà utilisé') && (
                  <Link href="/login" className="text-xs text-primary hover:underline mt-1 inline-block">
                    Se connecter à la place →
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" placeholder="Jean" icon={<User className="h-4 w-4" />} error={errors.firstName?.message} {...register('firstName', { required: 'Le prénom est requis' })} />
              <Input label="Nom" placeholder="Dupont" icon={<User className="h-4 w-4" />} error={errors.lastName?.message} {...register('lastName', { required: 'Le nom est requis' })} />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'L\'email est requis',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format d\'email invalide' },
              })}
            />
            <Input
              label="Téléphone"
              type="tel"
              placeholder="+237 6XX XXX XXX"
              icon={<Phone className="h-4 w-4" />}
              error={errors.phoneNumber?.message}
              {...register('phoneNumber', {
                required: 'Le téléphone est requis',
                pattern: { value: /^\+?[0-9\s]{9,15}$/, message: 'Numéro de téléphone invalide' },
              })}
            />
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 caractères"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 8, message: 'Minimum 8 caractères' },
                })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              En créant un compte, vous acceptez nos{' '}
              <Link href="#" className="text-primary hover:underline">conditions d&apos;utilisation</Link>{' '}
              et notre{' '}
              <Link href="#" className="text-primary hover:underline">politique de confidentialité</Link>.
            </p>

            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              Créer mon compte <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}