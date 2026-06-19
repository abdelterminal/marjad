import { NextRequest, NextResponse } from 'next/server';
import { trackOrder } from '@/lib/queries/orders';
import { trackOrderSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, {
    key: 'orders:track',
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = trackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const order = await trackOrder(parsed.data.orderId, parsed.data.phone);
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('[POST /api/orders/track]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
