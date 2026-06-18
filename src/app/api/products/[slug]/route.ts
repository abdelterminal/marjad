import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/queries/products';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
