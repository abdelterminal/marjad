import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createOrder, getUserOrders, StockError } from '@/lib/queries/orders';
import { createOrderSchema } from '@/lib/validators';

// POST /api/orders — public (guests allowed); attach userId if session exists
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : undefined;

    const { orderId, total } = await createOrder({ ...parsed.data, userId });

    const res = NextResponse.json({ orderId, total, status: 'pending' }, { status: 201 });
    // Proof-of-purchase cookie — lets the confirmation page verify the requester
    // placed this specific order. HttpOnly prevents JS access; expires after 2h.
    res.cookies.set(`marjad_conf_${orderId}`, '1', {
      httpOnly: true,
      maxAge: 7200,
      sameSite: 'lax',
      path: '/',
    });
    return res;
  } catch (err) {
    if (err instanceof StockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// GET /api/orders — requires session; returns own orders only
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id, 10);
    const userOrders = await getUserOrders(userId);
    return NextResponse.json(userOrders);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
