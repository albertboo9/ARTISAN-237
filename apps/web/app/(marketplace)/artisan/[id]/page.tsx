"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Camera, Sparkles, Lock } from "lucide-react";
import Button from "../../../components/ui/button";
import { TrustBadge } from "../../../components/artisan/TrustBadge";
import { AIBadge } from "../../../components/artisan/AIBadge";

export default function ArtisanProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-brand-bg" />;

  return (
    <div className="min-h-screen bg-brand-bg pt-16 pb-24">
      {/* 1. COUVERTURE (Header Background) */}
      <div className="h-48 md:h-64 w-full bg-surface-container-high relative overflow-hidden">
         {/* Placeholder de couverture texturé */}
         <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-ai/20"></div>
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* COLONNE PRINCIPALE (Contenu) */}
          <div className="flex-1 space-y-8">
            
            {/* Header Info */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-surface-container-high relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-12 mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-brand-primary text-white flex items-center justify-center text-4xl font-bold border-4 border-card shadow-md shrink-0">
                  JE
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Jean-Paul Etoa</h1>
                    <TrustBadge score={98} />
                  </div>
                  <p className="text-lg text-brand-primary font-medium">Plombier Expert</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-on-surface-variant font-medium pt-4 border-t border-surface-container-high">
                <div className="flex items-center gap-1.5">
                  <Star className="text-amber-500 fill-amber-500" size={18} />
                  <span className="text-on-surface text-base font-semibold">4.8</span>
                  <span>(124 avis vérifiés)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={18} />
                  <span>Akwa, Douala</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={18} />
                  <span>Répond en ~10 min</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {/* Présentation */}
              <section className="bg-card rounded-2xl p-6 shadow-sm border border-surface-container-high">
                <h2 className="text-xl font-bold mb-4">À propos</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Artisan certifié avec plus de 10 ans d'expérience dans la plomberie résidentielle et commerciale. 
                  Je m'engage à fournir un travail propre, rapide et garanti. Mon objectif est de résoudre vos problèmes 
                  sans que vous n'ayez à me rappeler deux fois pour le même souci.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Dépannage d'urgence", "Installation sanitaire", "Chauffe-eau", "Recherche de fuite"].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Réalisations */}
              <section className="bg-card rounded-2xl p-6 shadow-sm border border-surface-container-high">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-bold">Réalisations récentes</h2>
                   <Button variant="ghost" size="sm" className="text-brand-primary">Voir tout <ChevronRight size={16} /></Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-square rounded-xl bg-surface-container flex flex-col items-center justify-center text-on-surface-variant/50 hover:bg-surface-container-high transition-colors cursor-pointer border border-border/50">
                       <Camera size={32} className="mb-2" />
                       <span className="text-xs font-medium">Chantier {i}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Historique Escrow */}
              <section className="bg-card rounded-2xl p-6 shadow-sm border border-surface-container-high">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <ShieldCheck className="text-brand-primary" /> Transparence Escrow
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-brand-bg rounded-xl border border-surface-container-high text-center">
                     <p className="text-3xl font-bold text-on-surface mb-1">124</p>
                     <p className="text-xs font-medium text-on-surface-variant uppercase">Jobs Terminés</p>
                  </div>
                  <div className="p-4 bg-brand-bg rounded-xl border border-surface-container-high text-center">
                     <p className="text-3xl font-bold text-on-surface mb-1">0</p>
                     <p className="text-xs font-medium text-on-surface-variant uppercase">Litiges Ouverts</p>
                  </div>
                  <div className="p-4 bg-brand-bg rounded-xl border border-surface-container-high text-center">
                     <p className="text-3xl font-bold text-on-surface mb-1">100%</p>
                     <p className="text-xs font-medium text-on-surface-variant uppercase">Fonds Libérés</p>
                  </div>
                  <div className="p-4 bg-brand-bg rounded-xl border border-surface-container-high text-center">
                     <p className="text-3xl font-bold text-on-surface mb-1">2.4</p>
                     <p className="text-xs font-medium text-on-surface-variant uppercase">Ans d'ancienneté</p>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* SIDEBAR STICKY (Conversion & IA) */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24 space-y-6">
              
              {/* IA Match Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card rounded-2xl shadow-sm border-2 border-brand-ai/30 overflow-hidden"
              >
                <div className="bg-brand-ai/5 px-6 py-4 border-b border-brand-ai/10 flex items-center gap-2">
                   <Sparkles className="text-brand-ai" size={20} />
                   <h3 className="font-semibold text-brand-ai">Recommandé par l'IA</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-end gap-2 mb-4">
                     <span className="text-5xl font-bold text-on-surface tracking-tighter">95%</span>
                     <span className="text-on-surface-variant font-medium pb-1">de compatibilité</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-xl">
                    Artisan idéal pour votre besoin actuel. Il est situé à moins de 2km, possède d'excellentes évaluations (4.8) sur des travaux similaires et répond généralement en 10 minutes.
                  </p>
                </div>
              </motion.div>

              {/* Action Box */}
              <div className="bg-card rounded-2xl shadow-sm border border-surface-container-high p-6">
                <h3 className="font-bold text-lg mb-2">Prêt à démarrer ?</h3>
                <p className="text-sm text-on-surface-variant mb-6">Demandez un devis gratuit. Votre argent sera sécurisé par Escrow jusqu'à la fin des travaux.</p>
                
                <div className="space-y-3">
                  <Button className="w-full h-12 text-base font-semibold bg-brand-primary hover:bg-brand-hover shadow-[0_4px_14px_0_rgba(0,108,73,0.39)]">
                    <Briefcase className="mr-2" size={18} />
                    Demander un devis
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-base font-semibold border-surface-container-high hover:bg-surface-container">
                    <MessageSquare className="mr-2" size={18} />
                    Contacter
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-brand-primary">
                  <Lock size={14} /> Paiement 100% sécurisé
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
