import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const [{ items: featuredProducts }, categories] = await Promise.all([
    listProducts({ sort: 'newest', pageSize: 8, page: 1 }),
    listCategories(),
  ]);

  // Filter featured products
  const featured = featuredProducts.filter((p) => p.isFeatured).slice(0, 8);
  // Fall back to newest 8 if no featured
  const displayProducts = featured.length > 0 ? featured : featuredProducts.slice(0, 8);

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] max-h-[720px] w-full overflow-hidden bg-gradient-to-br from-[var(--color-brand-surface-alt)] to-[var(--color-brand-surface)] flex items-end">
        {/* Background decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-surface-alt)] via-[var(--color-brand-surface)] to-[var(--color-brand-primary-light)] opacity-80" />

        {/* Decorative elements */}
        <div className="absolute top-8 end-8 w-40 h-40 rounded-full bg-[var(--color-brand-primary-light)] opacity-50 blur-3xl" />
        <div className="absolute bottom-12 start-12 w-56 h-56 rounded-full bg-[var(--color-brand-secondary)]/20 blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-[var(--container-content)] mx-auto px-4 sm:px-8 lg:px-16 pb-12 lg:pb-16">
          <div className="max-w-[560px]">
            <h1
              className="
                font-[var(--font-display)]
                text-[var(--color-brand-text)]
                text-3xl sm:text-4xl lg:text-5xl
                font-bold leading-tight
              "
            >
              {t('home.hero.title')}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-brand-text-muted)] max-w-[440px]">
              {t('home.hero.subtitle')}
            </p>
            <Link
              href="/products"
              className="
                mt-8 inline-flex items-center gap-2
                h-12 px-6
                rounded-[var(--radius-btn)]
                bg-[var(--color-brand-primary)]
                hover:bg-[var(--color-brand-primary-hover)]
                text-white font-semibold text-base
                transition-all duration-[var(--transition-base)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
                active:scale-[0.98]
              "
            >
              {t('home.hero.cta')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      {displayProducts.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)]">
                {isAr ? 'الجديد' : 'Nouveautés'}
              </h2>
              <Link
                href="/products"
                className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] rounded flex items-center gap-1"
              >
                {isAr ? 'عرض الكل' : 'Voir tout'}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
            <div className="border-b border-[var(--color-brand-border)] mb-6" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Category showcase ─────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 lg:py-16 bg-[var(--color-brand-surface-alt)]">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <h2 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)] mb-2">
              {isAr ? 'الفئات' : 'Catégories'}
            </h2>
            <div className="border-b border-[var(--color-brand-border)] mb-6" />

            {/* Mobile: horizontal scroll; Desktop: grid */}
            <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
              {categories.slice(0, 8).map((cat) => {
                const catName = isAr ? cat.nameAr : cat.nameFr;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="
                      group relative flex-shrink-0 min-w-[140px] sm:min-w-[160px] lg:min-w-0
                      aspect-[4/5] rounded-[var(--radius-md)] overflow-hidden
                      bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)]
                      snap-start
                      hover:shadow-[var(--shadow-md)] transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
                    "
                    aria-label={catName}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Background placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary-light)] to-[var(--color-brand-surface-alt)] group-hover:scale-[1.03] transition-transform duration-300" />

                    {/* Category initial decoration */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <span className="text-6xl font-bold text-[var(--color-brand-primary)]">
                        {catName.charAt(0)}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="absolute bottom-3 start-3 end-3">
                      <span className="text-white font-semibold text-sm drop-shadow-sm line-clamp-2">
                        {catName}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
