// Shared utility functions - no external dependencies

export function formatCurrency(amount: number, currency = 'XAF'): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const { randomBytes } = require('crypto');
  return randomBytes(16).toString('hex');
}

export function sanitizeHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function toGeoHash(
  lat: number,
  lon: number,
  precision: number = 6
): string {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let isEven = true;
  let latMin = -90,
    latMax = 90;
  let lonMin = -180,
    lonMax = 180;
  let bit = 0,
    ch = 0,
    hash = '';

  while (hash.length < precision) {
    if (isEven) {
      const mid = (lonMin + lonMax) / 2;
      if (lon > mid) {
        ch |= BITS[bit];
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        ch |= BITS[bit];
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^(\+237|0)[0-9]{8,9}$/.test(phone.replace(/\s/g, ''));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getXPProgress(currentXP: number, level: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevelXP = Math.floor(100 * Math.pow(1.5, level - 1));
  const nextLevelXP = Math.floor(100 * Math.pow(1.5, level));
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return { currentLevelXP, nextLevelXP, progress: clamp(progress, 0, 100) };
}