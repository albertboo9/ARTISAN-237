"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMe } from "../../hooks/useAuth";
import {
  Briefcase, FileText, ShieldCheck, AlertTriangle,
  ArrowRight, Clock, CheckCircle2, MapPin, MoreHorizontal
} from "lucide-react";
import Button from "../../components/ui/button";
import { EscrowTracker } from "../../components/artisan/EscrowTracker";

// ── Animation ───────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

// ── Types ───────────────────────────────────────────
interface Mission {
  id: string;
  title: string;
  artisan: string;
  location: string;
  amount: string;
  status: "quote" | "funded" | "progress" | "completed";
  date: string;
}

const MISSIONS: Mission[] = [
  { id: "1", title: "Réparation fuite d'eau", artisan: "Marie N.", location: "Bonanjo", amount: "35,000 FCFA", status: "progress", date: "Aujourd'hui" },
  { id: "2", title: "Installation électrique", artisan: "Paul K.", location: "Akwa", amount: "85,000 FCFA", status: "funded", date: "Hier" },
  { id: "3", title: "Peinture salon", artisan: "Jean M.", location: "Deido", amount: "50,000 FCFA", status: "completed", date: "12 Mai" },
];

export default function ClientDashboard() {
  const { data: me } = useMe();

  const kpis = [
    { icon: Briefcase, label: "Travaux en cours", value: "2", sub: "1 à venir", color: "text-brand-ai" },
    { icon: FileText, label: "Devis reçus", value: "4", sub: "3 en attente", color: "text-brand-accent" },
    { icon: ShieldCheck, label: "Montant protégé", value: "120k", sub: "FCFA sécurisés", color: "text-brand-primary", bg: "bg-brand-primary", textWhite: true },
    { icon: AlertTriangle, label: "Litiges", value: "0", sub: "Aucun problème", color: "text-brand-primary" },
  ];

  const statusLabel = (s: Mission["status"]) => {
    const map = { quote: "Devis reçu", funded: "🔒 Fonds bloqués", progress: "🔧 En travaux", completed: "✅ Terminé" };
    return map[s];
  };

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────── */}
        <motion.div className="flex items-center justify-between mb-8" {...fadeUp}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Bonjour, {me?.firstName || "Client"}
            </h1>
            <p className="text-on-surface-variant mt-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-primary" />
              Vos paiements sont protégés — ne payez qu'une fois satisfait.
            </p>
          </div>
          <Button className="hidden sm:flex items-center gap-2 bg-brand-primary text-surface hover:bg-brand-hover rounded-full h-11 px-6 font-semibold shadow-sm">
            <Briefcase size={18} /> Publier une mission
          </Button>
        </motion.div>

        {/* ── KPIs (Stripe Style) ──────────────── */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10" variants={stagger} initial="initial" animate="animate">
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={fadeUp}
              className={`relative p-5 rounded-2xl border border-surface-container-high shadow-sm flex flex-col justify-between h-32 overflow-hidden ${kpi.bg || "bg-card"}`}
            >
              {kpi.bg && <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-primary/80" />}
              <div className={`relative z-10 flex items-center gap-2 text-sm font-medium ${kpi.textWhite ? "text-white/80" : "text-on-surface-variant"}`}>
                <kpi.icon size={16} /> {kpi.label}
              </div>
              <div className="relative z-10">
                <p className={`text-3xl font-bold tracking-tight ${kpi.textWhite ? "text-white" : "text-on-surface"}`}>
                  {kpi.value}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${kpi.textWhite ? "text-white/70" : "text-brand-primary"}`}>
                  {kpi.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Escrow Tracker (Vue d'ensemble) ──── */}
        <motion.div className="bg-card p-6 rounded-2xl border border-surface-container-high shadow-sm mb-10" {...fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand-primary" />
              Suivi des fonds sécurisés
            </h2>
            <span className="text-sm font-semibold text-brand-primary">120,000 FCFA protégés</span>
          </div>
          <EscrowTracker currentStep="IN_PROGRESS" />
        </motion.div>

        {/* ── Timeline des missions ───────────── */}
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Clock size={20} className="text-brand-accent" /> Mes missions
        </h2>

        <div className="space-y-4">
          {MISSIONS.map((mission, i) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-5 rounded-xl border border-surface-container-high shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Status badge */}
                  <span className="inline-block text-xs font-semibold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full mb-2">
                    {statusLabel(mission.status)}
                  </span>
                  <h3 className="font-bold text-on-surface text-[16px]">{mission.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-brand-ai/10 flex items-center justify-center text-[10px] font-bold text-brand-ai">
                        {mission.artisan.charAt(0)}
                      </span>
                      {mission.artisan}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {mission.location}
                    </span>
                    <span className="font-semibold text-on-surface">{mission.amount}</span>
                    <span>{mission.date}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button className="h-9 px-4 text-xs font-semibold bg-surface-container text-on-surface hover:bg-brand-primary hover:text-white rounded-lg transition-all">
                    Détails
                  </Button>
                  <Button className="h-9 px-4 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-hover rounded-lg transition-all">
                    {mission.status === "funded" ? "Suivre" : mission.status === "completed" ? "Avis" : "Contacter"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── CTA + Réassurance ───────────────── */}
        <motion.div className="mt-10 bg-gradient-to-br from-brand-primary/5 to-brand-ai/5 p-6 rounded-2xl border border-brand-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4" {...fadeUp}>
          <div>
            <h3 className="font-bold text-on-surface text-lg">Besoin d'un autre artisan ?</h3>
            <p className="text-sm text-on-surface-variant mt-1">Notre IA vous trouvera le meilleur professionnel disponible.</p>
          </div>
          <Button className="bg-brand-primary text-surface hover:bg-brand-hover rounded-full h-11 px-8 font-semibold whitespace-nowrap shadow-sm">
            Trouver un artisan <ArrowRight size={18} className="ml-2" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
}