import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getProductBySlug, listProducts } from '@/lib/queries/products';
import { formatMAD } from '@/lib/money';
import { Gallery } from '@/components/product/Gallery';
import { ProductCard } from '@/components/product/ProductCard';
import { StickyMobileCTA } from '@/components/product/StickyMobileCTA';
import { ProductCTA } from '@/components/product/ProductCTA';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import type { AccordionItemDef } from '@/components/product/ProductAccordion';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Leaf,
  RotateCcw,
  Sparkles,
  Truck,
} from 'lucide-react';
import { absoluteUrl, createPageMetadata } from '@/lib/seo';
import { ExpandableDescription } from '@/components/product/ExpandableDescription';
import { ProductViewEvent } from '@/components/analytics/ProductViewEvent';
import { getWhatsAppHref } from '@/lib/contact';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === 'ar';
  const product = await getProductBySlug(slug);

  if (!product) {
    return createPageMetadata({
      locale,
      path: `/${locale}/products`,
      title: isAr ? 'المنتج غير متوفر' : 'Produit indisponible',
      description: isAr
        ? 'هذا المنتج لم يعد متاحاً في مجموعة مرجاد.'
        : "Ce produit n'est plus disponible dans la collection MARJAD.",
    });
  }

  const name = isAr ? product.nameAr : product.nameFr;
  const description =
    (isAr ? product.descriptionAr : product.descriptionFr) ??
    (isAr
      ? 'قطعة ديكور مغربية مختارة بعناية، مع الدفع عند الاستلام والتوصيل داخل المغرب.'
      : 'Pièce de décoration marocaine sélectionnée avec soin, paiement à la livraison partout au Maroc.');

  return createPageMetadata({
    locale,
    path: `/${locale}/products/${product.slug}`,
    title: name,
    description,
    image: product.images?.[0] ?? '/images/brand-story.png',
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const name = isAr ? product.nameAr : product.nameFr;
  const description = isAr ? product.descriptionAr : product.descriptionFr;
  const categoryName = product.category
    ? isAr ? product.category.nameAr : product.category.nameFr
    : null;

  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const mainImage = product.images?.[0];
  const formattedPrice = formatMAD(price);

  const relatedRaw = product.category
    ? (await listProducts({ category: product.category.slug, pageSize: 5 })).items
    : [];
  const related = relatedRaw.filter((p) => p.slug !== slug).slice(0, 4);

  const waHref = getWhatsAppHref(
    isAr
      ? `مرحباً مرجاد، أود طلب المنتج: ${name}`
      : `Bonjour MARJAD, je souhaite commander : ${name}`,
  );

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description:
      description ??
      (isAr
        ? 'قطعة ديكور مغربية مختارة بعناية.'
        : 'Pièce de décoration marocaine sélectionnée avec soin.'),
    image: (product.images ?? []).map((image) => absoluteUrl(image)),
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'MARJAD' },
    category: categoryName ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: price.toFixed(2),
      availability: isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      url: absoluteUrl(`/${locale}/products/${product.slug}`),
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const detailsContent = isAr
    ? (product.detailsAr ?? `المرجع: ${product.slug.toUpperCase()} · الفئة: ${categoryName ?? '—'} · صنع يدوي في المغرب.`)
    : (product.detailsFr ?? `Réf. ${product.slug.toUpperCase()} · Catégorie : ${categoryName ?? '—'} · Fabrication artisanale au Maroc.`);

  const accordionItems: AccordionItemDef[] = [
    {
      icon: 'details',
      title: isAr ? 'التفاصيل' : 'Détails',
      summary: isAr ? 'الأبعاد، المواد، الصيانة' : 'Dimensions, matériaux, entretien',
      content: detailsContent,
    },
    {
      icon: 'origine',
      title: isAr ? 'الأصل' : 'Origine',
      summary: isAr ? 'حرف مغربية' : 'Artisanat marocain',
      content: isAr
        ? 'كل قطعة مصنوعة يدوياً بالمغرب من قِبَل حرفيين متخصصين، تحمل بصمة أصيلة وفريدة.'
        : 'Chaque pièce est fabriquée à la main au Maroc par des artisans spécialisés, portant une empreinte authentique et unique.',
    },
    {
      icon: 'livraison',
      title: isAr ? 'التوصيل' : 'Livraison',
      summary: isAr ? 'المواعيد والتكاليف والإرجاع' : 'Délais, frais et retours',
      content: isAr
        ? 'التوصيل خلال 3 إلى 5 أيام عمل في كامل المغرب. الدفع نقداً عند الاستلام. الإرجاع مقبول خلال 48 ساعة في حال وجود مشكل.'
        : 'Livraison en 3 à 5 jours ouvrables partout au Maroc. Paiement en espèces à la réception. Retours acceptés sous 48h en cas de problème.',
    },
  ];

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <main className="bg-[var(--color-brand-surface)] pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductViewEvent
        productId={product.id}
        slug={product.slug}
        name={name}
        price={price}
        category={categoryName}
      />

      {/* ── HERO: GALLERY + BUY BOX ─────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--color-brand-border)] bg-[linear-gradient(180deg,var(--color-brand-surface-alt)_0%,var(--color-brand-surface)_78%)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.72fr)] gap-8 lg:gap-14">

          {/* Gallery */}
          <Gallery images={product.images ?? []} productName={name} />

          {/* Buy box */}
          <div className="lg:sticky lg:top-[90px] lg:self-start">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]/95 p-5 shadow-[var(--shadow-md)] backdrop-blur sm:p-6 lg:p-7">

            {/* Breadcrumb */}
            <nav
              aria-label={isAr ? 'مسار التنقل' : "Fil d'Ariane"}
              className="mb-5 flex items-center flex-wrap gap-1 text-xs text-[var(--color-brand-text-muted)]"
            >
              <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">
                {isAr ? 'الرئيسية' : 'Accueil'}
              </Link>
              {categoryName && product.category && (
                <>
                  <ChevronRight className="h-3 w-3 rtl:rotate-180 shrink-0" />
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="hover:text-[var(--color-brand-primary)] transition-colors"
                  >
                    {categoryName}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3 rtl:rotate-180 shrink-0" />
              <span className="truncate max-w-[200px] text-[var(--color-brand-text)]">{name}</span>
            </nav>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="inline-flex items-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-text-muted)]">
                  {categoryName}
                </span>
              )}
              {hasDiscount && (
                <span className="inline-flex items-center rounded-full bg-[var(--color-brand-text)] px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="font-[var(--font-display)] text-[clamp(1.75rem,3vw,2.65rem)] font-bold text-[var(--color-brand-text)] leading-tight">
              {name}
            </h1>

            {/* Short description */}
            {description && (
              <ExpandableDescription text={description} locale={locale} />
            )}

            {/* Price */}
            <div className="my-6 border-y border-[var(--color-brand-border)] py-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="price-display text-[2rem] font-bold text-[var(--color-brand-primary)]">
                  {formattedPrice}
                </span>
                {hasDiscount && (
                  <span className="text-base text-[var(--color-brand-text-muted)] line-through">
                    {formatMAD(compareAtPrice!)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs font-medium text-[var(--color-brand-text-subtle)]">
                {isAr
                  ? 'الدفع نقداً عند الاستلام بعد تأكيد الطلب.'
                  : 'Paiement en espèces à la livraison après confirmation.'}
              </p>
            </div>

            {/* Stock */}
            <div className="mb-5">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-error)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-brand-error)]" />
                  {isAr ? 'نفد المخزون' : 'Rupture de stock'}
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  {isAr
                    ? `${product.stock} قطع متبقية فقط`
                    : `Plus que ${product.stock} pièce${product.stock > 1 ? 's' : ''}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-brand-success)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-brand-success)]" />
                  {isAr ? 'متوفر في المخزون' : 'En stock'}
                </span>
              )}
            </div>

            {/* CTAs */}
            <ProductCTA
              product={{
                id: product.id,
                slug: product.slug,
                nameFr: product.nameFr,
                nameAr: product.nameAr,
                price: product.price,
                image: mainImage,
              }}
              isOutOfStock={isOutOfStock}
              waHref={waHref}
              isAr={isAr}
            />

            {/* Trust items */}
            <div className="mt-5 grid grid-cols-1 divide-y divide-[var(--color-brand-border)] rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  icon: <Banknote className="h-4 w-4 text-[var(--color-brand-primary)]" />,
                  title: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
                  body: isAr ? 'نقداً عند الاستلام' : 'Payez en espèces à la réception',
                },
                {
                  icon: <CheckCircle2 className="h-4 w-4 text-[var(--color-brand-primary)]" />,
                  title: isAr ? 'تأكيد قبل الإرسال' : 'Confirmation avant envoi',
                  body: isAr ? 'نتصل بك للتأكيد' : 'Nous vous appelons pour confirmer',
                },
                {
                  icon: <Truck className="h-4 w-4 text-[var(--color-brand-primary)]" />,
                  title: isAr ? 'توصيل بالمغرب' : 'Livraison partout au Maroc',
                  body: isAr ? 'سريع وآمن ومتتبع' : 'Rapide, sécurisée et suivie',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="px-3 py-3"
                >
                  {item.icon}
                  <p className="mt-2 text-[11px] font-semibold text-[var(--color-brand-text)] leading-tight">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-brand-text-subtle)] leading-tight">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="mt-5 border-t border-[var(--color-brand-border)] pt-1">
              <ProductAccordion items={accordionItems} />
            </div>

            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── BOTTOM INFO PANELS ──────────────────────────────── */}
      <section className="border-y border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="mx-auto max-w-[var(--container-content)] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="mb-8 max-w-[42rem]">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              {isAr ? 'تفاصيل مطمئنة' : 'Détails qui rassurent'}
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
              {isAr ? 'كل ما تحتاج معرفته قبل الطلب' : 'Tout savoir avant de commander'}
            </h2>
          </div>
          <div className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] lg:grid-cols-3 lg:divide-x divide-[var(--color-brand-border)]">

          {/* Panel 1 — L'histoire du produit */}
          <div className="flex gap-5 p-6 sm:p-8">
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-brand-text)] mb-3">
                {isAr ? 'قصة المنتج' : "L'histoire du produit"}
              </h3>
              <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed line-clamp-5">
                {description ??
                  (isAr
                    ? 'قطعة مغربية مختارة بعناية من قِبَل فريق مرجاد، مصنوعة يدوياً بمواد أصيلة.'
                    : "Sélectionnée avec soin par l'équipe MARJAD, cette pièce est façonnée à la main avec des matériaux authentiques.")}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-primary)]">
                {isAr ? 'مختارة بعناية' : 'Sélectionnée avec soin'}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </div>
            {mainImage && (
              <div className="relative h-[160px] w-[120px] shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                <Image src={mainImage} alt={name} fill className="object-cover" sizes="120px" />
              </div>
            )}
          </div>

          {/* Panel 2 — Origine */}
          <div className="flex gap-5 border-t border-[var(--color-brand-border)] p-6 sm:p-8 lg:border-t-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-brand-text)] mb-4">
                {isAr ? 'الأصل' : 'Origine'}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    icon: <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'صنع يدوي بالمغرب' : 'Fait main au Maroc',
                    body: isAr ? 'تمسلوهت، مراكش' : 'Tameslouht, Marrakech',
                  },
                  {
                    icon: <Leaf className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'خبرة حرفية' : 'Savoir-faire',
                    body: isAr ? 'نحاس مشغول ومنقوش يدوياً' : 'Laiton travaillé et ciselé à la main',
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'قطعة فريدة' : 'Pièce unique',
                    body: isAr ? 'اختلافات طفيفة تميز كل قطعة' : 'De légères variations rendent chaque pièce unique',
                  },
                ].map((b) => (
                  <li key={b.title} className="flex items-start gap-2.5">
                    {b.icon}
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-brand-text)]">{b.title}</p>
                      <p className="text-[11px] text-[var(--color-brand-text-muted)]">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[160px] w-[120px] shrink-0 overflow-hidden rounded-[var(--radius-md)]">
              <Image
                src="/images/marjad-hero-detail.png"
                alt={isAr ? 'حرف مغربية' : 'Artisanat marocain'}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
          </div>

          {/* Panel 3 — Livraison & retours */}
          <div className="flex gap-5 border-t border-[var(--color-brand-border)] p-6 sm:p-8 lg:border-t-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-brand-text)] mb-4">
                {isAr ? 'التوصيل والإرجاع' : 'Livraison & retours'}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    icon: <Truck className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'توصيل بالمغرب' : 'Livraison partout au Maroc',
                    body: isAr ? '3 إلى 5 أيام عمل' : '3 à 5 jours ouvrables',
                  },
                  {
                    icon: <Banknote className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
                    body: isAr ? 'نقداً عند الاستلام' : 'Espèces à la réception',
                  },
                  {
                    icon: <RotateCcw className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />,
                    title: isAr ? 'الإرجاع مقبول' : 'Retours sous conditions',
                    body: isAr ? '48 ساعة في حال وجود مشكل' : '48h en cas de problème',
                  },
                ].map((b) => (
                  <li key={b.title} className="flex items-start gap-2.5">
                    {b.icon}
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-brand-text)]">{b.title}</p>
                      <p className="text-[11px] text-[var(--color-brand-text-muted)]">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[160px] w-[120px] shrink-0 overflow-hidden rounded-[var(--radius-md)]">
              <Image
                src="/images/hero-bg.png"
                alt={isAr ? 'توصيل مرجاد' : 'Livraison MARJAD'}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)] mb-2">
                  {isAr ? 'استكشف أيضاً' : 'Vous aimerez aussi'}
                </p>
                <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                  {categoryName ?? (isAr ? 'منتجات مشابهة' : 'Pièces similaires')}
                </h2>
              </div>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hidden sm:inline text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
                >
                  {isAr ? 'عرض الكل' : 'Voir tout'}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STICKY BAR ────────────────────────────────────────── */}
      <StickyMobileCTA
        product={{
          id: product.id,
          slug: product.slug,
          nameFr: product.nameFr,
          nameAr: product.nameAr,
          price: product.price,
          image: mainImage,
        }}
        formattedPrice={formattedPrice}
        isOutOfStock={isOutOfStock}
        lowStockLabel={
          isLowStock
            ? isAr
              ? `${product.stock} قطع فقط`
              : `${product.stock} pièce${product.stock > 1 ? 's' : ''} restante${product.stock > 1 ? 's' : ''}`
            : undefined
        }
      />
    </main>
  );
}
