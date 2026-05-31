export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'client' | 'artisan' | 'admin';
  photoURL?: string;
  createdAt: Date;
}

export interface Artisan extends User {
  specialty: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  experiencePoints: number;
  level: 'Beginner' | 'Intermediate' | 'Professional' | 'Elite';
  bio: string;
}

export interface RecommendationResponse {
  artisanId: string;
  name: string;
  score: number;
  reason: string;
}
