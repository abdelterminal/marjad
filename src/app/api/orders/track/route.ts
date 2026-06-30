import { NextRequest } from 'next/server';
import { trackOrder } from '@/lib/queries/orders';
import { trackOrderSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { noStoreJson, readJsonBody } from '@/lib/http';

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, {
    key: 'orders:track',
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const body = await readJsonBody(req, 8 * 1024);
  if (body.response) return body.response;

  const parsed = trackOrderSchema.safeParse(body.data);
  if (!parsed.success) {
    return noStoreJson(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const order = await trackOrder(parsed.data.orderId, parsed.data.phone);
    if (!order) {
      return noStoreJson({ error: 'Commande introuvable.' }, { status: 404 });
    }

    return noStoreJson(order);
  } catch (err) {
    console.error('[POST /api/orders/track]', err);
    return noStoreJson({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
