import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth-guards';

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
        <p className="mt-1 text-sm text-gray-500">Remplissez les informations ci-dessous pour créer une nouvelle fiche produit.</p>
      </div>

      <ProductForm />
    </div>
  );
}
