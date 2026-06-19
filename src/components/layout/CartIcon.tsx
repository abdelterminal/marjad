'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useIsClient } from '@/lib/use-is-client';

export function CartIcon() {
  const t = useTranslations();
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const mounted = useIsClient();
  const count = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const label = t('common.cart');

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <button
      onClick={openCart}
      aria-label={mounted && count > 0 ? `${label}, ${count}` : label}
      className="
        relative inline-flex items-center justify-center gap-2
        min-h-[44px] px-2.5 sm:px-3.5
        rounded-[var(--radius-pill)]
        border border-[var(--color-brand-border)]
        bg-[var(--color-brand-surface-elevated)]
        shadow-[var(--shadow-xs)]
        text-[var(--color-brand-text)]
        hover:border-[var(--color-brand-primary)]/40
        hover:bg-[var(--color-brand-primary-light)]
        hover:text-[var(--color-brand-primary)]
        transition-all duration-[var(--transition-fast)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-brand-primary)]
        focus-visible:ring-offset-2
      "
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      <span className="hidden sm:inline text-xs font-semibold">
        {label}
      </span>
      {mounted && count > 0 && (
        <span
          aria-hidden="true"
          className="
            absolute -top-1.5 -end-1.5
            flex items-center justify-center
            min-w-[19px] h-[19px] px-1
            rounded-full
            bg-[var(--color-brand-primary)]
            text-white text-[10px] font-bold
            leading-none
          "
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
