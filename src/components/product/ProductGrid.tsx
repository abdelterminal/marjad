import { ProductCard } from './ProductCard';

/* Hallmark · component: product grid · genre: luxury ecommerce · theme: custom/MARJAD
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */

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
  const isAr = locale === 'ar';

  if (products.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center border-y border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] px-4 py-16 text-center">
        <p className="mb-2 font-[var(--font-display)] text-xl font-semibold text-[var(--color-brand-text)]">
          {isAr ? 'لا توجد قطع مطابقة' : 'Aucune pièce trouvée'}
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
          {isAr
            ? 'جرّب إزالة بعض الفلاتر أو تعديل نطاق السعر لعرض خيارات أكثر.'
            : 'Essayez de retirer un filtre ou d’ajuster le prix pour retrouver plus de pièces.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
