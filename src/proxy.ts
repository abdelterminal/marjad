import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // ── Admin route protection at middleware level (defense layer 1) ─────────────
  if (pathname.startsWith('/admin')) {
    const session = req.auth;
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // ── Pass through: API, admin, login, static assets ──────────────────────────
  // next-intl must NOT localize these paths.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── next-intl locale routing for storefront pages ───────────────────────────
  return intlMiddleware(req as unknown as NextRequest);
});

export const config = {
  // Match everything except Next.js internals, Vercel internals, and static files.
  // Keep protected APIs in scope; health monitoring does not need an auth session.
  matcher: ['/((?!api/health(?:/|$)|_next|_vercel|.*\\..*).*)'],
};
