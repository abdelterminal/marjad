import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

async function hasCurrentAdminRole(userId: string | undefined) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) return false;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { role: true },
  });

  return user?.role === 'admin';
}

// ─── Page / Server Component guards (redirect on failure) ──────────────────────

export async function requireUser(locale = 'fr') {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/account/login`);
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');
  if (!(await hasCurrentAdminRole(session.user.id))) redirect('/login');
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
  if (
    !session?.user ||
    session.user.role !== 'admin' ||
    !(await hasCurrentAdminRole(session.user.id))
  ) {
    return {
      user: null,
      response: noStoreError('Accès refusé.', 403),
    } as const;
  }
  return { user: session.user, response: null } as const;
}
