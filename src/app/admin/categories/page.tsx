import { Pencil } from 'lucide-react';
import { listCategories } from '@/lib/queries/categories';
import { DataTable } from '@/components/admin/DataTable';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { DeleteCategoryButton } from '@/components/admin/DeleteCategoryButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <p className="mt-1 text-sm text-gray-500">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Nouvelle catégorie</h2>
        <CategoryForm />
      </div>

      {/* Table */}
      <DataTable headers={['Nom (FR)', 'Nom (AR)', 'Nom (EN)', 'Slug', 'Actions']}>
        {categories.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
              Aucune catégorie
            </td>
          </tr>
        ) : (
          categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.nameFr}</td>
              <td className="px-4 py-3 text-sm text-gray-700" dir="rtl">{cat.nameAr}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{cat.nameEn}</td>
              <td className="px-4 py-3 text-sm font-mono text-gray-500">{cat.slug}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/categories/${cat.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="size-3.5" />
                    </Button>
                  </Link>
                  <DeleteCategoryButton categoryId={cat.id} categoryName={cat.nameFr} />
                </div>
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
