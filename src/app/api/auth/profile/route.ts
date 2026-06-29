import { NextRequest } from 'next/server';
import { requireUserApi } from '@/lib/auth-guards';
import { profileUpdateSchema } from '@/lib/validators';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { noStoreJson } from '@/lib/http';

// PATCH /api/auth/profile — update the logged-in user's name and/or phone
export async function PATCH(req: NextRequest) {
  const guard = await requireUserApi();
  if (guard.response) {
    guard.response.headers.set('Cache-Control', 'no-store');
    return guard.response;
  }

  const userId = Number(guard.user.id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noStoreJson({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return noStoreJson(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, phone } = parsed.data;

  // Nothing to update
  if (!name && !phone) {
    return noStoreJson({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
    })
    .where(eq(users.id, userId))
    .returning({ name: users.name, phone: users.phone });

  if (!updated) {
    return noStoreJson({ error: 'Utilisateur introuvable.' }, { status: 404 });
  }

  return noStoreJson({ name: updated.name, phone: updated.phone });
}
