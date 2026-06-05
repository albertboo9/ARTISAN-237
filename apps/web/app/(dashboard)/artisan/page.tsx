"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMe } from "../../hooks/useAuth";
import {
  TrendingUp, ShieldCheck, Clock, CheckCircle2,
  MoreVertical, MapPin, Plus, Zap, MessageSquare, DollarSign
} from "lucide-react";
import Button from "../../components/ui/button";
import { EscrowTracker } from "../../components/artisan/EscrowTracker";
import { TrustBadge } from "../../components/artisan/TrustBadge";
import { AIBadge } from "../../components/artisan/AIBadge";

// ── Animation variants ──────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ── Interface Pipeline ──────────────────────────────
interface PipelineCard {
  id: string;
  title: string;
  description: string;
  aiMatch: number;
  amount: string;
  time: string;
  location: string;
  status: "nouvelle" | "devis" | "travaux" | "termine";
  escrowAmount?: string;
}

const MOCK_PIPELINE: PipelineCard[] = [
  {
    id: "1", title: "Fuite d'eau sous évier", description: "Bonjour, j'ai une fuite importante dans ma cuisine depuis ce matin. L'eau coule sous l'évier et le placard commence à gonfler.",
    aiMatch: 95, amount: "—", time: "Aujourd'hui, 08:30", location: "Bonanjo, Douala", status: "nouvelle",
  },
  {
    id: "2", title: "Installation Chauffe-eau", description: "Remplacement d'un chauffe-eau de 50L par un modèle plus récent. Travaux prévus dans la salle de bain principale.",
    aiMatch: 88, amount: "45,000 FCFA", time: "Hier, 14:15", location: "Akwa, Douala", status: "devis",
  },
  {
    id: "3", title: "Réparation Climatisation", description: "Climatiseur split qui ne refroidit plus. Diagnostic déjà réalisé : fuite de gaz probable.",
    aiMatch: 92, amount: "65,000 FCFA bloqués", time: "Il y a 2 jours", location: "Bonapriso, Douala", status: "travaux", escrowAmount: "65,000 FCFA",
  },
];

const COLUMNS = [
  { key: "nouvelle", label: "Nouvelles Demandes", color: "border-l-brand-ai" },
  { key: "devis", label: "Devis Envoyés", color: "border-l-brand-accent" },
  { key: "travaux", label: "Travaux Sécurisés", color: "border-l-brand-primary" },
];

export default function ArtisanDashboard() {
  const { data: me } = useMe();

  const kpis = [
    { icon: DollarSign, label: "Revenus (30j)", value: "150k", change: "+12%", color: "text-brand-primary" },
    { icon: ShieldCheck, label: "Trust Score", value: "98", unit: "/100", change: "Excellent", color: "text-white", bg: "bg-brand-primary", progress: 98 },
    { icon: Clock, label: "Temps réponse", value: "12", unit: "min", change: "Top 5%", color: "text-brand-primary" },
    { icon: CheckCircle2, label: "Taux succès", value: "100%", change: "124 missions", color: "text-brand-primary" },
  ];

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────── */}
        <motion.div className="flex items-center justify-between mb-8" {...fadeUp}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Bonjour, {me?.firstName || "Artisan"}
            </h1>
            <p className="text-on-surface-variant mt-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-primary" />
              Votre Trust Score est excellent — continuez ainsi.
            </p>
          </div>
          <Button className="hidden sm:flex items-center gap-2 bg-on-surface text-surface hover:bg-on-surface/90 rounded-full h-11 px-6 font-semibold">
            <Plus size={18} /> Nouveau service
          </Button>
        </motion.div>

        {/* ── KPIs (Linear Style) ────────────────── */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10" variants={stagger} initial="initial" animate="animate">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              variants={fadeUp}
              className={`relative p-5 rounded-2xl border border-surface-container-high shadow-sm flex flex-col justify-between h-32 overflow-hidden ${kpi.bg || "bg-card"}`}
            >
              {kpi.bg && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-primary/80" />
              )}
              <div className={`relative z-10 flex items-center gap-2 text-sm font-medium ${kpi.bg ? "text-white/80" : "text-on-surface-variant"}`}>
                <kpi.icon size={16} /> {kpi.label}
              </div>
              <div className="relative z-10">
                <p className={`text-3xl font-bold tracking-tight ${kpi.bg ? "text-white" : "text-on-surface"}`}>
                  {kpi.value}
                  {kpi.unit && <span className="text-xl font-normal opacity-70">{kpi.unit}</span>}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${kpi.bg ? "text-white/70" : "text-brand-primary"}`}>
                  {kpi.change}
                </p>
                {kpi.progress && (
                  <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${kpi.progress}%` }} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Pipeline Kanban ────────────────────── */}
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <Zap size={20} className="text-brand-ai" /> Pipeline des missions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {COLUMNS.map((col) => {
            const cards = MOCK_PIPELINE.filter((c) => c.status === col.key);
            return (
              <div key={col.key} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                  <h3 className="font-semibold text-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-1 h-4 rounded-full ${col.color.replace("border-l-", "bg-")}`} />
                    {col.label}
                  </h3>
                  <span className="bg-surface-container text-on-surface px-2 py-0.5 rounded-full text-xs font-semibold">{cards.length}</span>
                </div>

                {cards.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-surface-container flex items-center justify-center rounded-xl">
                    <p className="text-sm text-on-surface-variant font-medium">Aucune demande</p>
                  </div>
                ) : (
                  cards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-4 rounded-xl border border-surface-container-high shadow-sm hover:shadow-md hover:border-brand-ai/30 transition-all duration-200 cursor-pointer group relative"
                    >
                      {/* AI Match Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <AIBadge score={card.aiMatch} />
                        <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      <h4 className="font-bold text-on-surface text-[15px] mb-1">{card.title}</h4>
                      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2 leading-relaxed">{card.description}</p>

                      {/* Escrow info */}
                      {card.escrowAmount && (
                        <div className="mb-3 bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/20">
                          <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                            <ShieldCheck size={16} />
                            {card.escrowAmount} sécurisés
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant pt-2 border-t border-surface-container-high/50">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {card.location}
                        </span>
                        <span>{card.time}</span>
                      </div>

                      {/* CTA */}
                      <div className="mt-3">
                        {card.status === "nouvelle" && (
                          <Button className="w-full h-9 text-xs font-semibold bg-surface-container text-on-surface hover:bg-brand-primary hover:text-white transition-all rounded-lg">
                            <MessageSquare size={14} className="mr-1.5" /> Faire un devis
                          </Button>
                        )}
                        {card.status === "devis" && (
                          <Button className="w-full h-9 text-xs font-semibold bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white transition-all rounded-lg">
                            <MessageSquare size={14} className="mr-1.5" /> Relancer
                          </Button>
                        )}
                        {card.status === "travaux" && (
                          <Button className="w-full h-9 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-hover rounded-lg">
                            <CheckCircle2 size={14} className="mr-1.5" /> Marquer Terminé
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}