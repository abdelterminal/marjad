import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

// ─── Page / Server Component guards (redirect on failure) ──────────────────────

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect('/');
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
      response: NextResponse.json({ error: 'Authentification requise.' }, { status: 401 }),
    } as const;
  }
  return { user: session.user, response: null } as const;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return {
      user: null,
      response: NextResponse.json({ error: 'Accès refusé.' }, { status: 403 }),
    } as const;
  }
  return { user: session.user, response: null } as const;
}
