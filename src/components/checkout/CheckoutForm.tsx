'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Loader2, Banknote, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatMAD } from '@/lib/money';
import { createOrderSchema } from '@/lib/validators';
import type { z } from 'zod';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

type OrderFormData = Omit<z.infer<typeof createOrderSchema>, 'items'>;

export function CheckoutForm() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState(useCartStore.getState().items);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
    const unsub = useCartStore.subscribe((state) => {
      setItems([...state.items]);
    });
    setItems([...useCartStore.getState().items]);
    return unsub;
  }, []);

  const subtotal = mounted
    ? items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    : 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OrderFormData>({
    resolver: zodResolver(
      createOrderSchema.omit({ items: true }),
    ),
  });

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setValue('customerName', session.user.name);
    }
  }, [session, setValue]);

  // Redirect if cart empty (after hydration)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/products' as '/');
    }
  }, [mounted, items.length, router]);

  async function onSubmit(data: OrderFormData) {
    setSubmitError(null);
    setStockError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const json = await res.json();

      if (res.status === 409) {
        setStockError(
          isAr
            ? `المنتج غير متوفر بالكمية الكافية.`
            : `Le produit n'est plus disponible en quantité suffisante.`,
        );
        return;
      }

      if (!res.ok) {
        setSubmitError(
          isAr
            ? 'حدث خطأ، يرجى المحاولة مرة أخرى.'
            : 'Une erreur est survenue. Veuillez réessayer.',
        );
        return;
      }

      useCartStore.getState().clear();
      router.push(`/checkout/confirmation/${json.orderId}` as '/');
    } catch {
      setSubmitError(
        isAr
          ? 'حدث خطأ، يرجى المحاولة مرة أخرى.'
          : 'Une erreur est survenue. Veuillez réessayer.',
      );
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text)] placeholder:text-[var(--color-brand-text-subtle)] focus:outline-none focus:border-[var(--color-brand-border-focus)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-60 transition-colors';

  const errorInputClass = 'border-[var(--color-brand-border-error)] bg-[var(--color-brand-error-light)] focus:border-[var(--color-brand-border-error)]';

  const labelClass = 'block text-sm font-medium text-[var(--color-brand-text)] mb-1.5';

  if (!mounted) return null;

  return (
    <div className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-[var(--color-brand-text)] mb-8">
        {isAr ? 'إتمام الطلب' : 'Passer commande'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="order-2 lg:order-1">
          {/* Error banners */}
          {submitError && (
            <div role="alert" className="mb-4 p-4 rounded-[var(--radius-sm)] bg-[var(--color-brand-error-light)] border-s-[3px] border-[var(--color-brand-error)] flex items-start gap-3 text-sm text-[var(--color-brand-error)]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {stockError && (
            <div role="alert" className="mb-4 p-4 rounded-[var(--radius-sm)] bg-[var(--color-brand-error-light)] border-s-[3px] border-[var(--color-brand-error)] flex items-start gap-3 text-sm text-[var(--color-brand-error)]">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {stockError}
            </div>
          )}

          {/* Section: Delivery info */}
          <h2 className="text-base font-semibold text-[var(--color-brand-text)] mb-4">
            {isAr ? 'معلومات التوصيل' : 'Informations de livraison'}
          </h2>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className={labelClass} htmlFor="customerName">
                {isAr ? 'الاسم الكامل' : 'Nom complet'}
                <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
              </label>
              <input
                id="customerName"
                {...register('customerName')}
                disabled={isSubmitting}
                autoComplete="name"
                className={[inputClass, errors.customerName ? errorInputClass : ''].join(' ')}
              />
              {errors.customerName && (
                <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass} htmlFor="customerPhone">
                {isAr ? 'رقم الهاتف' : 'Téléphone'}
                <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
              </label>
              <input
                id="customerPhone"
                type="tel"
                dir="ltr"
                {...register('customerPhone')}
                disabled={isSubmitting}
                autoComplete="tel"
                placeholder="0612345678"
                className={[inputClass, errors.customerPhone ? errorInputClass : ''].join(' ')}
              />
              {errors.customerPhone ? (
                <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isAr
                    ? 'رقم غير صحيح. أدخل رقما مغربيا (مثال: 0612345678)'
                    : 'Numéro invalide. Entrez un numéro marocain (ex: 0612345678)'}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--color-brand-text-muted)]">
                  {isAr ? 'مثال: 0612345678' : 'Ex: 0612345678'}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className={labelClass} htmlFor="city">
                {isAr ? 'المدينة' : 'Ville'}
                <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
              </label>
              <input
                id="city"
                {...register('city')}
                disabled={isSubmitting}
                autoComplete="address-level2"
                className={[inputClass, errors.city ? errorInputClass : ''].join(' ')}
              />
              {errors.city && (
                <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className={labelClass} htmlFor="address">
                {isAr ? 'عنوان التوصيل' : 'Adresse de livraison'}
                <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
              </label>
              <textarea
                id="address"
                rows={3}
                {...register('address')}
                disabled={isSubmitting}
                autoComplete="street-address"
                className={[inputClass, 'min-h-[80px] resize-y py-2', errors.address ? errorInputClass : ''].join(' ')}
              />
              {errors.address && (
                <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass} htmlFor="notes">
                {isAr ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                disabled={isSubmitting}
                className={[inputClass, 'min-h-[60px] resize-y py-2'].join(' ')}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-6 mb-6">
            <h2 className="text-base font-semibold text-[var(--color-brand-text)] mb-3">
              {isAr ? 'طريقة الدفع' : 'Paiement'}
            </h2>
            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-white">
              <Banknote className="w-5 h-5 text-[var(--color-brand-primary)] flex-shrink-0" />
              <span className="text-sm font-medium text-[var(--color-brand-text)]">
                {isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
              </span>
              <span className="ms-auto text-xs text-[var(--color-brand-text-muted)]">
                {isAr ? 'COD' : 'COD'}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-[var(--radius-btn)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isAr ? 'تأكيد الطلب' : 'Passer la commande'}
          </button>
        </form>

        {/* Order summary */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-[80px] rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-6">
            <h2 className="text-base font-semibold text-[var(--color-brand-text)] mb-4">
              {isAr ? 'ملخص الطلب' : 'Récapitulatif'}
            </h2>

            {items.map((item) => {
              const name = locale === 'ar' ? item.nameAr : item.nameFr;
              const lineTotal = parseFloat(item.price) * item.quantity;
              return (
                <div
                  key={item.productId}
                  className="flex gap-3 py-3 border-b border-[var(--color-brand-border)] last:border-b-0"
                >
                  <div className="relative flex-shrink-0 w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden bg-white">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-brand-surface-alt)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-2">
                      {name}
                    </p>
                    <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5">
                      {isAr ? `الكمية: ${item.quantity}` : `Qté: ${item.quantity}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-brand-text)] price-display flex-shrink-0">
                    {formatMAD(lineTotal)}
                  </span>
                </div>
              );
            })}

            <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-brand-text-muted)]">
                  {isAr ? 'المجموع الفرعي' : 'Sous-total'}
                </span>
                <span className="font-medium price-display">{formatMAD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-brand-text-muted)]">
                  {isAr ? 'التوصيل' : 'Livraison'}
                </span>
                <span className="font-medium text-[var(--color-brand-success)]">
                  {isAr ? 'مجاني' : 'Gratuite'}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-[var(--color-brand-border)]">
                <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="price-display">{formatMAD(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
