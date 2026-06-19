/* Hallmark · macrostructure: Marquee Hero · genre: editorial · tone: warm artisanal
 * theme: custom/MARJAD — terracotta #C4622D · cream #FAF7F2 · golden #D4A853
 * paper-band: light · display-style: high-contrast-serif · accent-hue: warm
 * nav: N1b · footer: Ft5 · enrichment: Tier-C lifestyle photography (see IMAGE_PROMPTS.md)
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductCard } from '@/components/product/ProductCard';
import { MarqueeStrip } from '@/components/home/MarqueeStrip';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { ArrowRight, Banknote, Headphones, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { createPageMetadata } from '@/lib/seo';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}`,
    title: isAr
      ? 'مرجاد — ديكور مغربي مصنوع بعناية'
      : 'MARJAD — Décoration marocaine artisanale',
    description: isAr
      ? 'اكتشف قطع ديكور مغربية مختارة بعناية مع التوصيل داخل المغرب والدفع عند الاستلام.'
      : 'Découvrez tableaux, lampes, tables et objets décoratifs marocains avec livraison partout au Maroc et paiement à la livraison.',
    image: '/images/hero-bg.png',
  });
}

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
                text-[clamp(2.8rem,7vw,7rem)]
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
                  text-white font-medium text-sm
                  backdrop-blur-sm
                  transition-colors duration-[var(--transition-base)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-transparent
                "
              >
                {t('home.hero.ctaSecondary')}
              </Link>
            </div>

            <div className="mt-8 grid max-w-[560px] grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                t('home.hero.proofCod'),
                t('home.hero.proofDelivery'),
                t('home.hero.proofCall'),
              ].map((proof) => (
                <div
                  key={proof}
                  className="rounded-[var(--radius-md)] border border-white/15 bg-white/[0.08] px-3 py-2 text-xs font-medium text-white/78 backdrop-blur-sm"
                >
                  {proof}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* ── VALUES BAR ─────────────────────────────────────────── */}
      <section className="zellige-texture bg-[var(--color-brand-surface-alt)] border-b border-[var(--color-brand-border)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            {[
              {
                title: t('home.values.craftTitle'),
                desc: t('home.values.craftDesc'),
              },
              {
                title: t('home.values.deliveryTitle'),
                desc: t('home.values.deliveryDesc'),
              },
              {
                title: t('home.values.guaranteeTitle'),
                desc: t('home.values.guaranteeDesc'),
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="sm:px-10 first:ps-0 last:pe-0 border-t-2 border-[var(--color-brand-primary)] pt-5"
                style={{ borderTopWidth: i === 0 ? '2px' : undefined }}
              >
                <p className="
                  font-[var(--font-display)]
                  text-lg font-bold
                  text-[var(--color-brand-text)]
                  mb-2
                ">
                  {item.title}
                </p>
                <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
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
                const categoryHint = isAr
                  ? t('home.categories.hintAr', { category: catName })
                  : t('home.categories.hintFr', { category: catName });
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
                      <p className="mb-2 w-fit rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur-sm">
                        {t('home.categories.badge')}
                      </p>
                      <p className="
                        font-[var(--font-display)] text-white
                        text-lg font-semibold
                        line-clamp-2 drop-shadow
                        group-hover:text-[var(--color-brand-secondary)]
                        transition-colors duration-200
                      ">
                        {catName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/68 rtl:text-right">
                        {categoryHint}
                      </p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                        {t('home.categories.shopCta')}
                        <ArrowRight className="size-3 rtl:rotate-180" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ── COD CONFIDENCE ────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-text)] py-14 text-white sm:py-16 lg:py-20">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.5fr] lg:items-end">
            <div>
              <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-secondary)]">
                {t('home.cod.eyebrow')}
              </p>
              <h2 className="font-[var(--font-display)] text-[clamp(1.8rem,3.7vw,3rem)] font-bold leading-tight">
                {t('home.cod.heading')}
              </h2>
              <p className="mt-4 max-w-[440px] text-sm leading-7 text-white/66">
                {t('home.cod.body')}
              </p>
              <Link
                href="/livraison-retours"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-secondary)] transition hover:gap-3 focus-visible:outline-none focus-visible:underline"
              >
                {t('home.cod.cta')}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Banknote, title: t('home.cod.step1Title'), body: t('home.cod.step1Body') },
                { icon: Headphones, title: t('home.cod.step2Title'), body: t('home.cod.step2Body') },
                { icon: PackageCheck, title: t('home.cod.step3Title'), body: t('home.cod.step3Body') },
                { icon: ShieldCheck, title: t('home.cod.step4Title'), body: t('home.cod.step4Body') },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.06] p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
                  >
                    <Icon className="mb-4 size-5 text-[var(--color-brand-secondary)]" />
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/58">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
            {[
              { icon: Truck, text: t('home.cod.statDelivery') },
              { icon: ShieldCheck, text: t('home.cod.statPackaging') },
              { icon: Headphones, text: t('home.cod.statSupport') },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 text-sm text-white/72">
                  <Icon className="size-4 text-[var(--color-brand-secondary)]" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TestimonialsSection locale={locale} />

    </main>
  );
}
