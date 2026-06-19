import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProductBySlug, listProducts } from '@/lib/queries/products';
import { formatMAD } from '@/lib/money';
import { Gallery } from '@/components/product/Gallery';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { ProductCard } from '@/components/product/ProductCard';
import { StickyMobileCTA } from '@/components/product/StickyMobileCTA';
import {
  ChevronRight,
  Headphones,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { absoluteUrl, createPageMetadata } from '@/lib/seo';
import { ProductViewEvent } from '@/components/analytics/ProductViewEvent';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

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

  // Related products — same category, exclude current slug
  const relatedRaw = product.category
    ? (await listProducts({ category: product.category.slug, pageSize: 5 })).items
    : [];
  const related = relatedRaw.filter((p) => p.slug !== slug).slice(0, 4);

  // WhatsApp direct-order link
  const waText = encodeURIComponent(
    isAr
      ? `مرحباً مرجاد، أود طلب المنتج: ${name}`
      : `Bonjour MARJAD, je souhaite commander : ${name}`,
  );
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null;
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
    brand: {
      '@type': 'Brand',
      name: 'MARJAD',
    },
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

  /* ── Copy blocks ──────────────────────────────────────────── */
  const process = [
    {
      icon: <Phone className="h-5 w-5" aria-hidden="true" />,
      step: '01',
      title: isAr ? 'تأكيد الطلب' : 'Confirmation',
      body: isAr
        ? 'فريقنا يتصل بك خلال 24 ساعة لتأكيد العنوان والكمية.'
        : "Notre équipe vous rappelle dans les 24h pour confirmer l'adresse et la quantité.",
    },
    {
      icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
      step: '02',
      title: isAr ? 'التحضير والتغليف' : 'Préparation',
      body: isAr
        ? 'كل قطعة تُغلف بعناية ومواد مناسبة لطبيعتها.'
        : 'Chaque pièce est emballée avec soin et des matériaux adaptés à sa nature.',
    },
    {
      icon: <Truck className="h-5 w-5" aria-hidden="true" />,
      step: '03',
      title: isAr ? 'التوصيل إلى بابك' : 'Livraison',
      body: isAr
        ? 'يصل طلبك في 3 إلى 5 أيام عمل. الدفع للمندوب عند الاستلام.'
        : 'Votre commande arrive en 3 à 5 jours ouvrables. Vous payez à la réception.',
    },
  ];

  const guarantees = [
    {
      icon: <PackageCheck className="h-5 w-5" aria-hidden="true" />,
      title: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
      body: isAr
        ? 'لا تدفع شيئاً الآن. تدفع للمندوب نقداً عند وصول الطلب.'
        : "Aucun paiement en ligne. Vous réglez en espèces à l'arrivée.",
    },
    {
      icon: <Headphones className="h-5 w-5" aria-hidden="true" />,
      title: isAr ? 'تأكيد هاتفي' : 'Confirmation par appel',
      body: isAr
        ? 'نتصل بك لتأكيد العنوان والكمية قبل أي إرسال.'
        : "Nous vérifions chaque détail avec vous avant l'envoi. Aucune surprise.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
      title: isAr ? 'إرجاع مضمون 48 ساعة' : 'Retours garantis 48h',
      body: isAr
        ? 'إذا وصلت القطعة تالفة أو لا تتطابق مع وصفها — نسترجع أو نستبدل دون نقاش.'
        : 'Pièce endommagée ou non conforme ? On échange ou rembourse, sans discussion.',
    },
  ];

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <main className="pb-20 lg:pb-0">
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

      {/* ── BREADCRUMB ────────────────────────────────────────── */}
      <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav
          aria-label={isAr ? 'مسار التنقل' : "Fil d'Ariane"}
          className="flex items-center flex-wrap gap-1 text-xs text-[var(--color-brand-text-muted)]"
        >
          <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">
            {isAr ? 'الرئيسية' : 'Accueil'}
          </Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <Link href="/products" className="hover:text-[var(--color-brand-primary)] transition-colors">
            {isAr ? 'المنتجات' : 'Produits'}
          </Link>
          {categoryName && product.category && (
            <>
              <ChevronRight className="w-3 h-3 rtl:rotate-180 shrink-0" aria-hidden="true" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-[var(--color-brand-primary)] transition-colors"
              >
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 rtl:rotate-180 shrink-0" aria-hidden="true" />
          <span className="text-[var(--color-brand-text)] truncate max-w-[180px]">{name}</span>
        </nav>
      </div>

      {/* ── HERO: GALLERY + BUY BOX ───────────────────────────── */}
      <section className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16">

          {/* Gallery */}
          <Gallery images={product.images ?? []} productName={name} />

          {/* Buy box */}
          <div className="lg:sticky lg:top-[90px] lg:self-start space-y-5">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 flex-wrap">
              {categoryName && (
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-brand-primary)]">
                  {categoryName}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-text)] text-white text-[10px] font-bold tracking-wide">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="font-[var(--font-display)] text-[clamp(1.65rem,3.2vw,2.6rem)] font-bold text-[var(--color-brand-text)] leading-tight">
              {name}
            </h1>

            {/* Price block */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="price-display text-[2rem] font-bold text-[var(--color-brand-text)]">
                  {formattedPrice}
                </span>
                {hasDiscount && (
                  <span className="price-display text-base text-[var(--color-brand-text-muted)] line-through">
                    {formatMAD(compareAtPrice!)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'الدفع عند الاستلام — لا حاجة لبطاقة بنكية'
                  : 'Paiement à la livraison — aucune carte requise'}
              </p>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: <Truck className="size-4" aria-hidden="true" />,
                    title: isAr ? '3–5 أيام' : '3–5 jours',
                    body: isAr ? 'توصيل في المغرب' : 'Livraison Maroc',
                  },
                  {
                    icon: <Phone className="size-4" aria-hidden="true" />,
                    title: isAr ? 'اتصال' : 'Appel',
                    body: isAr ? 'قبل الإرسال' : "Avant l'envoi",
                  },
                  {
                    icon: <PackageCheck className="size-4" aria-hidden="true" />,
                    title: isAr ? 'تغليف' : 'Emballage',
                    body: isAr ? 'محمي بعناية' : 'Protégé avec soin',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-[var(--color-brand-primary)]">{item.icon}</span>
                    <span>
                      <span className="block text-xs font-semibold text-[var(--color-brand-text)]">
                        {item.title}
                      </span>
                      <span className="block text-[11px] leading-4 text-[var(--color-brand-text-muted)]">
                        {item.body}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-error)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-error)]" />
                  {isAr ? 'نفد المخزون' : 'Rupture de stock'}
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-warning)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-warning)]" />
                  {isAr
                    ? `${product.stock} قطع متبقية فقط`
                    : `Plus que ${product.stock} pièce${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-brand-success)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-success)]" />
                  {isAr ? 'متوفر في المخزون' : 'En stock'}
                </span>
              )}
            </div>

            {/* Short description */}
            {description && (
              <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed line-clamp-3">
                {description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                [isAr ? 'الأصل' : 'Origine', isAr ? 'حرف مغربية' : 'Artisanat marocain'],
                [isAr ? 'الدفع' : 'Paiement', isAr ? 'عند الاستلام' : 'À la livraison'],
                [isAr ? 'الدعم' : 'Support', isAr ? 'واتساب والهاتف' : 'WhatsApp & téléphone'],
                [isAr ? 'الإرجاع' : 'Retour', isAr ? '48 ساعة عند وجود مشكل' : '48h si problème'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-white px-3 py-2"
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-brand-text-subtle)]">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-brand-text)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full h-12 rounded-[var(--radius-btn)] bg-[var(--color-brand-surface-alt)] text-sm font-semibold text-[var(--color-brand-text-subtle)] cursor-not-allowed"
                >
                  {isAr ? 'نفد المخزون' : 'Rupture de stock'}
                </button>
              ) : (
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    nameFr: product.nameFr,
                    nameAr: product.nameAr,
                    price: product.price,
                    image: mainImage,
                  }}
                  size="lg"
                  fullWidth
                />
              )}

              {waHref && !isOutOfStock && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-center gap-2.5
                    w-full h-12
                    rounded-[var(--radius-btn)]
                    bg-[#25D366] hover:bg-[#1ebe5d]
                    text-white text-sm font-semibold
                    transition-colors duration-[var(--transition-base)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2
                  "
                >
                  <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {isAr ? 'طلب عبر واتساب' : 'Commander via WhatsApp'}
                </a>
              )}

              <p className="text-center text-[11px] leading-5 text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'بعد إضافة المنتج للسلة، يمكنك تأكيد الطلب بالدفع عند الاستلام.'
                  : 'Après ajout au panier, vous confirmez votre commande en paiement à la livraison.'}
              </p>
            </div>

            {/* Inline trust strip */}
            <div className="pt-4 border-t border-[var(--color-brand-border)]">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: <PackageCheck className="h-4 w-4" aria-hidden="true" />, label: isAr ? 'دفع عند التسليم' : 'Paiement livraison' },
                  { icon: <Phone className="h-4 w-4" aria-hidden="true" />, label: isAr ? 'تأكيد هاتفي' : 'Confirmation appel' },
                  { icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />, label: isAr ? 'إرجاع 48 ساعة' : 'Retours 48h' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1">
                    <span className="text-[var(--color-brand-primary)]">{item.icon}</span>
                    <span className="text-[10px] leading-tight text-[var(--color-brand-text-muted)]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DESCRIPTION ───────────────────────────────────────── */}
      {description && (
        <section className="bg-[var(--color-brand-surface-alt)] py-16 lg:py-24">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-10 lg:gap-20 items-start">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)] mb-3">
                  {isAr ? 'عن القطعة' : 'La pièce'}
                </p>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] leading-tight">
                  {name}
                </h2>
                <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-brand-text-subtle)]">
                  {isAr ? 'المرجع' : 'Réf.'} {product.slug.toUpperCase()}
                </p>
                {categoryName && (
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-brand-text-subtle)]">
                    {isAr ? 'الفئة' : 'Catégorie'} — {categoryName}
                  </p>
                )}
              </div>
              <div>
                <p className="font-[var(--font-display)] text-xl sm:text-2xl leading-relaxed text-[var(--color-brand-text-muted)]">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PROCESS ───────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-text)] py-16 lg:py-24">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-secondary)] mb-4">
            {isAr ? 'كيف يعمل' : 'Comment ça marche'}
          </p>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-white mb-14">
            {isAr ? 'من الطلب إلى بابك' : 'De la commande à votre porte'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {process.map((s) => (
              <div key={s.step}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/8 text-[var(--color-brand-secondary)]">
                    {s.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-white/15 leading-none">{s.step}</span>
                </div>
                <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEES ────────────────────────────────────────── */}
      <section className="zellige-texture bg-[var(--color-brand-surface-alt)] py-16 lg:py-20">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)] mb-3">
            {isAr ? 'ضماناتنا' : 'Nos garanties'}
          </p>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-10">
            {isAr ? 'اطمن، الطلب بلا مخاطر.' : 'Commandez sans risque.'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-brand-border)]">
            {guarantees.map((g) => (
              <div
                key={g.title}
                className="bg-[var(--color-brand-surface-elevated)] p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)] mb-5">
                  {g.icon}
                </div>
                <h3 className="font-[var(--font-display)] text-base font-bold text-[var(--color-brand-text)] mb-2">
                  {g.title}
                </h3>
                <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECS ─────────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-surface)] py-12 lg:py-16">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)] mb-8">
            {isAr ? 'معلومات المنتج' : 'Informations produit'}
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              [isAr ? 'المرجع' : 'Référence', product.slug.toUpperCase()],
              [isAr ? 'الفئة' : 'Catégorie', categoryName ?? '—'],
              [isAr ? 'الحالة' : 'Disponibilité', isOutOfStock ? (isAr ? 'غير متوفر' : 'Indisponible') : (isAr ? 'متوفر' : 'En stock')],
              [isAr ? 'الضمان' : 'Garantie', isAr ? 'إرجاع 48 ساعة' : 'Retours 48h'],
            ].map(([label, value]) => (
              <div key={label} className="border-t-2 border-[var(--color-brand-primary)] pt-4">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-brand-text-muted)] mb-1.5">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-[var(--color-brand-text)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[var(--color-brand-surface-alt)] py-16 lg:py-24">
          <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="hidden sm:inline text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-dark)] transition-colors"
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

      {/* ── STICKY MOBILE CTA ─────────────────────────────────── */}
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
