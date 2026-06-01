'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin, Briefcase, Clock, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/button';
import { LoadingScreen } from '../../components/shared/loading-screen';
import Link from 'next/link';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });

export default function ArtisanPublicProfile() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/users/${id}`);
        const data = await res.json();
        setArtisan(data?.data || data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (isLoading) return <LoadingScreen message="Chargement du profil..." />;
  if (!artisan) return <div className="text-center py-20"><p className="text-muted-foreground">Artisan introuvable</p><Link href="/"><Button variant="ghost" className="mt-4">Retour à l'accueil</Button></Link></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour</Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary font-bold text-3xl">
            {artisan.firstName?.[0]}{artisan.lastName?.[0]}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold">{artisan.firstName} {artisan.lastName}</h1>
              {artisan.isKycVerified && <ShieldCheck className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
              <span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {artisan.rating || '4.8'}</span>
              <span className="text-xs text-muted-foreground">{artisan.totalJobs || 15} missions</span>
              <span className="text-xs text-muted-foreground">{artisan.experienceYears || 10} ans d'exp.</span>
            </div>
            <div className="flex gap-3 mt-4 justify-center sm:justify-start">
              <Button size="sm"><MessageSquare className="h-4 w-4 mr-1.5" /> Contacter</Button>
              <Button variant="secondary" size="sm"><Phone className="h-4 w-4 mr-1.5" /> Appeler</Button>
            </div>
          </div>
        </motion.div>

        {/* Bio + Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bento-card"><h3 className="font-semibold mb-2">À propos</h3><p className="text-sm text-muted-foreground">{artisan.bio || 'Artisan professionnel basé à Douala.'}</p></div>
            <div className="bento-card">
              <h3 className="font-semibold mb-3">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {['Plomberie', 'Électricité'].map((s) => (
                  <span key={s} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/5 text-primary border border-primary/10">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bento-card p-4 h-[200px]">
              <MapContainer center={[4.0511, 9.7085]} zoom={14} className="h-full w-full rounded-xl" zoomControl={false} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[4.0511, 9.7085]} />
              </MapContainer>
            </div>
            <div className="bento-card grid grid-cols-2 gap-3">
              <div className="text-center p-2"><p className="text-lg font-bold text-green-600">Disponible</p><p className="text-xs text-muted-foreground">Statut</p></div>
              <div className="text-center p-2"><p className="text-lg font-bold">98%</p><p className="text-xs text-muted-foreground">Réponse</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}