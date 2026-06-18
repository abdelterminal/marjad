'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { X, ShoppingBag, Minus, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCartStore, CartItem } from '@/lib/cart-store';
import { formatMAD } from '@/lib/money';
import Image from 'next/image';

function CartLineItem({ item }: { item: CartItem }) {
  const t = useTranslations();
  const locale = useLocale();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const name = locale === 'ar' ? item.nameAr : item.nameFr;
  const unitPrice = parseFloat(item.price);
  const linePrice = unitPrice * item.quantity;

  return (
    <div className="flex gap-3 py-4 border-b border-[var(--color-brand-border)] last:border-b-0">
      {/* Thumbnail */}
      <div
        className="
          relative flex-shrink-0
          w-16 h-16
          rounded-[var(--radius-sm)]
          bg-[var(--color-brand-surface-alt)]
          overflow-hidden
        "
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[var(--color-brand-text-subtle)]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-2 leading-tight">
          {name}
        </p>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5 price-display">
          {formatMAD(unitPrice)}
        </p>

        {/* Qty stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setQty(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`${t('cart.decrease')} ${name}`}
            className="
              flex items-center justify-center
              w-7 h-7 min-w-[44px] min-h-[44px]
              rounded-md border border-[var(--color-brand-border)]
              text-[var(--color-brand-text-muted)]
              hover:border-[var(--color-brand-primary)]
              hover:text-[var(--color-brand-primary)]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-[var(--transition-fast)]
              -mx-2
            "
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-sm font-medium text-[var(--color-brand-text)]">
            {item.quantity}
          </span>
          <button
            onClick={() => setQty(item.productId, item.quantity + 1)}
            aria-label={`${t('cart.increase')} ${name}`}
            className="
              flex items-center justify-center
              w-7 h-7 min-w-[44px] min-h-[44px]
              rounded-md border border-[var(--color-brand-border)]
              text-[var(--color-brand-text-muted)]
              hover:border-[var(--color-brand-primary)]
              hover:text-[var(--color-brand-primary)]
              transition-colors duration-[var(--transition-fast)]
              -mx-2
            "
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Line price + remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-sm font-semibold text-[var(--color-brand-text)] price-display">
          {formatMAD(linePrice)}
        </p>
        <button
          onClick={() => remove(item.productId)}
          aria-label={`${t('cart.remove')} ${name}`}
          className="
            flex items-center justify-center
            min-w-[44px] min-h-[44px] -me-1
            text-[var(--color-brand-text-muted)]
            hover:text-[var(--color-brand-error)]
            transition-colors duration-[var(--transition-fast)]
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const subtotalFn = useCartStore((s) => s.subtotal);
  const itemCountFn = useCartStore((s) => s.itemCount);

  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(useCartStore.getState().items);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
    // Subscribe to store changes
    const unsub = useCartStore.subscribe((state) => {
      setItems([...state.items]);
    });
    // Initial sync
    setItems([...useCartStore.getState().items]);
    return unsub;
  }, []);

  const subtotal = mounted ? subtotalFn() : 0;
  const itemCount = mounted ? itemCountFn() : 0;

  // RTL: drawer comes from left; LTR: from right
  const side = locale === 'ar' ? 'left' : 'right';

  function handleCheckout() {
    closeCart();
    router.push(`/checkout`);
  }

  function handleContinue() {
    closeCart();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => { if (!open) closeCart(); }}>
      <SheetContent
        side={side}
        className="
          w-full sm:max-w-md
          flex flex-col p-0
          bg-[var(--color-brand-surface)]
          border-[var(--color-brand-border)]
        "
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-[var(--color-brand-border)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-[var(--color-brand-text)]">
              {t('cart.title')}
              {mounted && itemCount > 0 && (
                <span className="ms-2 text-sm font-normal text-[var(--color-brand-text-muted)]">
                  ({itemCount})
                </span>
              )}
            </SheetTitle>
            <button
              onClick={closeCart}
              aria-label={t('cart.close')}
              className="
                flex items-center justify-center
                min-w-[44px] min-h-[44px]
                text-[var(--color-brand-text-muted)]
                hover:text-[var(--color-brand-text)]
                transition-colors duration-[var(--transition-fast)]
                -me-2
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {!mounted || items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
              <ShoppingBag
                className="w-16 h-16 text-[var(--color-brand-border)]"
                strokeWidth={1}
              />
              <p className="text-base font-medium text-[var(--color-brand-text-muted)]">
                {t('common.emptyCart')}
              </p>
              <button
                onClick={handleContinue}
                className="
                  text-sm font-semibold
                  text-[var(--color-brand-primary)]
                  hover:underline
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--color-brand-primary)]
                  focus-visible:ring-offset-2
                  rounded
                "
              >
                {t('cart.discoverProducts')}
              </button>
            </div>
          ) : (
            /* Items list */
            <div>
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="flex-shrink-0 border-t border-[var(--color-brand-border)] px-5 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-brand-text-muted)]">
                {t('cart.subtotal')}
              </span>
              <span className="text-base font-bold text-[var(--color-brand-text)] price-display">
                {formatMAD(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-brand-text-muted)]">
              <span>{t('cart.shipping')}</span>
              <span>{t('cart.shippingValue')}</span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="
                w-full h-12
                rounded-[var(--radius-btn)]
                bg-[var(--color-brand-primary)]
                hover:bg-[var(--color-brand-primary-hover)]
                text-white text-sm font-semibold
                transition-colors duration-[var(--transition-fast)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-primary)]
                focus-visible:ring-offset-2
              "
            >
              {t('common.checkout')}
            </button>

            {/* Continue shopping */}
            <button
              onClick={handleContinue}
              className="
                w-full text-center text-sm
                text-[var(--color-brand-text-muted)]
                hover:text-[var(--color-brand-primary)]
                transition-colors duration-[var(--transition-fast)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-primary)]
                focus-visible:ring-offset-2
                rounded py-1
              "
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
