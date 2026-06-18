import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { getDashboardStats } from '@/lib/queries/orders';

// GET /api/admin/dashboard
export async function GET(_req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
