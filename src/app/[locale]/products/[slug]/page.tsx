import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/lib/queries/products';
import { formatMAD } from '@/lib/money';
import { Gallery } from '@/components/product/Gallery';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { ChevronRight } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
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
    ? isAr
      ? product.category.nameAr
      : product.category.nameFr
    : null;

  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const isOutOfStock = product.stock <= 0;

  const mainImage = product.images?.[0] ?? undefined;

  return (
    <main className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav aria-label={isAr ? 'مسار التنقل' : 'Fil d\'Ariane'} className="flex items-center gap-1 text-xs text-[var(--color-brand-text-muted)] mb-6">
        <Link
          href="/"
          className="hover:text-[var(--color-brand-primary)] transition-colors"
        >
          {isAr ? 'الرئيسية' : 'Accueil'}
        </Link>
        <ChevronRight className="w-3 h-3 rtl:rotate-180 flex-shrink-0" aria-hidden="true" />
        {categoryName && product.category && (
          <>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-[var(--color-brand-primary)] transition-colors"
            >
              {categoryName}
            </Link>
            <ChevronRight className="w-3 h-3 rtl:rotate-180 flex-shrink-0" aria-hidden="true" />
          </>
        )}
        <span className="text-[var(--color-brand-text)] truncate max-w-[200px]">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">
        {/* Gallery */}
        <Gallery images={product.images ?? []} productName={name} />

        {/* Product info */}
        <div className="lg:sticky lg:top-[80px] lg:self-start">
          {/* Category badge */}
          {categoryName && (
            <span className="inline-block px-2.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)] text-xs font-medium mb-3">
              {categoryName}
            </span>
          )}

          {/* Product name */}
          <h1 className="text-[var(--text-h1)] font-[var(--font-display)] font-bold text-[var(--color-brand-text)] leading-tight">
            {name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-4">
            <span className="price-display text-2xl font-bold text-[var(--color-brand-text)]">
              {formatMAD(price)}
            </span>
            {hasDiscount && (
              <span className="price-display text-base text-[var(--color-brand-text-muted)] line-through">
                {formatMAD(compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand-error)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-error)]" />
                {isAr ? 'نفد المخزون' : 'Rupture de stock'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand-success)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-success)]" />
                {isAr ? 'متوفر في المخزون' : 'En stock'}
                {product.stock <= 5 && (
                  <span className="text-[var(--color-brand-warning)] ms-1">
                    ({isAr ? `${product.stock} متبقي` : `${product.stock} restant${product.stock > 1 ? 's' : ''}`})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mt-5 text-sm text-[var(--color-brand-text-muted)] leading-relaxed">
              {description}
            </p>
          )}

          {/* Separator */}
          <div className="border-t border-[var(--color-brand-border)] my-6" />

          {/* Add to cart */}
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
        </div>
      </div>
    </main>
  );
}
