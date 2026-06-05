"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../components/ui/button";

const CATEGORIES = [
  { name: "Plomberie", icon: "💧", color: "bg-blue-50 text-blue-700" },
  { name: "Électricité", icon: "⚡", color: "bg-amber-50 text-amber-700" },
  { name: "Maçonnerie", icon: "🧱", color: "bg-stone-50 text-stone-700" },
  { name: "Menuiserie", icon: "saws", color: "bg-orange-50 text-orange-700" },
  { name: "Froid & Climatisation", icon: "❄️", color: "bg-cyan-50 text-cyan-700" },
  { name: "Peinture", icon: "🎨", color: "bg-purple-50 text-purple-700" },
];

export default function Homepage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-on-surface">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Lueur d'arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-ai/10 text-brand-ai text-sm font-semibold mb-6">
            <Sparkles size={16} className="animate-pulse-soft" />
            <span>Smart Job Builder propulsé par l'IA</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
            Trouvez un artisan compétent. <br />
            <span className="text-brand-primary">Sans vous faire arnaquer.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">
            La première plateforme au Cameroun qui sécurise votre argent et utilise l'intelligence artificielle pour vous trouver le meilleur professionnel certifié.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-brand-primary/20 rounded-2xl blur-xl group-focus-within:bg-brand-primary/30 transition-all duration-300 -z-10"></div>
            <div className="flex items-center bg-card border-2 border-surface-container-high rounded-2xl p-2 shadow-sm focus-within:border-brand-primary focus-within:shadow-md transition-all duration-300">
              <div className="pl-4 pr-2 text-on-surface-variant">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Quel problème souhaitez-vous résoudre aujourd'hui ?"
                className="flex-1 bg-transparent border-none focus:outline-none text-lg h-14 placeholder:text-on-surface-variant/60"
              />
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-brand-primary hover:bg-brand-hover text-lg font-semibold shadow-[0_4px_14px_0_rgba(0,108,73,0.39)] hover:shadow-[0_6px_20px_rgba(0,108,73,0.23)] hover:-translate-y-0.5 transition-all duration-200">
                Trouver
              </Button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* 2. TRUST BAND */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-y border-surface-container-high bg-card py-8"
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-10 md:gap-20 text-on-surface-variant font-medium">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand-primary" size={28} />
            <span className="text-sm md:text-base">Identités Vérifiées (KYC)</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="text-slate-700" size={28} />
            <span className="text-sm md:text-base">Paiements Sécurisés (Escrow)</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-ai" size={28} />
            <span className="text-sm md:text-base">Match IA à 99.9%</span>
          </div>
        </div>
      </motion.section>

      {/* 3. CATEGORIES BENTO */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos catégories principales</h2>
          <p className="text-on-surface-variant text-lg">Des professionnels vérifiés pour chaque besoin du quotidien.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group cursor-pointer bento-card flex flex-col items-center text-center p-8 hover:-translate-y-1 transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-lg">{cat.name}</h3>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-brand-primary text-sm font-medium flex items-center gap-1">
                  Explorer <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. POURQUOI NOUS FAIRE CONFIANCE */}
      <section className="py-24 px-4 md:px-8 bg-surface-container-low border-y border-surface-container-high">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">La confiance est notre seul produit.</h2>
            <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
              Nous avons repensé la mise en relation pour éliminer les risques. L'artisan ne reçoit son argent que lorsque vous validez la fin des travaux.
            </p>
            <ul className="space-y-4">
              {[
                "L'argent est bloqué de façon neutre",
                "Identité et casier des artisans vérifiés",
                "Score de confiance transparent calculé par IA",
                "Support en cas de litige"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-brand-primary shrink-0" size={24} />
                  <span className="font-medium text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative h-[500px] bg-card rounded-3xl border border-surface-container-high shadow-xl p-8 flex flex-col justify-center overflow-hidden"
          >
             {/* Abstract UI representation */}
             <div className="absolute inset-0 bg-gradient-to-br from-brand-bg to-brand-surface opacity-50"></div>
             <div className="relative z-10 space-y-6">
                <div className="bg-card p-4 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Fonds Sécurisés</p>
                    <p className="text-sm text-on-surface-variant">50,000 FCFA bloqués en Escrow</p>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-4 ml-8">
                  <div className="w-12 h-12 rounded-full bg-brand-ai/10 flex items-center justify-center text-brand-ai">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Match IA Garanti</p>
                    <p className="text-sm text-on-surface-variant">Artisan validé pour ce besoin exact</p>
                  </div>
                </div>
                <div className="bg-brand-primary text-on-primary p-4 rounded-xl shadow-[0_10px_30px_rgba(0,108,73,0.3)] flex items-center justify-between mt-8">
                  <span className="font-semibold">Travaux terminés</span>
                  <CheckCircle2 size={24} />
                </div>
             </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}