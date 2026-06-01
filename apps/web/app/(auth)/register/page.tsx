'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Briefcase, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { cn } from '../../lib/cn';

export default function RegisterPage() {
  const { handleRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CLIENT' | 'ARTISAN'>('CLIENT');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string; password: string; firstName: string; lastName: string; phoneNumber: string;
  }>();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await handleRegister({ ...data, role });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Artisan237</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground mt-2">Rejoignez la marketplace des artisans à Douala</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                role === 'CLIENT'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <div className={cn('p-2 rounded-lg', role === 'CLIENT' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
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
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <div className={cn('p-2 rounded-lg', role === 'ARTISAN' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                <Briefcase className="h-5 w-5" />
              </div>
              <span className={cn('text-sm font-medium', role === 'ARTISAN' ? 'text-primary' : 'text-foreground')}>Artisan</span>
              <span className="text-xs text-muted-foreground">Je propose mes services</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" placeholder="Jean" icon={<User className="h-4 w-4" />} error={errors.firstName?.message} {...register('firstName', { required: 'Requis' })} />
              <Input label="Nom" placeholder="Dupont" icon={<User className="h-4 w-4" />} error={errors.lastName?.message} {...register('lastName', { required: 'Requis' })} />
            </div>
            <Input label="Email" type="email" placeholder="vous@exemple.com" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email', { required: 'Requis' })} />
            <Input label="Téléphone" type="tel" placeholder="+237 6XX XXX XXX" icon={<Phone className="h-4 w-4" />} error={errors.phoneNumber?.message} {...register('phoneNumber', { required: 'Requis' })} />
            <div className="relative">
              <Input label="Mot de passe" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 caractères" icon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password', { required: 'Requis', minLength: { value: 8, message: 'Min. 8 caractères' } })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
              Créer mon compte <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}