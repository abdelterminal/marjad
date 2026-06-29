import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

const noStoreError = (error: string, status: 401 | 403) =>
  NextResponse.json(
    { error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  );

// ─── Page / Server Component guards (redirect on failure) ──────────────────────

export async function requireUser(locale = 'fr') {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/account/login`);
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');
  return session.user;
}

// ─── Route Handler guards (return Response on failure) ─────────────────────────

export async function requireUserApi() {
  const session = await auth();
  if (!session?.user) {
    return {
      user: null,
      response: noStoreError('Authentification requise.', 401),
    } as const;
  }
  return { user: session.user, response: null } as const;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return {
      user: null,
      response: noStoreError('Accès refusé.', 403),
    } as const;
  }
  return { user: session.user, response: null } as const;
}
