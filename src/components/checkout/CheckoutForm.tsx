'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Loader2, Banknote, AlertCircle, Clock3, PhoneCall, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatMAD } from '@/lib/money';
import { createOrderSchema } from '@/lib/validators';
import type { z } from 'zod';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useIsClient } from '@/lib/use-is-client';
import { trackCheckoutStart, trackOrderSubmitted } from '@/lib/analytics';

type OrderFormData = Omit<z.infer<typeof createOrderSchema>, 'items'>;

export function CheckoutForm() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const { data: session } = useSession();

  const mounted = useIsClient();
  const items = useCartStore((state) => state.items);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const checkoutTrackedRef = useRef(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const subtotal = mounted
    ? items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    : 0;
  const itemCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  useEffect(() => {
    if (!mounted || checkoutTrackedRef.current || items.length === 0) return;
    checkoutTrackedRef.current = true;
    trackCheckoutStart({
      value: items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: locale === 'ar' ? item.nameAr : item.nameFr,
        price: parseFloat(item.price),
        quantity: item.quantity,
      })),
    });
  }, [items, locale, mounted]);

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

      trackOrderSubmitted({
        orderId: Number(json.orderId),
        value: subtotal,
        itemCount,
        paymentMethod: 'cod',
      });
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

  const inputClass = 'form-input';
  const textareaClass = 'form-textarea';
  const errorInputClass = 'form-input-error';
  const labelClass = 'form-label';
  const checkoutSteps = [
    {
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'اتصال للتأكيد' : 'Appel de confirmation',
      body: isAr ? 'نتصل بك خلال 24 ساعة لتأكيد الطلب والعنوان.' : "Nous vous appelons sous 24h pour confirmer l'adresse.",
    },
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'تحضير وتوصيل' : 'Préparation et livraison',
      body: isAr ? 'نغلف القطع بعناية ونرسلها إلى باب منزلك.' : "Les pièces sont emballées puis livrées à domicile.",
    },
    {
      icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'الدفع عند الوصول' : "Paiement à l'arrivée",
      body: isAr ? 'تدفع فقط عندما تستلم الطلب.' : 'Vous payez uniquement à la réception.',
    },
  ];

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[var(--container-sm)] px-4 py-16 sm:px-6 lg:py-24">
        <div className="page-enter rounded-[var(--radius-md)] bg-[var(--color-brand-surface-elevated)] p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
            <ShoppingBag className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
            {isAr ? 'السلة فارغة' : 'Panier vide'}
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold text-[var(--color-brand-text)]">
            {isAr ? 'اختر قطعة قبل إتمام الطلب.' : 'Choisissez une pièce avant de commander.'}
          </h1>
          <p className="mx-auto mt-3 max-w-[420px] text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'أضف منتجاً إلى السلة، ثم عد إلى صفحة الطلب. سنؤكد كل شيء معك بالهاتف قبل الإرسال.'
              : 'Ajoutez un produit au panier, puis revenez ici. Nous confirmerons tout par téléphone avant l’envoi.'}
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
          >
            {isAr ? 'اكتشف المجموعة' : 'Découvrir la collection'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 rounded-[var(--radius-md)] bg-[var(--color-brand-surface-alt)] p-5 sm:p-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
          {isAr ? 'طلب آمن' : 'Commande sécurisée'}
        </p>
        <h1 className="mt-2 font-[var(--font-display)] text-2xl sm:text-3xl font-bold leading-tight text-[var(--color-brand-text)]">
          {isAr ? 'أكمل الطلب، وسنتصل بك للتأكيد.' : 'Finalisez votre commande, nous confirmons par appel.'}
        </h1>
        <p className="mt-3 max-w-[680px] text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
          {isAr
            ? 'لا تحتاج إلى بطاقة بنكية. اترك معلومات التوصيل وسيتواصل فريق مرجاد معك قبل إرسال الطلب.'
            : "Pas besoin de carte bancaire. Laissez vos informations de livraison, l'équipe MARJAD vous contacte avant l'expédition."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="form-panel order-2 p-5 lg:order-1 lg:p-6">
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
          <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-brand-text)] mb-5">
            {isAr ? 'معلومات التوصيل' : 'Informations de livraison'}
          </h2>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company">
              {isAr ? 'الشركة' : 'Entreprise'}
            </label>
            <input
              id="company"
              tabIndex={-1}
              autoComplete="off"
              {...register('company')}
            />
          </div>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <div className="form-field">
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
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="form-field">
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
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isAr
                    ? 'رقم غير صحيح. أدخل رقما مغربيا (مثال: 0612345678)'
                    : 'Numéro invalide. Entrez un numéro marocain (ex: 0612345678)'}
                </p>
              ) : (
                <p className="form-help">
                  {isAr ? 'مثال: 0612345678' : 'Ex: 0612345678'}
                </p>
              )}
            </div>

            {/* City */}
            <div className="form-field">
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
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="form-field">
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
                className={[textareaClass, errors.address ? errorInputClass : ''].join(' ')}
              />
              {errors.address && (
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="form-field">
              <label className={labelClass} htmlFor="notes">
                {isAr ? 'ملاحظات (اختياري)' : 'Notes (optionnel)'}
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                disabled={isSubmitting}
                className={textareaClass}
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-6 mb-6">
            <h2 className="text-base font-semibold text-[var(--color-brand-text)] mb-3">
              {isAr ? 'طريقة الدفع' : 'Paiement'}
            </h2>
            <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-4 shadow-[var(--shadow-xs)]">
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
            className="form-submit w-full"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isAr ? 'تأكيد الطلب' : 'Passer la commande'}
          </button>

          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-success-light)] px-3 py-2 text-xs leading-relaxed text-[var(--color-brand-success)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {isAr
                ? 'بياناتك تستعمل فقط لتأكيد الطلب والتوصيل.'
                : 'Vos informations servent uniquement à confirmer et livrer votre commande.'}
            </span>
          </div>
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

            <div className="mt-5 border-t border-[var(--color-brand-border)] pt-5">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-brand-text)]">
                {isAr ? 'ماذا يحدث بعد الطلب؟' : 'Après la commande'}
              </h3>
              <div className="space-y-3">
                {checkoutSteps.map((step) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-primary)]">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-brand-text)]">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-[var(--color-brand-text-muted)]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-brand-text-muted)]">
                <Clock3 className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
                <span>{isAr ? 'التوصيل المتوقع: 3 إلى 5 أيام عمل.' : 'Livraison estimée : 3 à 5 jours ouvrables.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
