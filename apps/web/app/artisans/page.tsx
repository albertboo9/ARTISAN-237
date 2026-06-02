'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/shared/page-transition';
import Button from '../components/ui/button';

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:3001/api/v1/artisans/map').then(r => r.json()).then(d => setArtisans(d?.data?.artisans || d?.artisans || [])).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center"><h1 className="text-3xl font-bold text-foreground">Nos Artisans</h1><p className="text-muted-foreground mt-2">Des professionnels qualifiés près de chez vous</p></div>
        <div className="relative max-w-md mx-auto"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rechercher un artisan..." /></div>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artisans.map((a: any, i: number) => (
            <StaggerItem key={a.id || i}>
              <Link href={`/artisan/${a.userId || a.id}`} className="block bento-card hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-sm', a.markerColor === 'green' ? 'bg-green-500' : a.markerColor === 'orange' ? 'bg-amber-500' : 'bg-gray-400')}>{a.firstName?.[0]}{a.lastName?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{a.firstName} {a.lastName}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{a.rating}</span>
                      {a.distance !== null && <span>{a.distance.toFixed(1)} km</span>}
                      {a.isKycVerified && <ShieldCheck className="h-3 w-3 text-primary" />}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}