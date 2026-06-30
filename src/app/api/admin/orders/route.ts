import { NextRequest } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminListOrders } from '@/lib/queries/orders';
import { adminOrderListQuerySchema } from '@/lib/validators';
import { noStoreJson } from '@/lib/http';

// GET /api/admin/orders?status=&page=
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const query = adminOrderListQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  });
  if (!query.success) {
    return noStoreJson(
      { error: 'Paramètres invalides.', fields: query.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await adminListOrders(query.data.status, query.data.page);
  return noStoreJson(result);
}
