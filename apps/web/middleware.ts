/**
 * ARTISAN-237 — Middleware de Sécurité
 * 
 * Protège les routes selon le rôle utilisateur.
 * Le rôle est déterminé par le backend (JWT), jamais par l'utilisateur.
 * 
 * NE fait PAS de redirection depuis /login (le frontend gère ça avec router.push)
 * NE fait QUE bloquer les accès non autorisés.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/', '/search', '/artisans', '/artisan/', '/comment-ca-marche'];

const ROLE_ROUTES: Record<string, string[]> = {
  '/client': ['CLIENT'],
  '/artisan': ['ARTISAN'],
  '/admin': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // Routes publiques : toujours autorisées
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Routes protégées : nécessite un token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérification RBAC
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload?.role;

        if (role && allowedRoles.includes(role)) {
          return NextResponse.next();
        }

        // Role non autorisé → rediriger vers login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      } catch {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client/:path*', '/artisan/:path*', '/admin/:path*'],
};