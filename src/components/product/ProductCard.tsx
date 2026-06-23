'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { formatMAD } from '@/lib/money';
import { AddToCartButton } from './AddToCartButton';

/* Hallmark · component: product card · genre: luxury ecommerce · theme: custom/MARJAD
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */

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
  const images = product.images ?? [];
  const mainImage = images[0] ?? null;
  const hoverImage = images[1] ?? null;
  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const isOutOfStock = product.stock <= 0;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : 0;

  const [wishlisted, setWishlisted] = useState(false);

  return (
    <article className="
      group relative flex flex-col interactive-lift
      bg-[var(--color-brand-surface-elevated)]
      rounded-[var(--radius-md)]
      overflow-hidden
    ">
      <Link
        href={`/products/${product.slug}`}
        className="
          block relative overflow-hidden
          aspect-[4/5]
          bg-[var(--color-brand-surface-alt)]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-inset
        "
        tabIndex={0}
        aria-label={name}
      >
        {mainImage ? (
          <>
            <Image
              src={mainImage}
              alt={name}
              fill
              className={`object-cover transition-all duration-700 ${hoverImage ? 'group-hover:opacity-0 group-hover:scale-[1.04]' : 'group-hover:scale-[1.035]'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${name} — vue 2`}
                fill
                className="object-cover opacity-0 scale-[1.04] group-hover:opacity-100 group-hover:scale-100 transition-all duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-end bg-[linear-gradient(135deg,var(--color-brand-surface-alt)_0%,var(--color-brand-primary)_100%)] p-4">
            <span className="font-[var(--font-display)] text-4xl font-bold text-white/40 leading-none select-none">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setWishlisted((w) => !w); }}
          aria-label={isAr ? 'أضف إلى المفضلة' : 'Ajouter aux favoris'}
          className="
            absolute top-2.5 end-2.5 z-10
            flex items-center justify-center
            w-8 h-8 rounded-full
            bg-white/80 backdrop-blur-sm
            opacity-0 group-hover:opacity-100
            translate-y-1 group-hover:translate-y-0
            transition-all duration-300
            hover:bg-white
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--color-brand-primary)]
          "
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-[var(--color-brand-primary)] text-[var(--color-brand-primary)]' : 'text-[var(--color-brand-text-muted)]'}`}
          />
        </button>

        {categoryName && (
          <span className="
            absolute top-2.5 start-2.5
            px-2.5 py-1
            rounded-[var(--radius-full)]
            bg-white/85 backdrop-blur-sm
            text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-brand-text-muted)]
          ">
            {categoryName}
          </span>
        )}

        {hasDiscount && (
          <span className="
            absolute top-12 end-2.5
            px-2.5 py-1
            rounded-[var(--radius-full)]
            bg-[var(--color-brand-text)]
            text-white text-[10px] font-semibold
          ">
            -{discountPercent}%
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px] flex items-center justify-center">
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

      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2.5 sm:gap-3">
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1 rounded-sm"
          tabIndex={-1}
          aria-hidden="true"
        >
          <h3 className="
            text-[13px] sm:text-sm font-medium
            text-[var(--color-brand-text)]
            line-clamp-2 leading-snug sm:min-h-[2.5rem]
          ">
            {name}
          </h3>
        </Link>

        <div className="mt-auto space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="price-display text-base sm:text-lg font-bold text-[var(--color-brand-text)]">
                {formatMAD(price)}
              </span>
              {hasDiscount && (
                <span className="price-display text-xs text-[var(--color-brand-text-subtle)] line-through">
                  {formatMAD(compareAtPrice!)}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-[10px] font-medium text-[var(--color-brand-text-subtle)]">
              {isAr ? 'COD' : 'COD'}
            </span>
          </div>

          <p className="hidden sm:block text-[11px] leading-snug text-[var(--color-brand-text-muted)]">
            {isAr ? 'الدفع عند الاستلام، تأكيد بالهاتف.' : 'Paiement à la livraison, confirmation par appel.'}
          </p>

          {!isOutOfStock && (
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
          )}

          {isOutOfStock && (
            <button
              disabled
              className="
                w-full h-9
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
      </div>
    </article>
  );
}
