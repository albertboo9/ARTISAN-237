'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Search, SlidersHorizontal, Navigation, Star, ShieldCheck, MapPin, X } from 'lucide-react';
import Button from '../components/ui/button';
import { cn } from '../lib/cn';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false },
);

interface Artisan {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  lat: number;
  lng: number;
  isAvailable: boolean;
  isKycVerified: boolean;
  rating: number;
  totalJobs: number;
  experienceYears: number;
  markerColor: string;
  distance: number | null;
  skills: { serviceName: string; basePrice: string }[];
}

const DOUALA_CENTER: [number, number] = [4.0511, 9.7085];

export default function MarketplacePage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filteredArtisans, setFilteredArtisans] = useState<Artisan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(15);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<any>(null);

  // Fetch artisans
  useEffect(() => {
    async function fetchArtisans() {
      try {
        const res = await fetch('http://localhost:3001/api/v1/artisans/map');
        const data = await res.json();
        const list = data?.data?.artisans || data?.artisans || [];
        setArtisans(list);
        setFilteredArtisans(list);
      } catch (err) {
        console.error('Failed to fetch artisans:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArtisans();
  }, []);

  // Update filtered artisans when radius changes
  useEffect(() => {
    setFilteredArtisans(artisans);
  }, [artisans]);

  return (
    <div className="relative h-screen w-full">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-surface"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Recherche des artisans à proximité...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="absolute top-20 left-4 right-4 z-40 mx-auto max-w-2xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass rounded-2xl p-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un métier (plombier, électricien...)"
                className="w-full h-10 pl-10 pr-4 text-sm bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 h-10 rounded-xl text-sm font-medium transition-colors',
                showFilters ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-foreground hover:bg-surface-container-high',
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/50 mt-2 pt-3 pb-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Rayon : {searchRadius} km
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                        <span>1 km</span>
                        <span>50 km</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-sm cursor-pointer hover:bg-surface-container-high transition-colors">
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                        Disponibles uniquement
                      </label>
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-sm cursor-pointer hover:bg-surface-container-high transition-colors">
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                        KYC vérifié
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Map */}
      <div className="h-full w-full">
        <MapContainer
          center={DOUALA_CENTER}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredArtisans.map((artisan) => (
            <Marker
              key={artisan.id}
              position={[artisan.lat, artisan.lng]}
              eventHandlers={{
                click: () => setSelectedArtisan(artisan),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-foreground">{artisan.firstName} {artisan.lastName}</h3>
                  {artisan.bio && <p className="text-sm text-muted-foreground mt-1">{artisan.bio}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-amber-500">&#9733; {artisan.rating}</span>
                    <span className="text-xs text-muted-foreground">({artisan.totalJobs} missions)</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Floating Stats & Results */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-6 left-4 right-4 z-40 mx-auto max-w-sm"
      >
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {filteredArtisans.length} artisan{filteredArtisans.length > 1 ? 's' : ''} trouvé{filteredArtisans.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">Douala, Cameroun</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mapRef.current?.flyTo(DOUALA_CENTER, 13);
              }}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Mini artisan list */}
          <div className="mt-3 space-y-2 max-h-[120px] overflow-y-auto">
            {filteredArtisans.slice(0, 3).map((artisan) => (
              <button
                key={artisan.id}
                onClick={() => setSelectedArtisan(artisan)}
                className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-surface-container transition-colors"
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white',
                  artisan.markerColor === 'green' ? 'bg-green-500' :
                  artisan.markerColor === 'orange' ? 'bg-amber-500' : 'bg-gray-400',
                )}>
                  {artisan.firstName[0]}{artisan.lastName[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {artisan.firstName} {artisan.lastName}
                    </span>
                    {artisan.isKycVerified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {artisan.rating}
                    </span>
                    {artisan.distance !== null && (
                      <span>{artisan.distance.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Artisan Detail Modal */}
      <AnimatePresence>
        {selectedArtisan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedArtisan(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-border" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white',
                      selectedArtisan.markerColor === 'green' ? 'bg-green-500' :
                      selectedArtisan.markerColor === 'orange' ? 'bg-amber-500' : 'bg-gray-400',
                    )}>
                      {selectedArtisan.firstName[0]}{selectedArtisan.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {selectedArtisan.firstName} {selectedArtisan.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{selectedArtisan.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {selectedArtisan.totalJobs} missions
                        </span>
                        {selectedArtisan.isKycVerified && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Vérifié
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArtisan(null)}
                    className="p-1.5 rounded-xl hover:bg-surface-container text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedArtisan.bio && (
                  <p className="mt-4 text-sm text-muted-foreground">{selectedArtisan.bio}</p>
                )}

                {/* Skills */}
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Compétences
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtisan.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/5 text-primary border border-primary/10"
                      >
                        {skill.serviceName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container text-center">
                    <p className="text-lg font-semibold text-foreground">{selectedArtisan.experienceYears}+</p>
                    <p className="text-xs text-muted-foreground">Ans d'exp.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container text-center">
                    <p className="text-lg font-semibold text-foreground">{selectedArtisan.totalJobs}</p>
                    <p className="text-xs text-muted-foreground">Missions</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container text-center">
                    <p className="text-lg font-semibold text-foreground">
                      {selectedArtisan.isAvailable ? (
                        <span className="text-green-500">Disponible</span>
                      ) : (
                        <span className="text-muted-foreground">Occupé</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Statut</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1" size="lg">
                    Contacter
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1">
                    Voir le profil
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}