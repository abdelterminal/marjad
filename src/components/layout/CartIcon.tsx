'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export function CartIcon() {
  const openCart = useCartStore((s) => s.openCart);
  const itemCountFn = useCartStore((s) => s.itemCount);

  // Hydration-safe: only show count after mount
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Rehydrate persisted cart from localStorage
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCount(itemCountFn());
    }
  });

  return (
    <button
      onClick={openCart}
      aria-label={mounted && count > 0 ? `Panier, ${count} articles` : 'Panier'}
      className="
        relative inline-flex items-center justify-center
        min-w-[44px] min-h-[44px]
        text-[var(--color-brand-text)]
        hover:text-[var(--color-brand-primary)]
        transition-colors duration-[var(--transition-fast)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-brand-primary)]
        focus-visible:ring-offset-2
        rounded-md
      "
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {mounted && count > 0 && (
        <span
          aria-hidden="true"
          className="
            absolute -top-1 -end-1
            flex items-center justify-center
            min-w-[18px] h-[18px] px-1
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
