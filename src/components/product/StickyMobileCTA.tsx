'use client';

import { useLocale } from 'next-intl';
import { AddToCartButton } from './AddToCartButton';

interface Props {
  product: {
    id: number;
    slug: string;
    nameFr: string;
    nameAr: string;
    price: string;
    image?: string;
  };
  formattedPrice: string;
  isOutOfStock: boolean;
  lowStockLabel?: string;
}

export function StickyMobileCTA({ product, formattedPrice, isOutOfStock, lowStockLabel }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (isOutOfStock) return null;

  return (
    <div className="
      lg:hidden fixed bottom-0 inset-x-0 z-40
      bg-[var(--color-brand-surface-elevated)]
      border-t border-[var(--color-brand-border)]
      px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3
      shadow-[var(--shadow-lg)]
    ">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[var(--color-brand-text-muted)] truncate">
            {isAr ? product.nameAr : product.nameFr}
          </p>
          <p className="price-display text-base font-bold text-[var(--color-brand-text)] leading-tight">
            {formattedPrice}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-primary)]">
            COD
          </p>
          <p className="text-[10px] text-[var(--color-brand-text-muted)]">
            {lowStockLabel ?? (isAr ? '3–5 أيام' : '3–5 jours')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden min-w-0 flex-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-surface-alt)] px-3 py-2 text-[10px] leading-4 text-[var(--color-brand-text-muted)] min-[390px]:block">
          {isAr ? 'تأكيد بالهاتف قبل الإرسال' : "Appel de confirmation avant l'envoi"}
        </div>
        <AddToCartButton product={product} size="md" fullWidth className="flex-1" />
      </div>
    </div>
  );
}
