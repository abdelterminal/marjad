import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { cache } from 'react';

const noStoreError = (error: string, status: 401 | 403) =>
  NextResponse.json(
    { error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  );

async function getCurrentUser(userId: string | undefined) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) return null;

  return db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, role: true },
  });
}

export async function getExistingUserId(userId: string | undefined) {
  return (await getCurrentUser(userId))?.id ?? null;
}

// ─── Page / Server Component guards (redirect on failure) ──────────────────────

export async function requireUser(locale = 'fr') {
  const session = await auth();
  if (!session?.user || !(await getExistingUserId(session.user.id))) {
    redirect(`/${locale}/account/login`);
  }
  return session.user;
}

export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');
  const currentUser = await getCurrentUser(session.user.id);
  if (currentUser?.role !== 'admin') redirect('/login');
  return session.user;
});

// ─── Route Handler guards (return Response on failure) ─────────────────────────

export async function requireUserApi() {
  const session = await auth();
  if (!session?.user || !(await getExistingUserId(session.user.id))) {
    return {
      user: null,
      response: noStoreError('Authentification requise.', 401),
    } as const;
  }
  return { user: session.user, response: null } as const;
}

export async function requireAdminApi() {
  const session = await auth();
  const currentUser =
    session?.user?.role === 'admin' ? await getCurrentUser(session.user.id) : null;
  if (
    !session?.user ||
    session.user.role !== 'admin' ||
    currentUser?.role !== 'admin'
  ) {
    return {
      user: null,
      response: noStoreError('Accès refusé.', 403),
    } as const;
  }
  return { user: session.user, response: null } as const;
}
