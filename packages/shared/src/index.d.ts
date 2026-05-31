export declare function formatCurrency(amount: number, currency?: string): string;
export declare function formatDistance(km: number): string;
export declare function formatRating(rating: number): string;
export declare function getInitials(firstName: string, lastName: string): string;
export declare function generateId(): string;
export declare function sanitizeHtml(html: string): string;
export declare function escapeRegExp(str: string): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
export declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function toGeoHash(lat: number, lon: number, precision?: number): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidPhone(phone: string): boolean;
export declare function clamp(value: number, min: number, max: number): number;
export declare function getXPProgress(currentXP: number, level: number): {
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
};
//# sourceMappingURL=index.d.ts.map