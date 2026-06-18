'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface AddToCartButtonProps {
  product: {
    id: number;
    slug: string;
    nameFr: string;
    nameAr: string;
    price: string;
    image?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function AddToCartButton({
  product,
  className = '',
  size = 'md',
  fullWidth = false,
}: AddToCartButtonProps) {
  const locale = useLocale();
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.openCart);

  const [state, setState] = useState<'idle' | 'adding' | 'added'>('idle');

  const label = locale === 'ar' ? 'أضف' : 'Ajouter';
  const addedLabel = locale === 'ar' ? 'أُضيف ✓' : 'Ajouté ✓';

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }[size];

  async function handleAdd() {
    if (state !== 'idle') return;
    setState('adding');

    add(
      {
        productId: product.id,
        slug: product.slug,
        nameFr: product.nameFr,
        nameAr: product.nameAr,
        price: product.price,
        image: product.image,
      },
      1,
    );

    // Brief 300ms visual feedback
    await new Promise((r) => setTimeout(r, 300));
    setState('added');
    openCart();

    // Reset after 2s
    await new Promise((r) => setTimeout(r, 2000));
    setState('idle');
  }

  return (
    <button
      onClick={handleAdd}
      disabled={state === 'adding'}
      aria-label={
        locale === 'ar'
          ? `أضف ${product.nameAr} إلى السلة`
          : `Ajouter ${product.nameFr} au panier`
      }
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-[var(--radius-btn)]',
        'font-semibold',
        'transition-all duration-[var(--transition-fast)]',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        state === 'added'
          ? 'bg-[var(--color-brand-success)] hover:bg-[var(--color-brand-success)] text-white'
          : 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white',
        sizeClasses,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {state === 'adding' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : state === 'added' ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingBag className="w-4 h-4" />
      )}
      {state === 'added' ? addedLabel : label}
    </button>
  );
}
