'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, ChevronDown, Star, Clock, Navigation2 } from 'lucide-react';
import { Input } from '@artisan237/ui/components/ui/input';
import { Button } from '@artisan237/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@artisan237/ui/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@artisan237/ui/components/ui/select';
import { Slider } from '@artisan237/ui/components/ui/slider';
import { Badge } from '@artisan237/ui/components/ui/badge';
import { Skeleton } from '@artisan237/ui/components/ui/skeleton';
import { useToast } from '@artisan237/ui/components/ui/use-toast';
import { cn } from '@artisan237/ui';
import Link from 'next/link';

interface ArtisanCardProps {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  hourlyRate?: number;
  xp: number;
  level: number;
  isVerified: boolean;
  isOnline: boolean;
  thumbnailUrl?: string;
}

function ArtisanCard({
  id,
  businessName,
  category,
  rating,
  reviewCount,
  distanceKm,
  hourlyRate,
  xp,
  level,
  isVerified,
  isOnline,
  thumbnailUrl,
}: ArtisanCardProps) {
  const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=16a34a&color=fff&size=80`;

  return (
    <Link href={`/artisan/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        <div className="relative h-40 bg-gradient-to-br from-brand-500 to-brand-600">
          <img
            src={thumbnailUrl || placeholder}
            alt={businessName}
            className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-bold tracking-wider">
              {businessName.charAt(0)}
            </span>
          </div>
          {isOnline && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
          {isVerified && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              ✓ Vérifié
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{businessName}</h3>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{reviewCount} avis</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {distanceKm !== null && distanceKm !== undefined && (
              <span className="flex items-center gap-1">
                <Navigation2 className="h-4 w-4" />
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Niveau {level}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm font-medium text-brand-600">
              {hourlyRate ? `${hourlyRate.toLocaleString()} FCFA/h` : 'Sur devis'}
            </span>
            <Badge variant="secondary">XP: {xp.toLocaleString()}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 w-full rounded-none" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [category, setCategory] = useState<string | undefined>(
    searchParams.get('category') || undefined
  );
  const [sortBy, setSortBy] = useState('rating');
  const [radius, setRadius] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [openFilters, setOpenFilters] = useState(false);

  // Geolocation
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 4.0511, lng: 9.7679 }), // Douala fallback
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['artisans', category, sortBy, radius, minRating, location],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageSize: '20',
        sortBy,
        radius: radius.toString(),
        minRating: minRating.toString(),
        ...(category && { category }),
        ...(location && { lat: location.lat.toString(), lng: location.lng.toString() }),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/search?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erreur réseau' } }));
        throw new Error(err.error?.message || 'Erreur lors de la recherche');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!location,
  });

  const handleSearch = () => {
    refetch();
  };

  const searchPlaceholder = category
    ? `Rechercher un ${category.toLowerCase()}...`
    : 'Rechercher un artisan, service ou compétence...';

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground">Impossible de charger les artisans. Vérifiez votre connexion.</p>
        <Button onClick={() => refetch()} className="mt-4">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Trouvez votre{' '}
          <span className="text-brand-500">artisan de confiance</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Plus de 500 artisans qualifiés à Douala. Notés, vérifiés et recommandés par l'IA.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10 text-lg h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} size="lg" className="h-12 px-8">
            Chercher
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="ELECTRICIAN">⚡ Électricien</SelectItem>
              <SelectItem value="PLUMBER">🔧 Plombier</SelectItem>
              <SelectItem value="CARPENTER">🪚 Menuisier</SelectItem>
              <SelectItem value="PAINTER">🎨 Peintre</SelectItem>
              <SelectItem value="MASON">🏗️ Maçon</SelectItem>
              <SelectItem value="MECHANIC">🚗 Mécanicien</SelectItem>
              <SelectItem value="HAIRDRESSER">💇 Coiffeur</SelectItem>
              <SelectItem value="TAILOR">🧵 Tailleur</SelectItem>
              <SelectItem value="COOK">🍳 Cuisinier</SelectItem>
              <SelectItem value="CLEANER">🧹 Nettoyeur</SelectItem>
              <SelectItem value="TECHNICIAN">🔩 Technicien</SelectItem>
              <SelectItem value="OTHER">📦 Autre</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">⭐ Meilleure note</SelectItem>
              <SelectItem value="distance">📍 Plus proche</SelectItem>
              <SelectItem value="xp">🏆 Plus d'XP</SelectItem>
              <SelectItem value="reviews">💬 Plus d'avis</SelectItem>
              <SelectItem value="price">💰 Prix croissant</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={openFilters ? "default" : "outline"}
            onClick={() => setOpenFilters(!openFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres avancés
          </Button>
        </div>

        {/* Advanced Filters */}
        {openFilters && (
          <div className="mt-4 p-4 bg-muted rounded-lg border space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">Rayon :</span>
              <Slider
                min={1}
                max={100}
                step={5}
                value={[radius]}
                onValueChange={([v]) => setRadius(v)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16 text-right">{radius} km</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">Note min :</span>
              <Slider
                min={0}
                max={5}
                step={0.1}
                value={[minRating]}
                onValueChange={([v]) => setMinRating(v)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16 text-right">{minRating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </section>

      {/* Location Indicator */}
      {location && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Recherche autour de votre position actuelle
          <ChevronDown className="h-4 w-4" />
        </div>
      )}

      {/* Results */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {data?.meta?.total ?? 0} artisan{data?.meta?.total !== 1 ? 's' : ''} trouvé{data?.meta?.total !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-muted-foreground">
            {data?.meta?.page ?? 0}/{data?.meta?.totalPages ?? 0} pages
          </p>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Aucun artisan trouvé
            </h3>
            <p className="text-muted-foreground">
              Essayez d'élargir votre recherche ou de modifier les filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.map((artisan: any) => (
              <ArtisanCard key={artisan.id} {...artisan} />
            ))}
          </div>
        )}

        {/* Pagination would go here */}
      </section>
    </div>
  );
}