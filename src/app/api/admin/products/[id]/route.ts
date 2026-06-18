import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminProductSchema } from '@/lib/validators';
import { updateProduct, deleteProduct } from '@/lib/queries/products';

// PATCH /api/admin/products/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  // Partial validation — allow any subset of product fields
  const parsed = adminProductSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const product = await updateProduct(id, parsed.data);
    return NextResponse.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message.includes('introuvable')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
  }

  try {
    await deleteProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message === 'PRODUCT_HAS_ORDERS') {
      return NextResponse.json(
        { error: 'Ce produit est référencé par des commandes et ne peut pas être supprimé.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
