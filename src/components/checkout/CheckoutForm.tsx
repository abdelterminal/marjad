'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Loader2, Banknote, AlertCircle, Clock3, MessageCircle, PhoneCall, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatMAD } from '@/lib/money';
import { createOrderSchema } from '@/lib/validators';
import type { z } from 'zod';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useIsClient } from '@/lib/use-is-client';
import { trackCheckoutStart, trackOrderSubmitted } from '@/lib/analytics';
import { getWhatsAppHref } from '@/lib/contact';

/* Hallmark · macrostructure: Checkout split · genre: luxury ecommerce · tone: calm Moroccan COD
 * theme: custom/MARJAD — terracotta #C4622D · cream #FAF7F2 · brass #D4A853
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

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
  const trustPoints = [
    isAr ? 'بدون دفع الآن' : 'Aucun paiement maintenant',
    isAr ? 'تأكيد بالهاتف قبل الإرسال' : 'Confirmation par téléphone',
    isAr ? 'توصيل 3 إلى 5 أيام عمل' : 'Livraison 3 à 5 jours ouvrables',
  ];
  const whatsappOrderHref = getWhatsAppHref(
    isAr
      ? 'مرحباً مرجاد، أريد الطلب عبر واتساب'
      : 'Bonjour MARJAD, je voudrais commander via WhatsApp',
  );
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
    <main className="bg-[var(--color-brand-surface)]">
      <div className="mx-auto max-w-[var(--container-xl)] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[linear-gradient(135deg,var(--color-brand-surface-elevated)_0%,var(--color-brand-surface-alt)_100%)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-5 sm:p-7 lg:p-8">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              {isAr ? 'طلب آمن' : 'Commande sécurisée'}
            </p>
            <h1 className="mt-3 max-w-3xl font-[var(--font-display)] text-[clamp(1.9rem,3vw,3.25rem)] font-bold leading-tight text-[var(--color-brand-text)]">
              {isAr ? 'أكمل الطلب، وسنتصل بك للتأكيد.' : 'Finalisez votre commande, nous confirmons par appel.'}
            </h1>
            <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
              {isAr
                ? 'لا تحتاج إلى بطاقة بنكية. اترك معلومات التوصيل وسيتواصل فريق مرجاد معك قبل إرسال الطلب.'
                : "Pas besoin de carte bancaire. Laissez vos informations de livraison, l'équipe MARJAD vous contacte avant l'expédition."}
            </p>
          </div>
          <div className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-text)] p-5 text-white sm:p-7 lg:border-s lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {isAr ? 'طريقة الطلب' : 'Mode de commande'}
            </p>
            <div className="mt-5 grid gap-3">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[var(--color-brand-secondary)]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="form-panel order-2 p-5 lg:order-1 lg:p-7">
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
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--color-brand-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                {isAr ? 'معلوماتك' : 'Vos informations'}
              </p>
              <h2 className="mt-1 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                {isAr ? 'معلومات التوصيل' : 'Informations de livraison'}
              </h2>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary-light)] px-4 py-3 text-sm leading-relaxed text-[var(--color-brand-text)] sm:max-w-[330px]">
              <span className="font-semibold">
                {isAr ? 'مهم:' : 'Important :'}
              </span>{' '}
              {isAr
                ? 'اكتب رقم هاتف متاحاً. لن نرسل الطلب قبل التأكيد.'
                : "Indiquez un téléphone joignable. La commande part seulement après confirmation."}
            </div>
          </div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  {isAr ? 'مثال: 0612345678 — سنتصل بهذا الرقم للتأكيد.' : 'Ex: 0612345678 — nous appelons ce numéro pour confirmer.'}
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
                list="moroccan-cities"
                {...register('city')}
                disabled={isSubmitting}
                autoComplete="address-level2"
                className={[inputClass, errors.city ? errorInputClass : ''].join(' ')}
              />
              <datalist id="moroccan-cities">
                {['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Kénitra','Tétouan','Safi','El Jadida','Béni Mellal','Nador','Khouribga','Settat','Laâyoune','Mohammedia','Khémisset','Berrechid','Taza','Ifrane','Ouarzazate','Essaouira','Dakhla','Taroudant','Guelmim','Tiznit','Larache','Al Hoceïma','Fnideq','Berkane','Errachidia','Azrou','Ait Melloul'].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.city && (
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="form-field sm:col-span-2">
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
              {!errors.address && (
                <p className="form-help">
                  {isAr
                    ? 'أضف الحي أو أقرب معلم لتسهيل التوصيل.'
                    : 'Ajoutez le quartier ou un repère proche pour faciliter la livraison.'}
                </p>
              )}
              {errors.address && (
                <p role="alert" aria-live="polite" className="form-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="form-field sm:col-span-2">
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
          <div className="my-6 border-y border-[var(--color-brand-border)] py-5">
            <h2 className="mb-3 text-base font-semibold text-[var(--color-brand-text)]">
              {isAr ? 'طريقة الدفع' : 'Paiement'}
            </h2>
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-4 shadow-[var(--shadow-xs)]">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-[var(--color-brand-primary)] flex-shrink-0" />
                <span className="text-sm font-semibold text-[var(--color-brand-text)]">
                  {isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                </span>
                <span className="ms-auto rounded-full bg-[var(--color-brand-success-light)] px-2 py-1 text-xs font-semibold text-[var(--color-brand-success)]">
                  {isAr ? 'بدون دفع الآن' : '0 MAD maintenant'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'تدفع نقداً عند استلام الطلب بعد التأكيد الهاتفي.'
                  : 'Vous payez en espèces à la réception, après confirmation téléphonique.'}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="form-submit w-full"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isAr ? 'تأكيد الطلب بدون دفع الآن' : 'Confirmer sans payer maintenant'}
          </button>

          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-brand-success-light)] px-3 py-2 text-xs leading-relaxed text-[var(--color-brand-success)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {isAr
                ? 'بعد الإرسال ستظهر لك صفحة التأكيد. سنراجع الطلب معك قبل أي شحن.'
                : "Après l'envoi, vous verrez la confirmation. Nous validons toujours la commande avec vous avant expédition."}
            </span>
          </div>

          {/* WhatsApp ordering alternative */}
          {whatsappOrderHref && (
            <div className="mt-5 border-t border-[var(--color-brand-border)] pt-4 text-center">
              <p className="text-xs text-[var(--color-brand-text-muted)] mb-2">
                {isAr ? 'أو اطلب مباشرة عبر واتساب' : 'Ou commandez directement sur WhatsApp'}
              </p>
              <a
                href={whatsappOrderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2
                  h-10 px-5
                  rounded-[var(--radius-btn)]
                  border border-[var(--color-brand-border)]
                  text-[var(--color-brand-primary)] text-sm font-semibold
                  hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-light)]
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
                "
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          )}
        </form>

        {/* Order summary */}
        <div className="order-1 lg:order-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-5 lg:sticky lg:top-[116px] lg:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                  {isAr ? 'السلة' : 'Panier'}
                </p>
                <h2 className="mt-1 text-base font-semibold text-[var(--color-brand-text)]">
                  {isAr ? 'ملخص الطلب' : 'Récapitulatif'}
                </h2>
              </div>
              <span className="rounded-full bg-[var(--color-brand-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
                {isAr ? `${itemCount} قطعة` : `${itemCount} article${itemCount > 1 ? 's' : ''}`}
              </span>
            </div>

            {items.map((item) => {
              const name = locale === 'ar' ? item.nameAr : item.nameFr;
              const lineTotal = parseFloat(item.price) * item.quantity;
              return (
                <div
                  key={item.productId}
                  className="flex gap-3 border-b border-[var(--color-brand-border)] py-3 last:border-b-0"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-white">
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

            <div className="mt-4 space-y-2 border-t border-[var(--color-brand-border)] pt-4">
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
              <div className="flex justify-between border-t border-[var(--color-brand-border)] pt-3 text-base font-semibold">
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
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-surface-alt)] text-[var(--color-brand-primary)]">
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
              <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-brand-surface-elevated)] px-3 py-2 text-xs leading-relaxed text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'إذا لم نتمكن من تأكيد الطلب بالهاتف، لن يتم شحنه.'
                  : "Si nous n'arrivons pas à confirmer la commande par téléphone, elle ne sera pas expédiée."}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
