import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil } from 'lucide-react';
import { adminListProducts } from '@/lib/queries/products';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';
import { Button } from '@/components/ui/button';
import { formatMAD } from '@/lib/money';
import { requireAdmin } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1') || 1);

  const { items: products, total } = await adminListProducts(q || undefined, page);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="mt-1 text-sm text-gray-500">{total} produit{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/admin/products/new" className="shrink-0">
          <Button>
            <Plus className="size-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <SearchInput placeholder="Rechercher un produit…" defaultValue={q} />
      </div>

      <DataTable
        headers={['Image', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions']}
      >
        {products.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
              {q ? `Aucun résultat pour "${q}"` : 'Aucun produit'}
            </td>
          </tr>
        ) : (
          products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {product.images && product.images.length > 0 ? (
                  <div className="relative size-8 overflow-hidden rounded">
                    <Image
                      src={product.images[0]}
                      alt={product.nameFr}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="size-8 rounded bg-gray-100" />
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{product.nameFr}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {product.category?.nameFr ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatMAD(parseFloat(product.price))}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{product.stock}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="size-3.5" />
                    </Button>
                  </Link>
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.nameFr}
                  />
                </div>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      <AdminPagination page={page} total={total} pageSize={24} />
    </div>
  );
}
