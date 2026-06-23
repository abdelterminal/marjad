'use client';

import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Banknote, CheckCircle2, Truck } from 'lucide-react';
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

export function StickyMobileCTA({ product, formattedPrice, isOutOfStock }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (isOutOfStock) return null;

  const name = isAr ? product.nameAr : product.nameFr;

  const trusts = [
    {
      icon: <Banknote className="h-4 w-4" />,
      label: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: isAr ? 'تأكيد قبل الإرسال' : 'Confirmation avant envoi',
    },
    {
      icon: <Truck className="h-4 w-4" />,
      label: isAr ? 'توصيل داخل المغرب' : 'Livraison au Maroc',
    },
  ];

  return (
    <aside
      aria-label={isAr ? 'إضافة المنتج إلى السلة' : 'Ajouter le produit au panier'}
      className="
      fixed bottom-0 inset-x-0 z-40 lg:hidden
      border-t border-[var(--color-brand-border)]
      bg-[var(--color-brand-surface-elevated)]/95 backdrop-blur-md
      px-4
      py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
      shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
    ">
      <div className="mx-auto flex max-w-[var(--container-content)] items-center gap-4">

        {/* Thumbnail + name + price */}
        <div className="flex shrink-0 items-center gap-3">
          {product.image && (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--color-brand-border)]">
              <Image src={product.image} alt={name} fill className="object-cover" sizes="44px" />
            </div>
          )}
          <div className="min-w-0 hidden sm:block">
            <p className="max-w-[140px] truncate text-xs font-semibold text-[var(--color-brand-text)]">{name}</p>
            <p className="price-display text-sm font-bold text-[var(--color-brand-primary)]">{formattedPrice}</p>
          </div>
          {/* Mobile: price only */}
          <p className="price-display text-sm font-bold text-[var(--color-brand-primary)] sm:hidden">{formattedPrice}</p>
        </div>

        {/* Trust items — center, hidden on small mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          {trusts.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[var(--color-brand-text-muted)]">
              <span className="text-[var(--color-brand-primary)]">{t.icon}</span>
              <span className="text-[11px] font-medium">{t.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ms-auto shrink-0">
          <AddToCartButton product={product} size="md" />
        </div>

      </div>
    </aside>
  );
}
