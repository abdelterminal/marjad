'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
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
  isOutOfStock: boolean;
  waHref: string | null;
  isAr: boolean;
}

export function ProductCTA({ product, isOutOfStock, waHref, isAr }: Props) {
  const [qty, setQty] = useState(1);

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="h-12 w-full cursor-not-allowed rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] text-sm font-semibold text-[var(--color-brand-text-subtle)]"
      >
        {isAr ? 'نفد المخزون' : 'Rupture de stock'}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Qty selector + Add to cart */}
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-1.5">
        <div className="flex h-11 shrink-0 items-center rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label={isAr ? 'تقليل الكمية' : 'Diminuer'}
            className="flex h-full w-10 items-center justify-center rounded-s-[var(--radius-btn)] text-[var(--color-brand-text-muted)] transition-colors hover:bg-[var(--color-brand-surface-alt)] hover:text-[var(--color-brand-text)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-semibold text-[var(--color-brand-text)]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label={isAr ? 'زيادة الكمية' : 'Augmenter'}
            className="flex h-full w-10 items-center justify-center rounded-e-[var(--radius-btn)] text-[var(--color-brand-text-muted)] transition-colors hover:bg-[var(--color-brand-surface-alt)] hover:text-[var(--color-brand-text)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <AddToCartButton product={product} quantity={qty} size="lg" fullWidth />
      </div>

      {/* WhatsApp — outline style */}
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center justify-center gap-2.5
            w-full h-12
            rounded-[var(--radius-btn)]
            border border-[var(--color-brand-border)]
            bg-[var(--color-brand-surface-elevated)]
            text-[var(--color-brand-text)] text-sm font-semibold
            shadow-[var(--shadow-sm)]
            transition-all duration-150
            hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)]/40 hover:text-[var(--color-brand-primary)] hover:shadow-[var(--shadow-md)]
          "
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {isAr ? 'الطلب عبر واتساب' : 'Commander sur WhatsApp'}
        </a>
      )}
    </div>
  );
}
