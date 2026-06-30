import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { createOrder, getUserOrders, StockError } from '@/lib/queries/orders';
import { createOrderSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { noStoreJson, readJsonBody } from '@/lib/http';
import { getExistingUserId, requireUserApi } from '@/lib/auth-guards';

// POST /api/orders — public (guests allowed); attach userId if session exists
export async function POST(req: NextRequest) {
  try {
    const limited = await checkRateLimit(req, {
      key: 'orders:create',
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const parsedBody = await readJsonBody(req, 32 * 1024);
    if (parsedBody.response) return parsedBody.response;

    const parsed = createOrderSchema.safeParse(parsedBody.data);
    if (!parsed.success) {
      return noStoreJson(
        { error: 'Données invalides', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id
      ? (await getExistingUserId(session.user.id)) ?? undefined
      : undefined;

    const orderData = parsed.data;
    const { orderId, total } = await createOrder({ ...orderData, userId });

    const res = noStoreJson({ orderId, total, status: 'pending' }, { status: 201 });
    // Proof-of-purchase cookie — lets the confirmation page verify the requester
    // placed this specific order. HttpOnly prevents JS access; expires after 2h.
    res.cookies.set(`marjad_conf_${orderId}`, '1', {
      httpOnly: true,
      maxAge: 7200,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return res;
  } catch (err) {
    if (err instanceof StockError) {
      return noStoreJson({ error: err.message }, { status: 409 });
    }
    console.error('[POST /api/orders]', err);
    return noStoreJson({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// GET /api/orders — requires session; returns own orders only
export async function GET(req: NextRequest) {
  const guard = await requireUserApi();
  if (guard.response) return guard.response;

  try {
    const userId = Number(guard.user.id);
    const requestedPage =
      Number.parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1;
    const userOrders = await getUserOrders(userId, requestedPage);
    return noStoreJson(userOrders);
  } catch {
    return noStoreJson({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
