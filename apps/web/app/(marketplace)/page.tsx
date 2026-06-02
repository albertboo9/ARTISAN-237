'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Search, SlidersHorizontal, Navigation, Star, ShieldCheck, MapPin, X } from 'lucide-react';
import Button from '../components/ui/button';
import { cn } from '../lib/cn';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const ZoomControl = dynamic(() => import('react-leaflet').then(m => m.ZoomControl), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const DOUALA_CENTER: [number, number] = [4.0511, 9.7085];

export default function MarketplacePage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [radius, setRadius] = useState(15);
  const [availOnly, setAvailOnly] = useState(false);
  const mapRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/artisans/map`)
      .then(r => r.json())
      .then(d => {
        const list = d?.data?.artisans || d?.artisans || [];
        setArtisans(list);
        setFiltered(list);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [mounted]);

  useEffect(() => {
    let result = [...artisans];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a: any) => (a.firstName + ' ' + a.lastName).toLowerCase().includes(q) || (a.bio || '').toLowerCase().includes(q));
    }
    if (availOnly) result = result.filter((a: any) => a.isAvailable);
    setFiltered(result);
  }, [search, availOnly, artisans]);

  if (!mounted) return <div className="h-screen bg-surface" />;

  return (
    <div className="relative h-screen w-full">
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Recherche des artisans...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-40 mx-auto max-w-xl">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass rounded-2xl p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Rechercher un métier, un artisan..." className="w-full h-10 pl-10 pr-4 text-sm bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={cn('flex items-center gap-2 px-3 h-10 rounded-xl text-sm font-medium transition-colors', showFilters ? 'bg-primary text-white' : 'bg-surface-container text-foreground hover:bg-surface-container-high')}>
              <SlidersHorizontal className="h-4 w-4" /><span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="border-t border-border/50 mt-2 pt-3 pb-1 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Rayon : {radius} km</label>
                    <input type="range" min={1} max={50} value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full h-1.5 bg-surface-container rounded-full appearance-none accent-primary" />
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} className="rounded border-border text-primary" /> Disponibles uniquement</label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Map */}
      <div className="h-full w-full">
        <MapContainer center={DOUALA_CENTER} zoom={13} className="h-full w-full" zoomControl={false} ref={mapRef}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />
          {filtered.map((a: any) => (
            <Marker key={a.id || a.userId} position={[a.lat, a.lng]} eventHandlers={{ click: () => setSelected(a) }}>
              <Popup><div className="p-1 min-w-[160px]"><h3 className="font-semibold text-sm">{a.firstName} {a.lastName}</h3><p className="text-xs text-muted-foreground mt-0.5">{a.bio || ''}</p><div className="flex items-center gap-2 mt-1.5 text-xs"><span className="text-amber-500">&#9733; {a.rating}</span><span className="text-muted-foreground">({a.totalJobs})</span></div></div></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom bar */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-4 left-4 right-4 z-40 mx-auto max-w-sm">
        <div className="glass rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
              <div><p className="text-sm font-medium text-foreground">{filtered.length} artisan{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p><p className="text-xs text-muted-foreground">Douala, Cameroun</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => mapRef.current?.flyTo?.(DOUALA_CENTER, 13)}><Navigation className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {filtered.slice(0, 3).map((a: any, i: number) => (
              <button key={a.id || i} onClick={() => setSelected(a)} className="flex w-full items-center gap-3 p-1.5 rounded-xl hover:bg-surface-container transition-colors">
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white', a.markerColor === 'green' ? 'bg-green-500' : a.markerColor === 'orange' ? 'bg-amber-500' : 'bg-gray-400')}>{a.firstName?.[0]}{a.lastName?.[0]}</div>
                <div className="flex-1 text-left"><span className="text-sm font-medium">{a.firstName} {a.lastName}</span><div className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{a.rating}{a.distance != null && <span> · {a.distance.toFixed(1)} km</span>}</div></div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-center pt-2 sm:hidden"><div className="h-1.5 w-12 rounded-full bg-border" /></div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white', selected.markerColor === 'green' ? 'bg-green-500' : selected.markerColor === 'orange' ? 'bg-amber-500' : 'bg-gray-400')}>{selected.firstName?.[0]}{selected.lastName?.[0]}</div>
                    <div><h3 className="text-lg font-semibold">{selected.firstName} {selected.lastName}</h3><div className="flex items-center gap-2 mt-0.5"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{selected.rating}</span><span className="text-xs text-muted-foreground">{selected.totalJobs} missions</span>{selected.isKycVerified && <ShieldCheck className="h-4 w-4 text-primary" />}</div></div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl hover:bg-surface-container"><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                {selected.bio && <p className="mt-4 text-sm text-muted-foreground">{selected.bio}</p>}
                <div className="mt-4 flex gap-3"><Button className="flex-1" size="lg">Contacter</Button><Button variant="secondary" size="lg" className="flex-1">Voir le profil</Button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}