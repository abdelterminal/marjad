import { NextRequest } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminProductListQuerySchema, adminProductSchema } from '@/lib/validators';
import { adminListProducts, createProduct, isProductSlugTaken } from '@/lib/queries/products';
import { slugify, ensureUniqueSlug } from '@/lib/slug';
import { noStoreJson, readJsonBody } from '@/lib/http';

// GET /api/admin/products?q=&page=
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const query = adminProductListQuerySchema.safeParse({
    q: searchParams.get('q') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  });
  if (!query.success) {
    return noStoreJson(
      { error: 'Paramètres invalides.', fields: query.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await adminListProducts(query.data.q, query.data.page);
  return noStoreJson(result);
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const body = await readJsonBody(req, 192 * 1024);
  if (body.response) return body.response;

  const parsed = adminProductSchema.safeParse(body.data);
  if (!parsed.success) {
    return noStoreJson(
      { error: 'Données invalides.', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Auto-generate unique slug from nameFr
  const base = slugify(data.nameFr);
  if (!base) {
    return noStoreJson({ error: 'Le nom FR ne produit pas de slug valide.' }, { status: 422 });
  }
  const slug = await ensureUniqueSlug(base, isProductSlugTaken);

  const product = await createProduct({ ...data, slug });
  return noStoreJson(product, { status: 201 });
}
