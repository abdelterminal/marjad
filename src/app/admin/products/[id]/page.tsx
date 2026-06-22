import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProductForm } from '@/components/admin/ProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ChevronLeft className="size-4" />
          Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
        <p className="mt-1 text-sm text-gray-500">{product.nameFr}</p>
      </div>

      <ProductForm
          product={{
            id: product.id,
            nameFr: product.nameFr,
            nameAr: product.nameAr,
            descriptionFr: product.descriptionFr,
            descriptionAr: product.descriptionAr,
            detailsFr: product.detailsFr,
            detailsAr: product.detailsAr,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            stock: product.stock,
            categoryId: product.categoryId,
            images: product.images ?? [],
            isPublished: product.isPublished,
            isFeatured: product.isFeatured,
          }}
        />
    </div>
  );
}
