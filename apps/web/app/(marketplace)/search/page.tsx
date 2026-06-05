"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { ArtisanCard } from '../../components/artisan/ArtisanCard';
import { EmptyState } from '../../components/ui/EmptyState';
import Button from '../../components/ui/button';
import { useSearchArtisans } from '../../hooks/useArtisans';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });

const DOUALA: [number, number] = [4.0511, 9.7085];

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState(params.get('q') || '');

  const serviceId = params.get('serviceId') || undefined;
  const repere = params.get('repere') || 'Douala Centre';

  const { data, isLoading, isError } = useSearchArtisans({ serviceId, repere });

  const artisans = data?.artisans || [];
  const iaUsed = data?.ia_used ?? false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}&repere=${encodeURIComponent(repere)}`);
    }
  };

  if (!mounted) return <div className="h-screen bg-brand-bg" />;

  return (
    <div className="flex flex-col md:flex-row h-screen pt-16 bg-brand-bg overflow-hidden">
      {/* COLONNE GAUCHE (Liste) */}
      <div className="w-full md:w-1/2 lg:w-[45%] h-full flex flex-col border-r border-surface-container-high/50 bg-card relative z-10">
        <div className="p-4 md:p-6 border-b border-surface-container-high/50 bg-card sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.push('/')} className="p-1 hover:bg-surface-container rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-on-surface-variant" />
            </button>
            <h1 className="text-xl font-bold">Trouver un artisan</h1>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
              <input
                type="text"
                placeholder="Chercher par métier (ex: Plombier)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-sm"
              />
            </div>
            <Button type="submit" className="h-11 px-5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover font-semibold text-sm">
              <Search size={16} className="mr-1.5" /> Chercher
            </Button>
          </form>
          {!isLoading && (
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>{data?.total ?? 0} artisans trouvés à {repere}</span>
              {iaUsed && (
                <div className="flex items-center gap-1 text-brand-ai bg-brand-ai/10 px-2 py-1 rounded-md">
                  <Sparkles size={12} /> Classement IA
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <motion.div key={`skel-${i}`} exit={{ opacity: 0 }} className="animate-pulse flex gap-4 p-5 bg-card rounded-2xl border border-surface-container-high h-36">
                  <div className="w-16 h-16 bg-surface-container rounded-full shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-surface-container rounded w-1/3" />
                    <div className="h-3 bg-surface-container rounded w-1/4" />
                    <div className="h-3 bg-surface-container rounded w-full mt-4" />
                  </div>
                </motion.div>
              ))
            ) : isError ? (
              <EmptyState icon="alert" title="Erreur de recherche" description="Impossible de contacter notre IA. Veuillez réessayer." actionLabel="Réessayer" onAction={() => window.location.reload()} />
            ) : artisans.length === 0 ? (
              <EmptyState icon="search" title="Aucun artisan trouvé" description={`Nous n'avons pas trouvé d'artisan correspondant à "${search || serviceId}" à ${repere}.`} actionLabel="Voir tous les artisans" onAction={() => router.push('/search?repere=Douala Centre')} />
            ) : (
              artisans.map((artisan, index) => (
                <motion.div key={artisan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
                  <ArtisanCard
                    id={artisan.id}
                    name={`${artisan.firstName} ${artisan.lastName}`}
                    specialty={artisan.skills?.[0]?.serviceName || 'Artisan'}
                    trustScore={Math.round((artisan.rating || 0) * 20)}
                    aiScore={artisan.aiScore || Math.round((artisan.rating || 0) * 20)}
                    aiExplanation="Correspondance basée sur votre localisation et le profil"
                    rating={artisan.rating || 0}
                    reviewsCount={artisan.totalJobs || 0}
                    location={`${repere}, Douala`}
                    responseTimeMin={30}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COLONNE DROITE (Carte) */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] h-full relative z-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-bg/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-sm font-medium text-on-surface-variant">Analyse IA en cours...</p>
            </div>
          </div>
        )}
        <MapContainer center={DOUALA} zoom={13} className="h-full w-full" ref={mapRef}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>
    </div>
  );
}