'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { showSuccessToast, showErrorToast } from '../../lib/error-handler';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showSuccessToast(data?.data?.message || 'Email envoyé');
      setIsSent(true);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Artisan237</span>
            </Link>
          </div>

          {isSent ? (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Email envoyé</h1>
              <p className="text-muted-foreground">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
              <Link href="/login">
                <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5" /> Retour à la connexion</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground">Mot de passe oublié</h1>
                <p className="text-muted-foreground mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Email" type="email" placeholder="vous@exemple.com" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                  Envoyer le lien <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
                  <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}