/**
 * ARTISAN-237 — Middleware de Sécurité
 * 
 * Protège les routes selon le rôle utilisateur.
 * Le rôle est déterminé par le backend (JWT), jamais par l'utilisateur.
 * 
 * - Aucun paramètre "role" dans l'URL
 * - Aucun toggle sur la page de login/register
 * - Le backend seul décide du rôle via les credentials
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (pas de token requis)
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/', '/search', '/artisans', '/artisan/', '/comment-ca-marche'];

// Routes protégées par rôle
const ROLE_ROUTES: Record<string, string[]> = {
  '/client': ['CLIENT'],
  '/artisan/dashboard': ['ARTISAN'],
  '/admin': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value || null;

  // Routes publiques : laisser passer
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    // Si l'utilisateur est déjà connecté et va sur login/register, rediriger vers son dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return redirectToDashboard(request, token);
    }
    return NextResponse.next();
  }

  // Routes protégées : nécessite un token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérification RBAC basée sur le rôle encodé dans le token
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      return checkRole(request, token, allowedRoles);
    }
  }

  // Par défaut, routes protégées sans restriction de rôle spécifique (dashboard générique)
  return NextResponse.next();
}

function redirectToDashboard(request: NextRequest, token: string): NextResponse {
  try {
    // Décoder le payload JWT (sans vérifier la signature — le backend le fait)
    const payload = decodeJwtPayload(token);
    const role = payload?.role || 'CLIENT';

    const redirectMap: Record<string, string> = {
      ADMIN: '/admin',
      ARTISAN: '/artisan',
      CLIENT: '/client',
    };

    const destination = redirectMap[role] || '/client';
    return NextResponse.redirect(new URL(destination, request.url));
  } catch {
    return NextResponse.next(); // Si erreur de décodage, laisser passer vers login
  }
}

function checkRole(request: NextRequest, token: string, allowedRoles: string[]): NextResponse {
  try {
    const payload = decodeJwtPayload(token);
    const role = payload?.role;

    if (role && allowedRoles.includes(role)) {
      return NextResponse.next();
    }

    // Rôle non autorisé → rediriger vers son propre dashboard
    return redirectToDashboard(request, token);
  } catch {
    // Token invalide → déconnexion
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    '/client/:path*',
    '/artisan/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};