import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CategoryForm } from '@/components/admin/CategoryForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) notFound();

  const category = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ChevronLeft className="size-4" />
          Retour aux catégories
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la catégorie</h1>
        <p className="mt-1 text-sm text-gray-500">{category.nameFr}</p>
      </div>

      <div className="max-w-[32rem] rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <CategoryForm
          category={{
            id: category.id,
            nameFr: category.nameFr,
            nameAr: category.nameAr,
            nameEn: category.nameEn,
            slug: category.slug,
          }}
        />
      </div>
    </div>
  );
}
