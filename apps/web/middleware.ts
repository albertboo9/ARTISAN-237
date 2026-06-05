/**
 * ARTISAN-237 — Middleware simplifié
 * 
 * La protection RBAC est gérée côté frontend (dans les layouts dashboard).
 * Ce middleware ne fait que rediriger les routes explicitement protégées
 * vers /login si aucun cookie de session n'est présent.
 * 
 * Le token JWT est stocké uniquement en localStorage (pas de cookie),
 * car les cookies peuvent altérer les caractères du JWT.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes qui nécessitent un cookie de session
  const protectedPrefixes = ['/client/', '/artisan/', '/admin/'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected) {
    // Vérifier la présence d'un cookie de session
    const hasSession = request.cookies.has('session');
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/artisan/:path*', '/admin/:path*'],
};