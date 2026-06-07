"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ShieldCheck, ArrowLeft, Briefcase, MessageSquare, Sparkles, Lock, Loader2, User } from "lucide-react";
import Button from "../../../components/ui/button";
import apiClient from "../../../lib/api.client";

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadArtisan();
  }, [id]);

  const loadArtisan = async () => {
    try {
      // Essayer d'abord l'endpoint public
      const { data } = await apiClient.get(`/artisans/map`);
      const raw = data?.data ?? data;
      const artisans = raw?.artisans || raw?.data || [];
      if (Array.isArray(artisans)) {
        const found = artisans.find((a: any) => a.userId === id || a.id === id || a.user?.id === id);
        if (found) {
          setArtisan(found);
          setLoading(false);
          return;
        }
      }
      // Fallback : chercher via users
      const { data: uData } = await apiClient.get(`/users/${id}`);
      setArtisan(uData?.data ?? uData);
    } catch (err) {
      console.error("Erreur chargement artisan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!artisan) return <div className="text-center py-20"><p className="text-muted-foreground">Artisan introuvable</p></div>;

  const firstName = artisan.firstName || artisan.user?.firstName || "Artisan";
  const lastName = artisan.lastName || artisan.user?.lastName || "";
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  const rating = artisan.rating || 0;
  const totalJobs = artisan.totalJobs || 0;
  const bio = artisan.bio || "Artisan professionnel";
  const repere = artisan.repere || "Douala";
  const experienceYears = artisan.experienceYears || 0;
  const aiScore = artisan.aiScore || 0;
  const explanation = artisan.explanation || "Artisan disponible dans votre secteur.";

  return (
    <div className="min-h-screen bg-surface pt-16 pb-24">
      <div className="h-48 md:h-64 w-full bg-surface-container-high relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-ai/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 sm:-mt-12 mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary text-white flex items-center justify-center text-4xl font-bold border-4 border-card shadow-md shrink-0">
                  {initials}
                </div>
                <div className="flex-1 pb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{firstName} {lastName}</h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium pt-4 border-t border-border/50">
                {rating > 0 && <div className="flex items-center gap-1.5"><Star className="text-amber-500 fill-amber-500" size={18} /><span className="text-foreground text-base font-semibold">{rating?.toFixed(1)}</span></div>}
                <div className="flex items-center gap-1.5"><MapPin size={18} /><span>{repere}</span></div>
                <div className="flex items-center gap-1.5"><Clock size={18} /><span>Répond rapidement</span></div>
              </div>
            </div>

            <section className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-bold mb-4">À propos</h2>
              <p className="text-muted-foreground leading-relaxed">{bio}</p>
            </section>

            <section className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-primary" /> Statistiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-surface rounded-xl border border-border/50 text-center"><p className="text-3xl font-bold text-foreground mb-1">{totalJobs}</p><p className="text-xs font-medium text-muted-foreground uppercase">Jobs</p></div>
                <div className="p-4 bg-surface rounded-xl border border-border/50 text-center"><p className="text-3xl font-bold text-foreground mb-1">{rating?.toFixed(1)}</p><p className="text-xs font-medium text-muted-foreground uppercase">Note</p></div>
                <div className="p-4 bg-surface rounded-xl border border-border/50 text-center"><p className="text-3xl font-bold text-foreground mb-1">{experienceYears}</p><p className="text-xs font-medium text-muted-foreground uppercase">Ans exp.</p></div>
                <div className="p-4 bg-surface rounded-xl border border-border/50 text-center"><p className="text-3xl font-bold text-foreground mb-1">{aiScore}%</p><p className="text-xs font-medium text-muted-foreground uppercase">Match IA</p></div>
              </div>
            </section>
          </div>

          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24 space-y-6">
              {aiScore > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl shadow-sm border-2 border-ai/30 overflow-hidden">
                  <div className="bg-ai/5 px-6 py-4 border-b border-ai/10 flex items-center gap-2">
                    <Sparkles className="text-ai" size={20} /><h3 className="font-semibold text-ai">Recommandé par l'IA</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-bold text-foreground tracking-tighter">{Math.round(aiScore)}%</span>
                      <span className="text-muted-foreground font-medium pb-1">de compatibilité</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-surface-container-low p-3 rounded-xl">{explanation}</p>
                  </div>
                </motion.div>
              )}

              <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
                <h3 className="font-bold text-lg mb-2">Prêt à démarrer ?</h3>
                <p className="text-sm text-muted-foreground mb-6">Demandez un devis gratuit. Votre argent sera sécurisé par Escrow jusqu'à la fin des travaux.</p>
                <div className="space-y-3">
                  <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-sm">
                    <Briefcase className="mr-2" size={18} /> Demander un devis
                  </Button>
                  <Button variant="secondary" className="w-full h-12 text-base font-semibold">
                    <MessageSquare className="mr-2" size={18} /> Contacter
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-primary">
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