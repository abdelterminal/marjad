'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useCartToast } from '@/components/ui/cart-toast';
import { trackAddToCart } from '@/lib/analytics';

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
  quantity?: number;
}

export function AddToCartButton({
  product,
  className = '',
  size = 'md',
  fullWidth = false,
  quantity = 1,
}: AddToCartButtonProps) {
  const locale = useLocale();
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.openCart);
  const toast = useCartToast();

  const [state, setState] = useState<'idle' | 'adding' | 'added'>('idle');

  const label = locale === 'ar' ? 'أضف إلى السلة' : 'Ajouter au panier';
  const addingLabel = locale === 'ar' ? 'جارٍ الإضافة' : 'Ajout en cours';
  const addedLabel = locale === 'ar' ? 'أُضيف' : 'Ajouté';
  const buttonLabel = state === 'adding' ? addingLabel : state === 'added' ? addedLabel : label;
  const accessibleLabel =
    state === 'idle'
      ? locale === 'ar'
        ? `أضف ${product.nameAr} إلى السلة`
        : `Ajouter ${product.nameFr} au panier`
      : `${buttonLabel}: ${locale === 'ar' ? product.nameAr : product.nameFr}`;

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
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
      quantity,
    );
    trackAddToCart({
      productId: product.id,
      slug: product.slug,
      name: locale === 'ar' ? product.nameAr : product.nameFr,
      price: parseFloat(product.price),
      quantity,
    });

    // Brief 300ms visual feedback
    await new Promise((r) => setTimeout(r, 300));
    setState('added');
    toast.show({
      title: locale === 'ar' ? product.nameAr : product.nameFr,
      imageUrl: product.image,
    });
    openCart();

    // Reset after 2s
    await new Promise((r) => setTimeout(r, 2000));
    setState('idle');
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={state !== 'idle'}
      aria-busy={state === 'adding'}
      aria-label={accessibleLabel}
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-[var(--radius-btn)]',
        'font-semibold',
        'transition-all duration-[var(--transition-base)] active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        state === 'added'
          ? 'bg-[var(--color-brand-success)] hover:bg-[var(--color-brand-success)] text-white disabled:opacity-100'
          : 'bg-[var(--color-brand-text)] hover:bg-[var(--color-brand-primary)] text-white shadow-[var(--shadow-xs)]',
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
      <span aria-live="polite">{buttonLabel}</span>
    </button>
  );
}
