import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminCategorySchema } from '@/lib/validators';
import { updateCategory, deleteCategory } from '@/lib/queries/categories';
import { slugify } from '@/lib/slug';

// PATCH /api/admin/categories/[id]
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

  const parsed = adminCategorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Re-slugify if slug was provided in the update
  if (data.slug !== undefined) {
    data.slug = slugify(data.slug);
  }

  try {
    const category = await updateCategory(id, data);
    return NextResponse.json(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message.includes('introuvable')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
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
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message === 'CATEGORY_HAS_PRODUCTS') {
      return NextResponse.json(
        { error: 'Cette catégorie contient des produits et ne peut pas être supprimée.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
