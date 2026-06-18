import { NextRequest, NextResponse } from 'next/server';
import { listProducts } from '@/lib/queries/products';
import { productsQuerySchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const parsed = productsQuerySchema.safeParse({
    category: searchParams.get('category') ?? undefined,
    min: searchParams.get('min') ?? undefined,
    max: searchParams.get('max') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres invalides', fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { category, min, max, sort, page, pageSize } = parsed.data;

  try {
    const { items, total } = await listProducts({ category, min, max, sort, page, pageSize });
    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
