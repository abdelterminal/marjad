import { ProductCard } from './ProductCard';

type ProductGridProduct = {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
  price: string;
  compareAtPrice?: string | null;
  images: string[] | null;
  stock: number;
  category?: {
    id: number;
    nameFr: string;
    nameAr: string;
    slug: string;
  } | null;
};

interface ProductGridProps {
  products: ProductGridProduct[];
  locale: string;
}

export function ProductGrid({ products, locale }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <p className="text-[var(--color-brand-text-muted)]">
          {locale === 'ar'
            ? 'لا توجد منتجات لهذه الفلاتر.'
            : 'Aucun produit ne correspond à vos filtres.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
