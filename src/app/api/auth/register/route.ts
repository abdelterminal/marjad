import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
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
      return NextResponse.json(
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

    return NextResponse.json({ id: newUser.id, email: newUser.email }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 },
    );
  }
}
