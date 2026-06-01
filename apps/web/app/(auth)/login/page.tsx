'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await handleLogin(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
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
            <blockquote className="text-white/90 text-lg leading-relaxed font-light italic">
              &ldquo;La meilleure façon de trouver l'artisan qu'il vous faut,
              c'est de laisser la technologie faire le premier pas.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm font-semibold text-white">AB</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Albert Boo</p>
                <p className="text-xs text-white/60">Fondateur, Artisan237</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/40">
            &copy; 2026 Artisan237. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Artisan237</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-foreground">Content de vous revoir</h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à votre tableau de bord
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">Se souvenir de moi</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Se connecter
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}