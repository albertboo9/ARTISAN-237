'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@artisan237/ui/components/ui/button';
import { Input } from '@artisan237/ui/components/ui/input';
import { Label } from '@artisan237/ui/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@artisan237/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@artisan237/ui/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@artisan237/ui/components/ui/select';
import { useToast } from '@artisan237/ui/components/ui/use-toast';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().regex(/^(\+237|0)[0-9]{8,9}$/, 'Numéro de téléphone invalide (format: +237XXXXXXXX ou 0XXXXXXXX)'),
  role: z.enum(['USER', 'ARTISAN']),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les conditions' }) }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthForm({ defaultTab }: { defaultTab?: 'login' | 'register' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, register: authRegister } = useAuthStore();

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: registerErrors,
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'USER' },
  });

  const {
    register: loginForm,
    handleSubmit: handleLoginSubmit,
    formState: loginFormErrors,
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      resetLogin();
      toast({ title: 'Connexion réussie', description: 'Bienvenue sur Artisan237 !' });
      router.push('/marketplace');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message || 'Identifiants invalides',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      });
      resetRegister();
      toast({ title: 'Inscription réussie', description: 'Vérifiez votre email pour activer votre compte.' });
      setActiveTab('login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <CardTitle className="text-2xl">Artisan237</CardTitle>
          <CardDescription>La marketplace intelligente des artisans à Douala</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="votre@email.com" {...loginForm('email')} />
                  {loginFormErrors.email && <p className="text-sm text-destructive">{loginFormErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" {...loginForm('password')} />
                  {loginFormErrors.password && <p className="text-sm text-destructive">{loginFormErrors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit(handleRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" placeholder="Jean" {...registerForm('firstName')} />
                    {registerErrors.firstName && <p className="text-sm text-destructive">{registerErrors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Dupont" {...registerForm('lastName')} />
                    {registerErrors.lastName && <p className="text-sm text-destructive">{registerErrors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" placeholder="votre@email.com" {...registerForm('email')} />
                  {registerErrors.email && <p className="text-sm text-destructive">{registerErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input id="register-password" type="password" placeholder="Min. 8 caractères" {...registerForm('password')} />
                  {registerErrors.password && <p className="text-sm text-destructive">{registerErrors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+237 6XX XXX XX XX" {...registerForm('phone')} />
                  {registerErrors.phone && <p className="text-sm text-destructive">{registerErrors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Je suis</Label>
                  <Select onValueChange={(v) => registerForm('role').onChange({ target: { value: v, name: 'role' } })} defaultValue="USER">
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Client</SelectItem>
                      <SelectItem value="ARTISAN">Artisan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="agreeTerms" {...registerForm('agreeTerms')} className="rounded border-gray-300" />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-brand-500 hover:underline">conditions d'utilisation</Link>
                  </Label>
                </div>
                {registerErrors.agreeTerms && <p className="text-sm text-destructive">{registerErrors.agreeTerms.message}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Inscription...' : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            En continuant, vous acceptez nos{' '}
            <Link href="/privacy" className="underline underline-offset-4">politique de confidentialité</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}