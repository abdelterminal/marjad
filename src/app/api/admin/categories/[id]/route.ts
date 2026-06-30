import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminCategorySchema } from '@/lib/validators';
import { updateCategory, deleteCategory } from '@/lib/queries/categories';
import { slugify } from '@/lib/slug';
import { noStoreJson, readJsonBody } from '@/lib/http';

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
    return noStoreJson({ error: 'ID invalide.' }, { status: 400 });
  }

  const body = await readJsonBody(req, 32 * 1024);
  if (body.response) return body.response;

  const parsed = adminCategorySchema.partial().safeParse(body.data);
  if (!parsed.success) {
    return noStoreJson(
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
    return noStoreJson(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message.includes('introuvable')) {
      return noStoreJson({ error: message }, { status: 404 });
    }
    console.error('[admin/categories] Failed to update category:', err);
    return noStoreJson({ error: 'Erreur interne.' }, { status: 500 });
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
    return noStoreJson({ error: 'ID invalide.' }, { status: 400 });
  }

  try {
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne.';
    if (message === 'CATEGORY_HAS_PRODUCTS') {
      return noStoreJson(
        { error: 'Cette catégorie contient des produits et ne peut pas être supprimée.' },
        { status: 409 },
      );
    }
    console.error('[admin/categories] Failed to delete category:', err);
    return noStoreJson({ error: 'Erreur interne.' }, { status: 500 });
  }
}
