'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertCircle, CheckCircle2, Loader2, PackageCheck, Phone, Search, Truck } from 'lucide-react';
import Image from 'next/image';
import { formatMAD } from '@/lib/money';

/* Hallmark · component: order tracking form · genre: luxury ecommerce · theme: custom/MARJAD
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */

type TrackedOrder = {
  id: number;
  customerName: string;
  city: string;
  status: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    quantity: number;
    unitPrice: string;
    product: {
      nameFr: string;
      nameAr: string;
      slug: string;
      image: string | null;
    };
  }>;
};

const steps = ['pending', 'confirmed', 'shipped', 'delivered'];

const labelsFr: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const labelsAr: Record<string, string> = {
  pending: 'قيد التأكيد',
  confirmed: 'مؤكدة',
  shipped: 'تم الإرسال',
  delivered: 'تم التسليم',
  cancelled: 'ملغاة',
};

export function TrackOrderForm() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const labels = isAr ? labelsAr : labelsFr;

  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error ??
            (isAr
              ? 'لم نتمكن من العثور على هذا الطلب.'
              : "Impossible de retrouver cette commande."),
        );
      }

      setOrder(data as TrackedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : isAr ? 'حدث خطأ.' : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  const activeIndex = order ? steps.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <form onSubmit={handleSubmit} className="form-panel space-y-5 p-5 sm:p-6 lg:p-7">
        <div className="border-b border-[var(--color-brand-border)] pb-5">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-brand-primary)]">
            {isAr ? 'تتبع الطلب' : 'Suivi commande'}
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
            {isAr ? 'أدخل معلومات طلبك' : 'Retrouvez votre commande'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'استعمل رقم الطلب ورقم الهاتف الذي استعملته عند الشراء.'
              : 'Utilisez le numéro de commande et le téléphone indiqué au moment de l’achat.'}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="orderId" className="form-label">
            {isAr ? 'رقم الطلب' : 'Numéro de commande'}
          </label>
          <input
            id="orderId"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            className="form-input"
            inputMode="numeric"
            placeholder="123"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone" className="form-label">
            {isAr ? 'رقم الهاتف' : 'Téléphone'}
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="form-input"
            inputMode="tel"
            dir="ltr"
            placeholder="0612345678"
            required
          />
          <p className="form-help">
            {isAr ? 'نقبل 06/07 أو +212.' : 'Format accepté : 06/07 ou +212.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-[var(--radius-sm)] border-s-[3px] border-[var(--color-brand-error)] bg-[var(--color-brand-error-light)] p-3 text-sm text-[var(--color-brand-error)]">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="form-submit w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? (isAr ? 'جارٍ البحث...' : 'Recherche...') : isAr ? 'تتبع الطلب' : 'Suivre la commande'}
        </button>
      </form>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-5 shadow-[var(--shadow-sm)] sm:p-6 lg:p-7">
        {!order ? (
          <div className="flex min-h-[360px] flex-col justify-center text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
              <PackageCheck className="size-7" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-[var(--font-display)] text-xl font-bold text-[var(--color-brand-text)]">
              {isAr ? 'حالة طلبك ستظهر هنا' : 'Le statut apparaîtra ici'}
            </h3>
            <p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-[var(--color-brand-text-muted)]">
              {isAr
                ? 'إذا كان الطلب جديداً، قد يبقى قيد التأكيد إلى أن يتصل بك فريق مرجاد.'
                : "Si la commande vient d’être passée, elle peut rester en attente jusqu’à l’appel de confirmation MARJAD."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 border-b border-[var(--color-brand-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-[var(--color-brand-text-muted)]">
                  #{order.id}
                </p>
                <h3 className="mt-1 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                  {labels[order.status] ?? order.status}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-brand-text-muted)]">
                  {order.customerName} · {order.city}
                </p>
              </div>
              <p className="price-display text-xl font-bold text-[var(--color-brand-primary)]">
                {formatMAD(parseFloat(order.total))}
              </p>
            </div>

            {isCancelled ? (
              <div className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {isAr
                  ? 'هذا الطلب ملغى. تواصل معنا عبر واتساب إذا أردت إعادة تفعيله.'
                  : 'Cette commande est annulée. Contactez-nous sur WhatsApp si vous souhaitez la réactiver.'}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-4">
                {steps.map((step, index) => {
                  const done = index <= activeIndex;
                  const current = index === activeIndex;
                  return (
                    <div
                      key={step}
                      className={`border-t pt-4 ${
                        done
                          ? 'border-[var(--color-brand-primary)]'
                          : 'border-[var(--color-brand-border)]'
                      }`}
                    >
                      <div
                        className={`mb-2 flex size-7 items-center justify-center rounded-full ${
                          done
                            ? 'bg-[var(--color-brand-primary)] text-white'
                            : 'bg-[var(--color-brand-surface-alt)] text-[var(--color-brand-text-subtle)]'
                        }`}
                      >
                        {step === 'shipped' ? (
                          <Truck className="size-3.5" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[var(--color-brand-text)]">
                        {labels[step]}
                      </p>
                      {current && (
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-primary)]">
                          {isAr ? 'الحالة الحالية' : 'Actuel'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-brand-text)]">
                {isAr ? 'المنتجات' : 'Articles'}
              </h4>
              <div className="divide-y divide-[var(--color-brand-border)] border-y border-[var(--color-brand-border)]">
                {order.items.map((item) => (
                  <div key={item.product.slug} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
                        {item.product.image && (
                          <Image
                            src={item.product.image}
                            alt={isAr ? item.product.nameAr : item.product.nameFr}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-[var(--color-brand-text)]">
                          {isAr ? item.product.nameAr : item.product.nameFr}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
                          {isAr ? `الكمية: ${item.quantity}` : `Qté: ${item.quantity}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-brand-text)]">
                      {formatMAD(parseFloat(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 border-t border-[var(--color-brand-border)] pt-5 text-sm text-[var(--color-brand-text-muted)] sm:grid-cols-2">
              <div className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-[var(--color-brand-primary)]" />
                <p>
                  {isAr
                    ? 'نتصل بك قبل إرسال الطلب إذا كان لا يزال قيد التأكيد.'
                    : 'Nous vous appelons avant l’expédition si la commande est encore en confirmation.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-[var(--color-brand-primary)]" />
                <p>
                  {isAr
                    ? 'التوصيل عادة خلال 3 إلى 5 أيام عمل بعد التأكيد.'
                    : 'La livraison prend généralement 3 à 5 jours ouvrables après confirmation.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
