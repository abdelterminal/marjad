import { getLocale } from 'next-intl/server';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Filters } from '@/components/product/Filters';
import { SortSelect } from '@/components/product/SortSelect';
import { Pagination } from '@/components/product/Pagination';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const category = sp.category ?? undefined;
  const minRaw = parseFloat(sp.min ?? '');
  const min = !isNaN(minRaw) ? Math.max(0, minRaw) : undefined;
  const maxRaw = parseFloat(sp.max ?? '');
  const max = !isNaN(maxRaw) ? Math.max(0, maxRaw) : undefined;
  const sort = (['newest', 'price_asc', 'price_desc'].includes(sp.sort ?? '')
    ? sp.sort
    : 'newest') as 'newest' | 'price_asc' | 'price_desc';
  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const pageSize = 12;

  const [{ items: products, total }, categories] = await Promise.all([
    listProducts({ category, min, max, sort, page, pageSize }),
    listCategories(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main>
      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/*
          Layout:
          - Mobile: toolbar (Filters button + sort + count), then grid
          - Desktop: sidebar (inside Filters) + toolbar + grid side by side
        */}

        {/* Mobile toolbar row — only visible below lg */}
        <div className="flex items-center justify-between gap-3 mb-4 lg:hidden border-b border-[var(--color-brand-border)] pb-4">
          {/* Filters mobile button + sheet */}
          <Filters
            categories={categories}
            currentCategory={category}
            currentMin={min}
            currentMax={max}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-brand-text-muted)]">
              {total > 0
                ? isAr
                  ? `${total} منتج`
                  : `${total} résultat${total > 1 ? 's' : ''}`
                : ''}
            </span>
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* Desktop layout: sidebar + content */}
        <div className="hidden lg:flex gap-8 items-start">
          {/* Desktop sidebar (rendered inside Filters) */}
          <Filters
            categories={categories}
            currentCategory={category}
            currentMin={min}
            currentMax={max}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-brand-border)]">
              <span className="text-xs text-[var(--color-brand-text-muted)]">
                {total > 0
                  ? isAr
                    ? `${total} منتج`
                    : `${total} résultat${total > 1 ? 's' : ''}`
                  : ''}
              </span>
              <SortSelect currentSort={sort} />
            </div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <p className="text-base text-[var(--color-brand-text-muted)]">
                  {isAr ? 'لا توجد منتجات لهذه الفلاتر.' : 'Aucun produit ne correspond à vos filtres.'}
                </p>
                <a
                  href={`/${locale}/products`}
                  className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  {isAr ? 'إعادة تعيين الفلاتر' : 'Réinitialiser les filtres'}
                </a>
              </div>
            ) : (
              <ProductGrid products={products} locale={locale} />
            )}
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>

        {/* Mobile content — below toolbar */}
        <div className="lg:hidden">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-base text-[var(--color-brand-text-muted)]">
                {isAr ? 'لا توجد منتجات لهذه الفلاتر.' : 'Aucun produit ne correspond à vos filtres.'}
              </p>
              <a
                href={`/${locale}/products`}
                className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline"
              >
                {isAr ? 'إعادة تعيين الفلاتر' : 'Réinitialiser les filtres'}
              </a>
            </div>
          ) : (
            <ProductGrid products={products} locale={locale} />
          )}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
