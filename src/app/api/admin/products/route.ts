import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminProductSchema } from '@/lib/validators';
import { adminListProducts, createProduct, isProductSlugTaken } from '@/lib/queries/products';
import { slugify, ensureUniqueSlug } from '@/lib/slug';

// GET /api/admin/products?q=&page=
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const result = await adminListProducts(q, page);
  return NextResponse.json(result);
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Auto-generate unique slug from nameFr
  const base = slugify(data.nameFr);
  if (!base) {
    return NextResponse.json({ error: 'Le nom FR ne produit pas de slug valide.' }, { status: 422 });
  }
  const slug = await ensureUniqueSlug(base, isProductSlugTaken);

  const product = await createProduct({ ...data, slug });
  return NextResponse.json(product, { status: 201 });
}
