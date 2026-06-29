import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminListOrders } from '@/lib/queries/orders';

// GET /api/admin/orders?status=&page=
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  // Validate status if provided
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Statut invalide.' },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  const result = await adminListOrders(status, page);
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
