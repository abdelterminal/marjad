/* Hallmark · macrostructure: Marquee Hero · genre: editorial · tone: warm artisanal
 * theme: custom/MARJAD — terracotta #C4622D · cream #FAF7F2 · golden #D4A853
 * paper-band: light · display-style: high-contrast-serif · accent-hue: warm
 * nav: N1b · footer: Ft5 · enrichment: Tier-C lifestyle photography (see IMAGE_PROMPTS.md)
 */
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const [{ items: featuredProducts }, categories] = await Promise.all([
    listProducts({ sort: 'newest', pageSize: 8, page: 1 }),
    listCategories(),
  ]);

  const featured = featuredProducts.filter((p) => p.isFeatured).slice(0, 8);
  const displayProducts = featured.length > 0 ? featured : featuredProducts.slice(0, 8);

  return (
    <main className="overflow-x-clip">

      {/* ── HERO — Marquee, full-bleed lifestyle ────────────────── */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">

        {/* Background: real photo layers over warm gradient fallback */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #2A1A0E 0%, #8B3E1A 45%, #1A0E08 100%)',
            backgroundImage: "url('/images/hero-bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />

        {/* Cinematic overlay — readable text regardless of photo brightness */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />

        {/* Brand coordinates — top-end, desktop only */}
        <p
          className="
            absolute top-7 end-8 z-10
            hidden md:block
            text-white/50 text-[11px] font-mono tracking-[0.18em] uppercase
          "
        >
          {t('home.hero.signature')}
        </p>

        {/* Hero content — bottom-start */}
        <div className="relative z-10 w-full max-w-[var(--container-content)] mx-auto px-6 sm:px-8 lg:px-14 pb-14 lg:pb-20">
          <div className="max-w-[600px]">

            {/* Eyebrow */}
            <p className="text-white/60 text-[11px] font-mono tracking-[0.18em] uppercase mb-5">
              {isAr ? 'مرجاد — المغرب' : 'MARJAD — Maroc'}
            </p>

            {/* Display headline — Playfair Display, two lines */}
            <h1
              className="
                font-[var(--font-display)]
                text-white
                text-[clamp(2.4rem,6vw,5.5rem)]
                font-bold leading-[1.08] tracking-tight
                overflow-wrap-anywhere min-w-0
              "
            >
              {t('home.hero.titleLine1')}
              <br />
              <span className="text-[var(--color-brand-secondary)]">
                {t('home.hero.titleLine2')}
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-white/70 text-base sm:text-lg max-w-[460px] leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="
                  inline-flex items-center gap-2
                  h-12 px-7
                  rounded-[var(--radius-btn)]
                  bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
                  text-white font-semibold text-sm
                  transition-colors duration-[var(--transition-base)]
                  active:scale-[0.98]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent
                "
              >
                {t('home.hero.cta')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/a-propos"
                className="
                  inline-flex items-center gap-2
                  h-12 px-7
                  rounded-[var(--radius-btn)]
                  bg-white/10 hover:bg-white/18
                  border border-white/25
                  text-white font-medium text-sm
                  backdrop-blur-sm
                  transition-colors duration-[var(--transition-base)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent
                "
              >
                {t('home.hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES BAR ─────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-0 sm:divide-x divide-[var(--color-brand-border)] rtl:divide-x-reverse">
            {[
              {
                icon: <Sparkles className="w-4 h-4" />,
                title: t('home.values.craftTitle'),
                desc: t('home.values.craftDesc'),
              },
              {
                icon: <Truck className="w-4 h-4" />,
                title: t('home.values.deliveryTitle'),
                desc: t('home.values.deliveryDesc'),
              },
              {
                icon: <ShieldCheck className="w-4 h-4" />,
                title: t('home.values.guaranteeTitle'),
                desc: t('home.values.guaranteeDesc'),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3.5 sm:px-8 first:ps-0 last:pe-0"
              >
                <div className="
                  w-8 h-8 rounded-full flex-shrink-0
                  bg-[var(--color-brand-primary-light)]
                  text-[var(--color-brand-primary)]
                  flex items-center justify-center
                ">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-brand-text)]">{item.title}</p>
                  <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────────── */}
      {displayProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-[var(--color-brand-surface)]">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-2">
                  {t('home.featured.eyebrow')}
                </p>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)]">
                  {t('home.featured.heading')}
                </h2>
              </div>
              <Link
                href="/products"
                className="
                  flex items-center gap-1.5
                  text-sm font-medium text-[var(--color-brand-primary)]
                  hover:text-[var(--color-brand-primary-dark)]
                  transition-colors duration-[var(--transition-fast)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] rounded
                "
              >
                {t('home.featured.viewAll')}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BRAND STORY — 2-column editorial ───────────────────── */}
      <section className="py-16 lg:py-28 bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text */}
            <div>
              <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
                {t('home.story.eyebrow')}
              </p>
              <h2 className="
                font-[var(--font-display)]
                text-[clamp(1.75rem,3.5vw,2.75rem)]
                font-bold text-[var(--color-brand-text)]
                leading-tight mb-6
                overflow-wrap-anywhere min-w-0
              ">
                {t('home.story.heading')}
              </h2>
              <p className="text-[var(--color-brand-text-muted)] text-base leading-relaxed max-w-[500px] mb-8">
                {t('home.story.body')}
              </p>
              <Link
                href="/a-propos"
                className="
                  inline-flex items-center gap-2
                  text-[var(--color-brand-primary)] font-semibold text-sm
                  hover:gap-3 transition-all duration-[var(--transition-base)]
                  group focus-visible:outline-none focus-visible:underline
                "
              >
                {t('home.story.cta')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative">
              <div
                className="aspect-[4/5] rounded-[var(--radius-xl)] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #F5E8DF 0%, #D4A853 60%, #C4622D 100%)',
                  backgroundImage: "url('/images/brand-story.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Placeholder text when no image */}
                <div className="w-full h-full flex items-end p-6 bg-gradient-to-t from-black/30 to-transparent">
                  <p className="font-[var(--font-display)] text-white/0 text-sm italic">
                    brand-story.jpg
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="
                absolute -bottom-4 -start-4
                bg-[var(--color-brand-surface)]
                border border-[var(--color-brand-border)]
                rounded-[var(--radius-md)] px-4 py-3
                shadow-[var(--shadow-md)]
              ">
                <p className="text-[11px] text-[var(--color-brand-text-muted)] mb-0.5">
                  {isAr ? 'صنع في' : 'Fait au'}
                </p>
                <p className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-brand-text)]">
                  {t('home.story.badge')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 lg:py-24 bg-[var(--color-brand-surface)]">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="mb-10">
              <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-2">
                {t('home.categories.eyebrow')}
              </p>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)]">
                {t('home.categories.heading')}
              </h2>
            </div>

            {/* Mobile: horizontal scroll · Desktop: grid */}
            <div className="
              flex gap-4 overflow-x-auto pb-4
              snap-x snap-mandatory
              lg:grid lg:grid-cols-4 lg:gap-5
              lg:overflow-visible lg:pb-0
            ">
              {categories.slice(0, 4).map((cat) => {
                const catName = isAr ? cat.nameAr : cat.nameFr;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    aria-label={catName}
                    className="
                      group relative flex-shrink-0
                      min-w-[200px] sm:min-w-[220px] lg:min-w-0
                      aspect-[3/4]
                      rounded-[var(--radius-xl)] overflow-hidden
                      snap-start
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
                    "
                    style={{
                      background: 'linear-gradient(135deg, #F0EBE1 0%, #C4622D 100%)',
                      backgroundImage: `url('/images/category-${cat.slug}.webp')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Gradient scale on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-surface-alt)] to-[var(--color-brand-primary-light)] group-hover:scale-[1.04] transition-transform duration-500 -z-10" />

                    {/* Dark bottom overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Letter placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                      <span className="font-[var(--font-display)] text-[7rem] font-bold text-[var(--color-brand-primary)] leading-none select-none">
                        {catName.charAt(0)}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-4 start-4 end-4">
                      <p className="
                        font-[var(--font-display)] text-white
                        text-lg font-semibold
                        line-clamp-2 drop-shadow
                        group-hover:text-[var(--color-brand-secondary)]
                        transition-colors duration-200
                      ">
                        {catName}
                      </p>
                      <p className="text-white/60 text-xs mt-1 rtl:text-right">
                        {t('home.categories.shopCta')}
                      </p>
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
