export interface ArtisanScore {
  artisanId: string;
  businessName: string;
  score: number;
  rating: number;
  distanceKm: number;
  xp: number;
  level: number;
  category: string;
  hourlyRate?: number;
  matchReasons: string[];
  thumbnailUrl?: string;
}

export interface RecommendationMetadata {
  algorithm: string;
  responseTimeMs: number;
  modelLoaded: boolean;
}

export interface RecommendationResponse {
  recommendations: ArtisanScore[];
  metadata: RecommendationMetadata;
}