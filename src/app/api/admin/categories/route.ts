import { NextRequest } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminCategorySchema } from '@/lib/validators';
import { listCategories, createCategory, isCategorySlugTaken } from '@/lib/queries/categories';
import { slugify, ensureUniqueSlug } from '@/lib/slug';
import { noStoreJson, readJsonBody } from '@/lib/http';

// GET /api/admin/categories
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const items = await listCategories();
  return noStoreJson(items);
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const body = await readJsonBody(req, 32 * 1024);
  if (body.response) return body.response;

  const parsed = adminCategorySchema.safeParse(body.data);
  if (!parsed.success) {
    return noStoreJson(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Generate slug: use provided or auto-generate from nameFr
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.nameFr);
  if (!baseSlug) {
    return noStoreJson(
      { error: 'Le nom FR ne produit pas de slug valide.' },
      { status: 422 },
    );
  }
  const slug = await ensureUniqueSlug(baseSlug, isCategorySlugTaken);

  const category = await createCategory({ ...data, slug });
  return noStoreJson(category, { status: 201 });
}
