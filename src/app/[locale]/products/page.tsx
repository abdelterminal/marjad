import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Filters } from '@/components/product/Filters';
import { SortSelect } from '@/components/product/SortSelect';
import { Pagination } from '@/components/product/Pagination';
import { ProductSearch } from '@/components/product/ProductSearch';
import { Headphones, PackageCheck, SearchX, ShieldCheck, Truck } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const isAr = locale === 'ar';

  let categoryName: string | null = null;
  if (sp.category) {
    const categories = await listCategories();
    const category = categories.find((cat) => cat.slug === sp.category);
    categoryName = category ? (isAr ? category.nameAr : category.nameFr) : null;
  }

  const title = categoryName
    ? isAr
      ? `${categoryName} — مجموعة مرجاد`
      : `${categoryName} — Collection MARJAD`
    : isAr
      ? 'مجموعة الديكور المغربي'
      : 'Collection décoration marocaine';

  const description = isAr
    ? 'تصفح مجموعة مرجاد من قطع الديكور المغربي مع الدفع عند الاستلام والتوصيل داخل المغرب.'
    : 'Parcourez la collection MARJAD: tableaux, lampes, tables et objets décoratifs marocains avec paiement à la livraison.';

  return createPageMetadata({
    locale,
    path: `/${locale}/products${sp.category ? `?category=${sp.category}` : ''}`,
    title,
    description,
    image: '/images/brand-story.png',
  });
}

function EmptyProductsState({
  locale,
  isAr,
  query,
}: {
  locale: string;
  isAr: boolean;
  query?: string;
}) {
  return (
    <div className="page-enter flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] px-6 py-16 text-center shadow-[var(--shadow-xs)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
        <SearchX className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
        {query
          ? isAr
            ? `لا توجد نتائج لـ «${query}»`
            : `Aucun résultat pour « ${query} »`
          : isAr
            ? 'لم نجد قطعاً بهذه الفلاتر.'
            : 'Aucune pièce ne correspond.'}
      </h2>
      <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
        {query
          ? isAr
            ? 'جرّب كلمة أقصر أو امسح البحث لعرض المجموعة الكاملة.'
            : 'Essayez un terme plus court ou effacez la recherche pour retrouver toute la collection.'
          : isAr
            ? 'جرّب إزالة الفلاتر أو تغيير السعر. المجموعة الكاملة ستظهر لك كل القطع المتاحة.'
            : 'Essayez de retirer les filtres ou de modifier le prix. La collection complète affichera toutes les pièces disponibles.'}
      </p>
      <a
        href={`/${locale}/products`}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
      >
        {isAr ? 'عرض كل المجموعة' : 'Voir toute la collection'}
      </a>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const q = sp.q?.trim().slice(0, 80) || undefined;
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
    listProducts({ q, category, min, max, sort, page, pageSize }),
    listCategories(),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const activeCategory = categories.find((cat) => cat.slug === category);
  const activeCategoryName = activeCategory
    ? isAr
      ? activeCategory.nameAr
      : activeCategory.nameFr
    : null;

  const trustItems = [
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'توصيل داخل المغرب' : 'Livraison au Maroc',
      body: isAr ? '3 إلى 5 أيام عمل بعد التأكيد.' : '3 à 5 jours ouvrables après confirmation.',
    },
    {
      icon: <PackageCheck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
      body: isAr ? 'ادفع فقط عند وصول الطلب.' : "Vous payez seulement à l'arrivée.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'اختيار بعناية' : 'Sélection soignée',
      body: isAr ? 'قطع مختارة للديكور الداخلي.' : "Des pièces choisies pour l'intérieur.",
    },
    {
      icon: <Headphones className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'تأكيد بالهاتف' : 'Confirmation par appel',
      body: isAr ? 'نتصل بك قبل إرسال الطلب.' : "L'équipe confirme avant l'expédition.",
    },
  ];

  return (
    <main className="bg-[var(--color-brand-surface)]">
      <section className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                {isAr ? 'مجموعة مرجاد' : 'Collection MARJAD'}
              </p>
              <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,4vw,3.75rem)] font-bold leading-tight text-[var(--color-brand-text)]">
                {activeCategoryName ?? (isAr ? 'قطع للبيت المغربي المعاصر' : 'Des pièces pour la maison marocaine contemporaine')}
              </h1>
              <p className="mt-4 max-w-[620px] text-sm sm:text-base leading-relaxed text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'اكتشف قطع الديكور المختارة بعناية: لوحات، مصابيح، طاولات وتحف تصل إلى باب منزلك مع الدفع عند الاستلام.'
                  : "Explorez une sélection de tableaux, lampes, tables et objets décoratifs livrés chez vous, avec paiement à la livraison."}
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-[var(--color-brand-border)] border-y border-[var(--color-brand-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-2">
              {trustItems.map((item) => (
                <div
                  key={item.title}
                  className="p-3"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
                    {item.icon}
                  </div>
                  <p className="text-xs font-semibold leading-snug text-[var(--color-brand-text)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--color-brand-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-5 flex items-center gap-3">
          <ProductSearch key={q ?? ''} currentQuery={q} />
        </div>
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
              <EmptyProductsState locale={locale} isAr={isAr} query={q} />
            ) : (
              <ProductGrid products={products} locale={locale} />
            )}
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>

        {/* Mobile content — below toolbar */}
        <div className="lg:hidden">
          {products.length === 0 ? (
            <EmptyProductsState locale={locale} isAr={isAr} query={q} />
          ) : (
            <ProductGrid products={products} locale={locale} />
          )}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
