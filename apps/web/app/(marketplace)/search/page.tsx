"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Search, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';
import { ArtisanCard } from '../../components/artisan/ArtisanCard';
import Button from '../../components/ui/button';
import 'leaflet/dist/leaflet.css';

// Lazy load Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const DOUALA: [number, number] = [4.0511, 9.7085];

// MOCK DATA en attendant l'API IA
const MOCK_ARTISANS = [
  {
    id: "art_1",
    name: "Jean-Paul Etoa",
    specialty: "Plombier Expert",
    trustScore: 98,
    aiScore: 95,
    aiExplanation: "Idéal : Artisan certifié à moins de 2km avec un temps de réponse moyen de 10 min.",
    rating: 4.8,
    reviewsCount: 124,
    location: "Akwa, Douala",
    responseTimeMin: 10,
    lat: 4.0435,
    lng: 9.6990
  },
  {
    id: "art_2",
    name: "Cédric Nguema",
    specialty: "Électricien Bâtiment",
    trustScore: 85,
    aiScore: 82,
    aiExplanation: "Très bon match : Bonne réputation, mais distance un peu plus élevée.",
    rating: 4.5,
    reviewsCount: 56,
    location: "Bonanjo, Douala",
    responseTimeMin: 25,
    lat: 4.0321,
    lng: 9.6892
  },
  {
    id: "art_3",
    name: "Marcelle Tchuente",
    specialty: "Peintre Décoratrice",
    trustScore: 92,
    aiScore: 88,
    aiExplanation: "Match solide : Excellente qualité de service confirmée par 80 avis.",
    rating: 4.9,
    reviewsCount: 80,
    location: "Deido, Douala",
    responseTimeMin: 15,
    lat: 4.0620,
    lng: 9.7150
  }
];

export default function SearchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      });
    }
    setMounted(true);
    // Simulation API IA
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  if (!mounted) return <div className="h-screen bg-brand-bg" />;

  return (
    <div className="flex flex-col md:flex-row h-screen pt-16 bg-brand-bg overflow-hidden">
      
      {/* COLONNE GAUCHE (Liste) */}
      <div className="w-full md:w-1/2 lg:w-[45%] h-full flex flex-col border-r border-border/50 bg-brand-surface relative z-10">
        <div className="p-4 md:p-6 border-b border-border/50 bg-card sticky top-0 z-20">
          <h1 className="text-2xl font-bold mb-4">Trouver un artisan</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
              <input 
                type="text" 
                placeholder="Plombier à Akwa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container border-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-sm"
              />
            </div>
            <Button variant="outline" className="h-10 px-3 rounded-lg border-surface-container-high hover:bg-surface-container">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span>{MOCK_ARTISANS.length} artisans recommandés par l'IA</span>
            <div className="flex items-center gap-1 text-brand-ai bg-brand-ai/10 px-2 py-1 rounded-md">
              <Sparkles size={12} /> Tri intelligent actif
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence>
            {isLoading ? (
              // Shimmer Effect Skeletons
              [1, 2, 3].map((i) => (
                <motion.div key={`skel-${i}`} exit={{ opacity: 0 }} className="bento-card animate-pulse flex gap-4 h-36">
                  <div className="w-20 h-20 bg-surface-container rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-surface-container rounded w-1/3"></div>
                    <div className="h-3 bg-surface-container rounded w-1/4"></div>
                    <div className="h-3 bg-surface-container rounded w-full mt-4"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              MOCK_ARTISANS.map((artisan, index) => (
                <motion.div
                  key={artisan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ArtisanCard {...artisan} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* COLONNE DROITE (Map) */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] h-full relative z-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-surface/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          </div>
        )}
        <MapContainer center={DOUALA} zoom={13} className="h-full w-full" ref={mapRef}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!isLoading && MOCK_ARTISANS.map((a) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let icon: any = undefined;
            if (typeof window !== 'undefined') {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const L = require('leaflet');
              const html = `
                <div class="relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-brand-primary text-white font-bold overflow-hidden transition-transform hover:scale-110 hover:-translate-y-1">
                  ${a.name[0]}
                  <div class="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              `;
              icon = L.divIcon({ html, className: 'custom-leaflet-marker', iconSize: [40, 40], iconAnchor: [20, 40] });
            }
            return (
              <Marker key={a.id} position={[a.lat, a.lng]} icon={icon}>
                <Popup>
                  <div className="p-1 min-w-[150px] font-sans">
                    <h3 className="font-semibold text-sm mb-1 text-on-surface">${a.name}</h3>
                    <p className="text-xs font-medium text-brand-primary">${a.specialty}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                      <span className="text-brand-ai bg-brand-ai/10 px-1.5 py-0.5 rounded">Match ${a.aiScore}%</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
