// ===== Common / Reusable Types =====

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletable {
  deletedAt?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface DistanceResult {
  id: string;
  distanceKm: number;
}

// ===== Feature Types =====

export type Role = 'USER' | 'ARTISAN' | 'ADMIN';

export type Category =
  | 'ELECTRICIAN'
  | 'PLUMBER'
  | 'CARPENTER'
  | 'PAINTER'
  | 'MASON'
  | 'MECHANIC'
  | 'HAIRDRESSER'
  | 'TAILOR'
  | 'COOK'
  | 'CLEANER'
  | 'TECHNICIAN'
  | 'OTHER';

export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type MissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REVIEWED';

export type XPAction =
  | 'PROFILE_CREATED'
  | 'MISSION_ACCEPTED'
  | 'MISSION_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'BADGE_EARNED'
  | 'DAILY_LOGIN'
  | 'PROFILE_VERIFIED'
  | 'REFERRAL';

export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type NotificationType =
  | 'MISSION_REQUEST'
  | 'MISSION_ACCEPTED'
  | 'MISSION_COMPLETED'
  | 'NEW_REVIEW'
  | 'BADGE_EARNED'
  | 'LEVEL_UP'
  | 'SYSTEM';

// ===== User-Related Types =====

export interface UserBase {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanProfileBase {
  id: string;
  userId: string;
  businessName: string;
  category: Category;
  subCategory?: string;
  description?: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  yearsExperience: number;
  hourlyRate?: number;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalMissions: number;
  completedMissions: number;
  xp: number;
  level: number;
  isOnline: boolean;
  availability?: Record<string, [number, number]>;
  coverImageUrl?: string;
  portfolio?: Array<{ url: string; title: string; description?: string }>;
  skills?: string[];
  badges?: Array<{ name: string; icon: string; earnedAt: string }>;
}

// ===== Auth Types =====

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
  jti: string;
}

// ===== Mission Types =====

export interface MissionBase {
  id: string;
  jobId: string;
  artisanId: string;
  status: MissionStatus;
  price?: number;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobBase {
  id: string;
  title: string;
  description: string;
  category: Category;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

// ===== Review Types =====

export interface ReviewBase {
  id: string;
  missionId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ===== Notification Types =====

export interface NotificationBase {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ===== Gamification Types =====

export interface XPLogBase {
  id: string;
  userId: string;
  action: XPAction;
  points: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BadgeBase {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired: number;
  rarity: BadgeRarity;
}

// ===== ML / Recommendation Types =====

export interface RecommendationRequest {
  userId: string;
  jobCategory: Category;
  latitude: number;
  longitude: number;
  maxDistanceKm?: number;
  limit?: number;
}

export interface RecommendationResult {
  artisanId: string;
  businessName: string;
  score: number;
  rating: number;
  distanceKm: number;
  xp: number;
  level: number;
  category: Category;
  matchReasons: string[];
  hourlyRate?: number;
  thumbnailUrl?: string;
}

export interface RecommendationResponse {
  recommendations: RecommendationResult[];
}

// ===== Search / Filter Types =====

export interface SearchFilters {
  category?: Category;
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  isVerified?: boolean;
  isOnline?: boolean;
  skills?: string[];
  sortBy?: 'rating' | 'distance' | 'price' | 'xp' | 'reviews';
  sortOrder?: SortOrder;
}