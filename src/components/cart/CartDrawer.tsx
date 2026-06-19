'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { X, ShoppingBag, Minus, Plus, Banknote, Headphones, ShieldCheck, Truck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCartStore, CartItem } from '@/lib/cart-store';
import { formatMAD } from '@/lib/money';
import Image from 'next/image';
import { useIsClient } from '@/lib/use-is-client';

function CartLineItem({ item }: { item: CartItem }) {
  const t = useTranslations();
  const locale = useLocale();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const name = locale === 'ar' ? item.nameAr : item.nameFr;
  const unitPrice = parseFloat(item.price);
  const linePrice = unitPrice * item.quantity;

  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-3 shadow-[var(--shadow-xs)]">
      <div className="relative h-18 w-16 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-brand-surface-alt)] sm:h-20 sm:w-18">
        {item.image ? (
          <Image src={item.image} alt={name} fill className="object-cover" sizes="72px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[var(--color-brand-text-subtle)]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-2 leading-tight">
          {name}
        </p>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5 price-display">
          {formatMAD(unitPrice)}
        </p>

        <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
          <button
            onClick={() => setQty(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`${t('cart.decrease')} ${name}`}
            className="
              flex items-center justify-center
              min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px]
              rounded-full border border-[var(--color-brand-border)]
              text-[var(--color-brand-text-muted)]
              hover:border-[var(--color-brand-primary)]
              hover:text-[var(--color-brand-primary)]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-[var(--transition-fast)]
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
              min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px]
              rounded-full border border-[var(--color-brand-border)]
              text-[var(--color-brand-text-muted)]
              hover:border-[var(--color-brand-primary)]
              hover:text-[var(--color-brand-primary)]
              transition-colors duration-[var(--transition-fast)]
            "
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-xs sm:text-sm font-semibold text-[var(--color-brand-text)] price-display">
          {formatMAD(linePrice)}
        </p>
        <button
          onClick={() => remove(item.productId)}
          aria-label={`${t('cart.remove')} ${name}`}
          className="
            flex items-center justify-center
            min-w-[36px] min-h-[36px] -me-1
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

  const pathname = usePathname();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const subtotalFn = useCartStore((s) => s.subtotal);
  const itemCountFn = useCartStore((s) => s.itemCount);
  const items = useCartStore((s) => s.items);
  const mounted = useIsClient();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (pathname.includes('/checkout')) closeCart();
  }, [pathname, closeCart]);

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

  function handleDiscover() {
    closeCart();
    router.push('/products');
  }

  const assuranceItems = [
    {
      icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
      text: locale === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
    },
    {
      icon: <Headphones className="h-4 w-4" aria-hidden="true" />,
      text: locale === 'ar' ? 'تأكيد بالهاتف' : 'Confirmation par appel',
    },
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      text: locale === 'ar' ? 'توصيل 3-5 أيام' : 'Livraison 3-5 jours',
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => { if (!open) closeCart(); }}>
      <SheetContent
        side={side}
        showCloseButton={false}
        className="
          !w-[min(100vw,440px)] !max-w-none
          sm:!w-[440px]
          flex flex-col p-0
          bg-[var(--color-brand-surface)]
          border-[var(--color-brand-border)]
        "
      >
        {/* Header */}
        <SheetHeader className="px-5 py-5 border-b border-[var(--color-brand-border)] flex-shrink-0 bg-[var(--color-brand-surface-alt)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-brand-primary)]">
                MARJAD
              </p>
              <SheetTitle className="mt-1 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                {t('cart.title')}
                {mounted && itemCount > 0 && (
                  <span className="ms-2 text-sm font-normal text-[var(--color-brand-text-muted)]">
                    ({itemCount})
                  </span>
                )}
              </SheetTitle>
            </div>
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
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
                <ShoppingBag
                  className="w-9 h-9 text-[var(--color-brand-primary)]"
                  strokeWidth={1.4}
                />
              </div>
              <div>
                <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                  {t('common.emptyCart')}
                </p>
                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                  {locale === 'ar'
                    ? 'ابدأ بقطعة واحدة، وسنؤكد الطلب معك قبل الإرسال.'
                    : 'Commencez par une pièce, nous confirmerons la commande avant envoi.'}
                </p>
              </div>
              <button
                onClick={handleDiscover}
                className="
                  h-11 px-5 rounded-[var(--radius-btn)]
                  bg-[var(--color-brand-text)]
                  text-sm font-semibold text-white
                  hover:bg-[var(--color-brand-primary)]
                  transition-colors
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
            <div className="space-y-3 py-4">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="flex-shrink-0 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-4 py-4 sm:px-5 sm:py-5 space-y-3 sm:space-y-4">
            <div className="hidden sm:grid grid-cols-3 gap-2">
              {assuranceItems.map((item) => (
                <div key={item.text} className="rounded-[var(--radius-sm)] bg-[var(--color-brand-surface)] px-2 py-2 text-center">
                  <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-medium leading-tight text-[var(--color-brand-text-muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-[var(--color-brand-text-muted)] sm:hidden">
              {assuranceItems.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1">
                  <span className="text-[var(--color-brand-primary)]">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
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
            <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-success-light)] px-3 py-2 text-[11px] sm:text-xs leading-relaxed text-[var(--color-brand-success)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>
                {locale === 'ar'
                  ? 'لا تدفع الآن. سنؤكد الطلب بالهاتف قبل الإرسال.'
                  : "Aucun paiement maintenant. Nous confirmons par téléphone avant l'envoi."}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="
                w-full h-12
                rounded-[var(--radius-btn)]
                bg-[var(--color-brand-primary)]
                hover:bg-[var(--color-brand-primary-hover)]
                text-white text-sm font-semibold
                transition-all duration-[var(--transition-fast)] active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-primary)]
                focus-visible:ring-offset-2
              "
            >
              {t('common.checkout')}
            </button>

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
