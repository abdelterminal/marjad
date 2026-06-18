import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminCategorySchema } from '@/lib/validators';
import { listCategories, createCategory, isCategorySlugTaken } from '@/lib/queries/categories';
import { slugify, ensureUniqueSlug } from '@/lib/slug';

// GET /api/admin/categories
export async function GET(_req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const items = await listCategories();
  return NextResponse.json(items);
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Generate slug: use provided or auto-generate from nameFr
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.nameFr);
  if (!baseSlug) {
    return NextResponse.json(
      { error: 'Le nom FR ne produit pas de slug valide.' },
      { status: 422 },
    );
  }
  const slug = await ensureUniqueSlug(baseSlug, isCategorySlugTaken);

  const category = await createCategory({ ...data, slug });
  return NextResponse.json(category, { status: 201 });
}
