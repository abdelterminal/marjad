import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { orderStatusSchema } from '@/lib/validators';
import { getOrderById, updateOrderStatus, InvalidTransitionError } from '@/lib/queries/orders';

const noStoreJson = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });

// GET /api/admin/orders/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return noStoreJson({ error: 'ID invalide.' }, 400);
  }

  const order = await getOrderById(id);
  if (!order) {
    return noStoreJson({ error: 'Commande introuvable.' }, 404);
  }

  return noStoreJson(order);
}

// PATCH /api/admin/orders/[id]  — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return noStoreJson({ error: 'ID invalide.' }, 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noStoreJson({ error: 'Corps JSON invalide.' }, 400);
  }

  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return noStoreJson(
      { error: 'Statut invalide.', fields: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  try {
    const order = await updateOrderStatus(id, parsed.data.status);
    return noStoreJson(order);
  } catch (err) {
    if (err instanceof InvalidTransitionError) {
      return noStoreJson({ error: err.message }, 422);
    }
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message.includes('introuvable')) {
      return noStoreJson({ error: message }, 404);
    }
    console.error('[admin/orders] Failed to update order status:', err);
    return noStoreJson({ error: 'Erreur interne.' }, 500);
  }
}
