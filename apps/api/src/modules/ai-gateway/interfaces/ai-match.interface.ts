export interface AiClientRequest {
  description: string;
  urgency: string;
  quartier_code: string;
}

export interface AiAvailableArtisan {
  artisan_id: string;
  specialty: string;
  quartier_base: string;
  rating: number;
  total_jobs: number;
  avg_response_time_min: number;
  is_premium: boolean;
}

export interface AiMatchRequest {
  client_request: AiClientRequest;
  available_artisans: AiAvailableArtisan[];
}

export interface AiRecommendation {
  artisan_id: string;
  match_probability: number;
  rank: number;
}

export interface AiMatchResponse {
  recommendations: AiRecommendation[];
  model_version: string;
  processing_time_ms: number;
}
