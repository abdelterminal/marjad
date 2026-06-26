import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth-guards';
import { getUserOrderById } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { ArrowLeft, Banknote, MapPin, Package, Phone, ShoppingBag, Truck } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

export default async function AccountOrderDetailPage({ params }: Props) {
  const [{ orderId }, locale] = await Promise.all([params, getLocale()]);
  const user = await requireUser(locale);
  const isAr = locale === 'ar';
  const orderIdNum = Number(orderId);

  if (!Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    notFound();
  }

  const userId = parseInt(user.id, 10);
  const order = await getUserOrderById(userId, orderIdNum);

  if (!order) {
    notFound();
  }

  const total = parseFloat(order.total);
  const date = new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timeline = [
    {
      status: 'pending',
      title: isAr ? 'استلام الطلب' : 'Commande reçue',
      body: isAr ? 'نراجع الطلب قبل الاتصال.' : "Nous vérifions la commande avant l'appel.",
    },
    {
      status: 'confirmed',
      title: isAr ? 'تأكيد هاتفي' : 'Confirmation téléphonique',
      body: isAr ? 'نؤكد العنوان والكمية.' : "Nous confirmons l'adresse et la quantité.",
    },
    {
      status: 'processing',
      title: isAr ? 'تحضير الطلب' : 'Préparation',
      body: isAr ? 'نحضر القطع للتغليف.' : 'Nous préparons les pièces pour emballage.',
    },
    {
      status: 'shipped',
      title: isAr ? 'تم الإرسال' : 'Expédition',
      body: isAr ? 'الطلب في الطريق.' : 'La commande est en route.',
    },
    {
      status: 'delivered',
      title: isAr ? 'تم التسليم' : 'Livraison',
      body: isAr ? 'تم تسليم الطلب.' : 'La commande a été livrée.',
    },
  ];
  const activeIndex = timeline.findIndex((step) => step.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <main className="mx-auto max-w-[var(--container-lg)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {isAr ? 'العودة إلى طلباتي' : 'Retour à mes commandes'}
      </Link>

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
        <div className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-[var(--color-brand-text-muted)]">
                #{order.id} · {date}
              </p>
              <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold text-[var(--color-brand-text)]">
                {isAr ? 'تفاصيل الطلب' : 'Détails de la commande'}
              </h1>
            </div>
            <OrderStatusBadge
              status={order.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'}
              locale={locale}
            />
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-[var(--color-brand-text)]">
              {isAr ? 'المنتجات' : 'Articles'}
            </h2>

            <div className="mt-4 divide-y divide-[var(--color-brand-border)] border-y border-[var(--color-brand-border)]">
              {order.items.map((item) => {
                const product = item.product;
                const productName = product
                  ? isAr ? product.nameAr : product.nameFr
                  : `Produit #${item.productId}`;
                const productImage = product?.images?.[0] ?? null;
                const lineTotal = parseFloat(item.unitPrice) * item.quantity;

                return (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
                      {productImage ? (
                        <Image src={productImage} alt={productName} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-[var(--color-brand-text-subtle)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-[var(--color-brand-text)]">
                        {productName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-brand-text-muted)]">
                        {isAr ? `الكمية: ${item.quantity}` : `Quantité : ${item.quantity}`}
                      </p>
                    </div>
                    <p className="price-display shrink-0 text-sm font-bold text-[var(--color-brand-text)]">
                      {formatMAD(lineTotal)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-[var(--color-brand-text)]">
                {isAr ? 'الحالة' : 'Progression'}
              </h2>
              {isCancelled ? (
                <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-brand-error)] bg-[var(--color-brand-error-light)] p-4 text-sm text-[var(--color-brand-error)]">
                  {isAr ? 'تم إلغاء هذا الطلب.' : 'Cette commande a été annulée.'}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {timeline.map((step, index) => {
                    const done = index <= activeIndex;
                    return (
                      <div
                        key={step.status}
                        className={`border-t pt-4 ${
                          done ? 'border-[var(--color-brand-primary)]' : 'border-[var(--color-brand-border)]'
                        }`}
                      >
                        <div
                          className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${
                            done
                              ? 'bg-[var(--color-brand-primary)] text-white'
                              : 'bg-[var(--color-brand-surface-alt)] text-[var(--color-brand-text-subtle)]'
                          }`}
                        >
                          {step.status === 'shipped' ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <p className="text-xs font-semibold text-[var(--color-brand-text)]">{step.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-brand-text-muted)]">
                          {step.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-5 sm:p-6 lg:border-s lg:border-t-0">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-primary)]">
                {isAr ? 'المجموع' : 'Total'}
              </p>
              <p className="price-display mt-2 text-2xl font-bold text-[var(--color-brand-text)]">
                {formatMAD(total)}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-[var(--color-brand-text-muted)]">
                <Banknote className="h-4 w-4 text-[var(--color-brand-primary)]" />
                {isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
              </p>
            </div>

            <div className="mt-5 space-y-4 text-sm text-[var(--color-brand-text-muted)]">
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
                <span dir="ltr">{order.customerPhone}</span>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
                <span>
                  {order.address}, {order.city}
                </span>
              </div>
            </div>

            <Link
              href="/suivi-commande"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
            >
              {isAr ? 'تتبع طلب آخر' : 'Suivre une autre commande'}
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
