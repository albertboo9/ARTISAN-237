/**
 * ARTISAN-237 — Middleware UI uniquement
 * 
 * Ce middleware ne fait PAS de vérification de cookie (le JWT est en localStorage).
 * La protection RBAC est gérée côté client par ProtectedRoute + useAuthStore.
 * 
 * Ce middleware sert uniquement à des transformations d'URL mineures,
 * pour ne pas interférer avec les redirections SSR.
 * 
 * PAS de matcher — le middleware ne s'exécute sur AUCUNE route.
 * Tout est géré côté client.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
