"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Button from "../../components/ui/button";
import { useLogin } from "../../hooks/useAuth";
import { useToast } from "../../components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          toast.success(`Bienvenue ${data.user.firstName} !`);
          const role = data.user.role;
          if (role === "ARTISAN") router.push("/artisan");
          else if (role === "ADMIN") router.push("/admin");
          else router.push("/client");
        },
        onError: (err) => {
          const msg = err.message === "Invalid credentials" 
            ? "Email ou mot de passe incorrect." 
            : err.message || "Une erreur est survenue lors de la connexion.";
          setError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-brand-bg">
      
      {/* GAUCHE : Storytelling & Réassurance (50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden p-12 flex-col justify-between">
        {/* Abstract Pattern / Image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-ai/10"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 40 40\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M0 40L40 0H20L0 20M40 40V20L20 40\\'%3E%3C/path%3E%3C/g%3E%3C/svg%3E')" }}></div>
        
        <div className="relative z-10 text-brand-primary font-bold text-2xl tracking-tight">
          ARTISAN-237
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-on-surface mb-6 leading-tight">
            La plateforme de confiance pour l'artisanat au Cameroun.
          </h1>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Lock className="text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Paiements 100% sécurisés</h3>
                <p className="text-on-surface-variant text-sm mt-1">Votre argent est bloqué via Escrow et libéré uniquement à la satisfaction des travaux.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-ai/10 flex items-center justify-center shrink-0">
                <Sparkles className="text-brand-ai" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Match IA Intelligent</h3>
                <p className="text-on-surface-variant text-sm mt-1">Notre algorithme vous trouve l'artisan le plus qualifié, le plus proche, et le plus réactif.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          {/* Trust indicators */}
          <div className="flex gap-6 items-center border-t border-brand-primary/10 pt-6">
             <div className="flex flex-col">
               <span className="text-3xl font-bold text-on-surface">10k+</span>
               <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Artisans Vérifiés</span>
             </div>
             <div className="w-px h-8 bg-brand-primary/20"></div>
             <div className="flex flex-col">
               <span className="text-3xl font-bold text-on-surface">0</span>
               <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Arnaques Tolérées</span>
             </div>
          </div>
        </div>
      </div>

      {/* DROITE : Formulaire (50%) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Branding */}
          <div className="lg:hidden text-brand-primary font-bold text-2xl tracking-tight mb-8 text-center">
            ARTISAN-237
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2">Bienvenue.</h2>
            <p className="text-on-surface-variant">Connectez-vous pour continuer sur votre espace.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface">Adresse Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                placeholder="votre@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-on-surface">Mot de passe</label>
                <Link href="#" className="text-sm font-medium text-brand-primary hover:underline">Oublié ?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-surface-container-high bg-card focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 text-base font-bold bg-brand-primary hover:bg-brand-hover shadow-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-on-surface-variant">
            Nouveau sur la plateforme ?{" "}
            <Link href="/register" className="font-semibold text-brand-primary hover:underline inline-flex items-center gap-1">
              Créer un compte <ArrowRight size={14} />
            </Link>
          </div>

          {/* Sécurité */}
          <div className="mt-12 pt-6 border-t border-surface-container-high flex justify-center items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck size={16} className="text-brand-primary" />
            Données cryptées et sécurisées
          </div>
        </motion.div>
      </div>

    </div>
  );
}