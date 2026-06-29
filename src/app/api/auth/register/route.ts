import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { noStoreJson } from '@/lib/http';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, {
    key: 'auth:register',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noStoreJson({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  try {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return noStoreJson(
        { error: 'Données invalides', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Check email uniqueness — generic message to avoid user enumeration
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return noStoreJson(
        { error: 'Impossible de créer le compte avec ces informations.' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: 'customer',
      })
      .returning({ id: users.id, email: users.email });

    return noStoreJson({ id: newUser.id, email: newUser.email }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return noStoreJson(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 },
    );
  }
}
