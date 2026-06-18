import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatMAD } from '@/lib/money';
import { AddToCartButton } from './AddToCartButton';

// Matches the Product type returned from Drizzle queries
type ProductCardProduct = {
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

interface ProductCardProps {
  product: ProductCardProduct;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const name = locale === 'ar' ? product.nameAr : product.nameFr;
  const categoryName =
    product.category
      ? locale === 'ar'
        ? product.category.nameAr
        : product.category.nameFr
      : null;
  const mainImage = (product.images ?? [])[0] ?? null;
  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col bg-white rounded-[var(--radius-md)] border border-[var(--color-brand-border)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Image + badges */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-[var(--color-brand-surface-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-inset"
        tabIndex={0}
        aria-label={name}
      >
        {mainImage ? (
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-brand-surface-alt)]">
            <span className="text-[var(--color-brand-text-subtle)] text-xs">
              {locale === 'ar' ? 'لا توجد صورة' : 'Aucune image'}
            </span>
          </div>
        )}

        {/* Category badge (top-start) */}
        {categoryName && (
          <span className="absolute top-2 start-2 px-2 py-0.5 rounded-[var(--radius-full)] bg-white/90 text-xs font-medium text-[var(--color-brand-text-muted)] backdrop-blur-sm">
            {categoryName}
          </span>
        )}

        {/* Discount badge (top-end) */}
        {hasDiscount && (
          <span className="absolute top-2 end-2 px-2 py-0.5 rounded-[var(--radius-full)] bg-[var(--color-brand-secondary)] text-white text-xs font-semibold">
            {locale === 'ar' ? 'تخفيض' : 'Promo'}
          </span>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-brand-error-light)] text-[var(--color-brand-error)] text-xs font-semibold">
              {locale === 'ar' ? 'نفد المخزون' : 'Épuisé'}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 rounded"
          tabIndex={-1}
          aria-hidden="true"
        >
          <h3 className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="price-display text-base font-bold text-[var(--color-brand-text)]">
            {formatMAD(price)}
          </span>
          {hasDiscount && (
            <span className="price-display text-sm text-[var(--color-brand-text-muted)] line-through">
              {formatMAD(compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to cart — hidden on mobile (tap navigates), visible on desktop hover */}
        {!isOutOfStock && (
          <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                nameFr: product.nameFr,
                nameAr: product.nameAr,
                price: product.price,
                image: mainImage ?? undefined,

              }}
              size="sm"
              fullWidth
            />
          </div>
        )}

        {isOutOfStock && (
          <button
            disabled
            className="w-full h-8 rounded-[var(--radius-btn)] bg-[var(--color-brand-surface-alt)] text-xs font-semibold text-[var(--color-brand-text-subtle)] cursor-not-allowed"
          >
            {locale === 'ar' ? 'نفد المخزون' : 'Rupture de stock'}
          </button>
        )}
      </div>
    </article>
  );
}
