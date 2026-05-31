"use strict";
// Shared utility functions - no external dependencies
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDistance = formatDistance;
exports.formatRating = formatRating;
exports.getInitials = getInitials;
exports.generateId = generateId;
exports.sanitizeHtml = sanitizeHtml;
exports.escapeRegExp = escapeRegExp;
exports.debounce = debounce;
exports.throttle = throttle;
exports.calculateDistance = calculateDistance;
exports.toGeoHash = toGeoHash;
exports.isValidEmail = isValidEmail;
exports.isValidPhone = isValidPhone;
exports.clamp = clamp;
exports.getXPProgress = getXPProgress;
function formatCurrency(amount, currency = 'XAF') {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}
function formatDistance(km) {
    if (km < 1)
        return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
}
function formatRating(rating) {
    return rating.toFixed(1);
}
function getInitials(firstName, lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    const { randomBytes } = require('crypto');
    return randomBytes(16).toString('hex');
}
function sanitizeHtml(html) {
    return html.replace(/<[^>]*>/g, '');
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
function throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toGeoHash(lat, lon, precision = 6) {
    const BITS = [16, 8, 4, 2, 1];
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEven = true;
    let latMin = -90, latMax = 90;
    let lonMin = -180, lonMax = 180;
    let bit = 0, ch = 0, hash = '';
    while (hash.length < precision) {
        if (isEven) {
            const mid = (lonMin + lonMax) / 2;
            if (lon > mid) {
                ch |= BITS[bit];
                lonMin = mid;
            }
            else {
                lonMax = mid;
            }
        }
        else {
            const mid = (latMin + latMax) / 2;
            if (lat > mid) {
                ch |= BITS[bit];
                latMin = mid;
            }
            else {
                latMax = mid;
            }
        }
        isEven = !isEven;
        if (bit < 4) {
            bit++;
        }
        else {
            hash += BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return hash;
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
    return /^(\+237|0)[0-9]{8,9}$/.test(phone.replace(/\s/g, ''));
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function getXPProgress(currentXP, level) {
    const currentLevelXP = Math.floor(100 * Math.pow(1.5, level - 1));
    const nextLevelXP = Math.floor(100 * Math.pow(1.5, level));
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return { currentLevelXP, nextLevelXP, progress: clamp(progress, 0, 100) };
}
//# sourceMappingURL=index.js.map