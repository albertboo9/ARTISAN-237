import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, ChevronRight } from "lucide-react";
import { AIBadge } from "./AIBadge";
import { TrustBadge } from "./TrustBadge";

interface ArtisanCardProps {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
  trustScore: number;
  aiScore: number;
  aiExplanation?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  responseTimeMin: number;
}

export function ArtisanCard({
  id,
  name,
  specialty,
  avatarUrl = "/images/default-avatar.jpg",
  trustScore,
  aiScore,
  aiExplanation,
  rating,
  reviewsCount,
  location,
  responseTimeMin,
}: ArtisanCardProps) {
  return (
    <Link href={`/artisan/${id}`} className="block group">
      <div className="bento-card relative overflow-hidden flex flex-col md:flex-row gap-5">
        {/* Ligne verticale subtile au hover pour le feedback interactif */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

        {/* Section Gauche : Avatar et Badges */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-surface-container-high group-hover:border-brand-primary transition-colors">
            {/* Fallback en attendant d'avoir des images réelles */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high to-surface-dim flex items-center justify-center text-on-surface-variant font-bold text-xl">
              {name.charAt(0)}
            </div>
            {/* L'image réelle viendra se superposer ici si elle existe */}
            {avatarUrl !== "/images/default-avatar.jpg" && (
               <Image src={avatarUrl} alt={name} fill className="object-cover" />
            )}
          </div>
          <TrustBadge score={trustScore} />
        </div>

        {/* Section Centrale : Informations */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-lg text-on-surface group-hover:text-brand-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium">{specialty}</p>
            </div>
            <AIBadge score={aiScore} explanation={aiExplanation} />
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-on-surface">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewsCount} avis)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-muted-foreground" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-muted-foreground" />
              <span>~ {responseTimeMin} min</span>
            </div>
          </div>
        </div>

        {/* Section Droite : CTA */}
        <div className="flex items-center justify-end md:justify-center md:pl-4 md:border-l border-border/50">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-brand-primary group-hover:text-on-primary transition-colors text-on-surface-variant">
             <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
