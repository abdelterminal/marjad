import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // ── Admin route protection at middleware level (defense layer 1) ─────────────
  // Both admin pages and admin API endpoints are blocked here for unauthenticated
  // / non-admin sessions. Each handler also calls requireAdminApi() (layer 2).
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const session = req.auth;
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // ── API routes pass through — next-intl must not localize them ──────────────
  // Without this, /api/auth/session gets redirected to /fr/api/auth/session
  // and NextAuth receives an HTML 404 instead of handling the request.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ── next-intl locale routing for all other requests ──────────────────────────
  return intlMiddleware(req as unknown as NextRequest);
});

export const config = {
  // Match everything except Next.js internals, Vercel internals, and static files.
  // Keep api/ in scope so the admin API guard above fires.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
