/* Hallmark · macrostructure: Full-bleed hero + categories + selection + story + COD + bestsellers + testimonials + FAQ
 * theme: custom/MARJAD — terracotta #C4622D · cream #FAF7F2 · golden #D4A853
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { listProducts } from '@/lib/queries/products';
import { listCategories } from '@/lib/queries/categories';
import { ProductCard } from '@/components/product/ProductCard';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FaqSection } from '@/components/home/FaqSection';
import { ArrowRight, Award, Banknote, Heart, Headphones, Leaf, MessageCircle, PackageCheck, Plus, Sparkles, Truck } from 'lucide-react';
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
    listProducts({ sort: 'newest', pageSize: 10, page: 1 }),
    listCategories(),
  ]);

  const featured = featuredProducts.filter((p) => p.isFeatured).slice(0, 5);
  const displayProducts = featured.length > 0 ? featured : featuredProducts.slice(0, 5);
  const bestSellers = featuredProducts.slice(0, 4);

  const codSteps = [
    {
      icon: Headphones,
      num: '1.',
      title: isAr ? 'تأكيد الطلب' : 'APPEL DE CONFIRMATION',
      body: isAr
        ? 'نتصل بك لتأكيد طلبك وعنوانك.'
        : 'Nous vous appelons pour confirmer votre commande et votre adresse.',
    },
    {
      icon: PackageCheck,
      num: '2.',
      title: isAr ? 'تغليف عناية' : 'EMBALLAGE SOIGNÉ',
      body: isAr
        ? 'كل قطعة تُغلَّف بعناية كبيرة.'
        : 'Chaque pièce est soigneusement emballée et protégée.',
    },
    {
      icon: Truck,
      num: '3.',
      title: isAr ? 'التوصيل في المغرب' : 'LIVRAISON AU MAROC',
      body: isAr
        ? 'نوصل في جميع أنحاء المغرب.'
        : 'Nous livrons partout au Maroc, à domicile.',
    },
    {
      icon: Banknote,
      num: '4.',
      title: isAr ? 'الدفع عند الاستلام' : 'PAIEMENT À LA LIVRAISON',
      body: isAr
        ? 'تدفع نقداً عند استلام طردك.'
        : 'Vous payez en espèces au livreur, en toute sérénité.',
    },
  ];

  const stats = [
    { value: 'COD', label: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison' },
    { value: isAr ? 'اتصال' : 'Appel', label: isAr ? 'تأكيد قبل الإرسال' : 'Confirmation avant envoi' },
    { value: isAr ? 'المغرب' : 'Maroc', label: isAr ? 'توصيل داخل المغرب' : 'Livraison partout au Maroc' },
    { value: isAr ? 'اختيار' : 'Sélection', label: isAr ? 'قطع مختارة بعناية' : 'Pièces choisies avec soin' },
  ];

  const storyBullets = [
    { icon: Sparkles, text: isAr ? 'خبرة حرفية موروثة' : 'Savoir-faire ancestral' },
    { icon: Leaf, text: isAr ? 'مواد نبيلة ومستدامة' : 'Matières nobles & durables' },
    { icon: Award, text: isAr ? 'تصميم خارج الزمن' : 'Design intemporel' },
  ];

  return (
    <main className="overflow-x-clip">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">

        {/* Background — bright Moroccan interior */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />

        {/* Left-side reading overlay — keeps right image fully visible */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(15,10,5,0.62)_0%,rgba(15,10,5,0.42)_38%,rgba(15,10,5,0.08)_62%,rgba(15,10,5,0)_100%)]" />
        {/* Subtle bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="w-full max-w-[var(--container-content)] mx-auto px-6 sm:px-8 lg:px-14 py-16 lg:py-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_580px] lg:gap-10">

              {/* ── Left: headline + CTAs + trust items ── */}
              <div className="max-w-[600px]">

                {/* Headline — large serif, white */}
                <h1 className="font-[var(--font-display)] font-bold text-white leading-[1.08] tracking-tight text-[clamp(2.4rem,6.5vw,6rem)] overflow-wrap-anywhere min-w-0">
                  {t('home.hero.titleLine1')}
                  <br />
                  {t('home.hero.titleLine2')}
                </h1>

                {/* Ornament divider */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px w-14 bg-[var(--color-brand-secondary)]/60" />
                  <span className="text-[var(--color-brand-secondary)] text-sm">◇</span>
                </div>

                {/* Subtitle */}
                <p className="mt-5 text-white/75 text-base sm:text-lg leading-relaxed max-w-[480px]">
                  {t('home.hero.subtitle')}
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="
                      inline-flex items-center gap-2.5 h-13 px-7
                      rounded-[var(--radius-btn)]
                      bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
                      text-white font-semibold text-sm
                      transition-colors duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                    "
                  >
                    {t('home.hero.cta')}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/products?sort=newest"
                    className="
                      inline-flex items-center gap-2 h-13 px-7
                      rounded-[var(--radius-btn)]
                      border border-white/40 hover:bg-white/10
                      text-white font-medium text-sm
                      backdrop-blur-sm transition-colors duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                    "
                  >
                    {t('home.hero.ctaSecondary')}
                  </Link>
                </div>

                {/* Trust items — 3 items inline with dividers */}
                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {[
                    { icon: PackageCheck, label: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison' },
                    { icon: MessageCircle, label: isAr ? 'تأكيد واتساب' : 'Confirmation WhatsApp' },
                    { icon: Truck, label: isAr ? 'توصيل المغرب' : 'Livraison Maroc' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2.5">
                        {i > 0 && <span className="hidden sm:block text-white/20 select-none">|</span>}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30">
                          <Icon className="h-3.5 w-3.5 text-white/80" />
                        </div>
                        <span className="text-xs text-white/80 font-medium">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Right: layered product cards ── */}
              <div className="hidden lg:flex lg:items-center lg:justify-end lg:pb-8">
                <div className="relative w-[520px]">

                  {/* Main card — brass lamp */}
                  <Link
                    href={displayProducts[0] ? `/products/${displayProducts[0].slug}` : '/products'}
                    className="relative z-10 block rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.24)] overflow-hidden transition-shadow duration-300 hover:shadow-[0_28px_80px_rgba(0,0,0,0.30)]"
                  >
                    {/* Product image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EFE6]">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
                        style={{ backgroundImage: "url('/images/marjad-hero-product.png')" }}
                      />
                      {/* À la une badge */}
                      <span className="absolute top-3 start-3 rounded-full bg-[var(--color-brand-secondary)] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                        {isAr ? 'مميز' : 'À la une'}
                      </span>
                      {/* Heart */}
                      <button
                        type="button"
                        aria-label="Wishlist"
                        className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                      >
                        <Heart className="h-4 w-4 text-[var(--color-brand-text-muted)]" />
                      </button>
                    </div>

                    {/* Info row */}
                    <div className="p-4">
                      <p className="font-[var(--font-display)] text-base font-semibold text-[var(--color-brand-text)] line-clamp-1">
                        {displayProducts[0]
                          ? (isAr ? displayProducts[0].nameAr : displayProducts[0].nameFr)
                          : (isAr ? 'مصباح نحاس ذهبي' : 'Lampe laiton doré')}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
                        {isAr ? 'صنع يدوي' : 'Fait main'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-[var(--font-display)] text-base font-bold text-[var(--color-brand-primary)]">
                          {displayProducts[0] ? `${displayProducts[0].price} MAD` : '1 690 MAD'}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-secondary)]">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Secondary detail card — zellige & brass tray, overlapping bottom-start */}
                  <Link
                    href="/products"
                    className="absolute -bottom-12 -start-28 z-20 block w-72 overflow-hidden rounded-xl border-[3px] border-white shadow-[0_8px_32px_rgba(0,0,0,0.20)] transition-transform duration-300 hover:scale-[1.03]"
                  >
                    <div
                      className="aspect-square bg-cover bg-center"
                      style={{ backgroundImage: "url('/images/marjad-hero-detail.png')" }}
                    />
                    <div className="bg-white px-3 py-2">
                      <p className="text-[11px] font-semibold text-[var(--color-brand-text)]">
                        {isAr ? 'حرف مغربية' : 'Artisanat du Maroc'}
                      </p>
                      <p className="text-[10px] text-[var(--color-brand-text-muted)]">
                        {isAr ? 'زليج وتراث' : 'Zellige & tradition'}
                      </p>
                    </div>
                  </Link>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-[var(--color-brand-surface)] py-12 lg:py-16">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {categories.slice(0, 4).map((cat) => {
                const catName = isAr ? cat.nameAr : cat.nameFr;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="group focus-visible:outline-none"
                  >
                    <div className="relative overflow-hidden rounded-[var(--radius-md)] aspect-[3/4] bg-[var(--color-brand-surface-alt)]">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
                        style={{ backgroundImage: `url('/images/category-${cat.slug}.webp')` }}
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-wide text-[var(--color-brand-text)]">
                        {catName}
                      </h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-primary)] transition-all group-hover:gap-2">
                        {isAr ? 'اكتشف' : 'Découvrir'}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SÉLECTION MARJAD ─────────────────────────────────────── */}
      {displayProducts.length > 0 && (
        <section className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] py-14 lg:py-20">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-wide text-[var(--color-brand-text)] sm:text-3xl">
                  {isAr ? 'اختيار مرجاد' : 'SÉLECTION MARJAD'}
                </h2>
                <p className="mt-1.5 text-sm text-[var(--color-brand-text-muted)]">
                  {isAr
                    ? 'قطع مختارة لتجميل منزلك'
                    : 'Des pièces choisies pour sublimer votre intérieur'}
                </p>
              </div>
              <Link
                href="/products"
                className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:underline"
              >
                {isAr ? 'عرض الكل' : 'VOIR TOUT'}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-5 md:grid-cols-3 lg:grid-cols-5">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>

            {/* Pagination dots */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${
                    i === 0
                      ? 'h-2 w-6 bg-[var(--color-brand-primary)]'
                      : 'h-2 w-2 bg-[var(--color-brand-border)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NOTRE HISTOIRE / BRAND STORY ─────────────────────────── */}
      <section className="bg-[var(--color-brand-surface-alt)] py-16 lg:py-24">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Text */}
            <div>
              <p className="mb-4 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                {isAr ? 'قصتنا' : 'NOTRE HISTOIRE'}
              </p>
              <h2
                className="
                  mb-5 font-[var(--font-display)]
                  text-[clamp(1.75rem,3.5vw,2.75rem)]
                  font-bold leading-tight text-[var(--color-brand-text)]
                  overflow-wrap-anywhere min-w-0
                "
              >
                {isAr
                  ? 'روح المغرب، في كل تفصيل.'
                  : "L'âme du Maroc,\ndans chaque détail."}
              </h2>
              <p className="mb-8 max-w-[500px] text-base leading-relaxed text-[var(--color-brand-text-muted)]">
                {t('home.story.body')}
              </p>
              <ul className="mb-8 space-y-3.5">
                {storyBullets.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[var(--color-brand-text)]">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
                      {item.text}
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/a-propos"
                className="
                  inline-flex items-center gap-2 h-12 px-7
                  rounded-[var(--radius-btn)]
                  bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
                  text-white font-semibold text-sm
                  transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
                "
              >
                {isAr ? 'اكتشف عالمنا' : 'DÉCOUVRIR NOTRE UNIVERS'}
              </Link>
            </div>

            {/* Craftsman photos */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="aspect-[3/4] rounded-[var(--radius-md)] bg-cover bg-center"
                style={{ backgroundImage: "url('/images/brand-story.webp')" }}
              />
              <div
                className="aspect-[3/4] rounded-[var(--radius-md)] bg-cover bg-center lg:mt-10"
                style={{ backgroundImage: "url('/images/about-story.webp')" }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── POURQUOI LE PAIEMENT À LA LIVRAISON ─────────────────── */}
      <section className="bg-[var(--color-brand-surface)] py-16 lg:py-20">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-[var(--font-display)] text-xl font-bold uppercase tracking-wide text-[var(--color-brand-text)] sm:text-2xl lg:text-3xl">
              {isAr
                ? 'لماذا تختار الدفع عند الاستلام؟'
                : 'POURQUOI CHOISIR LE PAIEMENT À LA LIVRAISON ?'}
            </h2>
            <div className="mt-3 flex justify-center">
              <span className="text-sm text-[var(--color-brand-secondary)]">◆</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {codSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-brand-border)]">
                    <Icon className="h-6 w-6 text-[var(--color-brand-primary)]" />
                  </div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-text)]">
                    {step.num} {step.title}
                  </p>
                  <p className="max-w-[160px] text-xs leading-relaxed text-[var(--color-brand-text-muted)]">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ROW ────────────────────────────────────────────── */}
      <div className="border-y border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => {
              const isOdd = idx % 2 === 0; // first column on mobile
              const isFirstRow = idx < 2;
              const isLastDesktop = idx === stats.length - 1;
              return (
                <div
                  key={stat.value}
                  className={[
                    'px-4 py-8 text-center lg:px-6',
                    isOdd ? 'border-e border-[var(--color-brand-border)]' : '',
                    isFirstRow ? 'border-b border-[var(--color-brand-border)] lg:border-b-0' : '',
                    !isLastDesktop ? 'lg:border-e lg:border-[var(--color-brand-border)]' : '',
                    isOdd ? '' : 'lg:border-e-0',
                  ].join(' ')}
                >
                  <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-brand-primary)]">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs text-[var(--color-brand-text-muted)]">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BEST SELLERS & IDÉES CADEAUX ─────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="bg-[var(--color-brand-surface)] py-14 lg:py-20">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-wide text-[var(--color-brand-text)] sm:text-3xl">
                {isAr ? 'الأكثر مبيعاً وأفكار الهدايا' : 'BEST SELLERS & IDÉES CADEAUX'}
              </h2>
              <Link
                href="/products"
                className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:underline"
              >
                {isAr ? 'عرض الكل' : 'VOIR TOUT'}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <TestimonialsSection locale={locale} />

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FaqSection locale={locale} />

    </main>
  );
}
