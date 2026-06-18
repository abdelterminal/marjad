import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatMAD } from '@/lib/money';
import { AddToCartButton } from './AddToCartButton';

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
  const isAr = locale === 'ar';
  const name = isAr ? product.nameAr : product.nameFr;
  const categoryName = product.category
    ? (isAr ? product.category.nameAr : product.category.nameFr)
    : null;
  const mainImage = (product.images ?? [])[0] ?? null;
  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="
      group relative flex flex-col
      bg-[var(--color-brand-surface-elevated)]
      rounded-[var(--radius-lg)]
      overflow-hidden
      border border-[var(--color-brand-border)]
      hover:border-[var(--color-brand-border-focus)]/30
      hover:shadow-[var(--shadow-md)]
      transition-all duration-300
    ">
      {/* Image — portrait 3:4 ratio, more editorial */}
      <Link
        href={`/products/${product.slug}`}
        className="
          block relative overflow-hidden
          aspect-[3/4]
          bg-[var(--color-brand-surface-alt)]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-inset
        "
        tabIndex={0}
        aria-label={name}
      >
        {mainImage ? (
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-end p-4"
            style={{
              background: 'linear-gradient(135deg, #F0EBE1 0%, #C4622D 100%)',
            }}
          >
            <span className="font-[var(--font-display)] text-4xl font-bold text-white/40 leading-none select-none">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Category pill — top-start */}
        {categoryName && (
          <span className="
            absolute top-2.5 start-2.5
            px-2 py-0.5
            rounded-[var(--radius-full)]
            bg-white/90 backdrop-blur-sm
            text-[11px] font-medium text-[var(--color-brand-text-muted)]
          ">
            {categoryName}
          </span>
        )}

        {/* Discount badge — top-end */}
        {hasDiscount && (
          <span className="
            absolute top-2.5 end-2.5
            px-2 py-0.5
            rounded-[var(--radius-full)]
            bg-[var(--color-brand-secondary)]
            text-white text-[11px] font-semibold
          ">
            {isAr ? 'تخفيض' : 'Promo'}
          </span>
        )}

        {/* Out-of-stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
            <span className="
              px-3 py-1
              rounded-[var(--radius-full)]
              bg-[var(--color-brand-error-light)]
              text-[var(--color-brand-error)] text-xs font-semibold
            ">
              {isAr ? 'نفد المخزون' : 'Épuisé'}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">

        {/* Product name */}
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 rounded-sm"
          tabIndex={-1}
          aria-hidden="true"
        >
          <h3 className="
            text-sm font-medium
            text-[var(--color-brand-text)]
            line-clamp-2 leading-snug
          ">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="price-display text-base font-bold text-[var(--color-brand-primary)]">
            {formatMAD(price)}
          </span>
          {hasDiscount && (
            <span className="price-display text-sm text-[var(--color-brand-text-subtle)] line-through">
              {formatMAD(compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to cart — visible on hover (desktop), always shown (mobile) */}
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
            className="
              w-full h-8
              rounded-[var(--radius-btn)]
              bg-[var(--color-brand-surface-alt)]
              text-xs font-semibold text-[var(--color-brand-text-subtle)]
              cursor-not-allowed
            "
          >
            {isAr ? 'نفد المخزون' : 'Rupture de stock'}
          </button>
        )}
      </div>
    </article>
  );
}
