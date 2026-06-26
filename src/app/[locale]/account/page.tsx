import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth-guards';
import { getUserOrders } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { ShoppingBag } from 'lucide-react';

export default async function AccountPage() {
  const locale = await getLocale();
  const user = await requireUser(locale);
  const isAr = locale === 'ar';

  const userId = parseInt(user.id, 10);
  const orders = await getUserOrders(userId);

  return (
    <main className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)] tracking-wide">
          {isAr ? 'حسابي' : 'Mon compte'}
        </h1>

        {/* Tab nav */}
        <div className="flex gap-6 mt-4 border-b border-[var(--color-brand-border)]">
          <Link
            href="/account"
            className="pb-3 text-sm font-semibold text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)] -mb-px"
            aria-current="page"
          >
            {isAr ? 'طلباتي' : 'Mes commandes'}
          </Link>
          <Link
            href="/account/profile"
            className="pb-3 text-sm font-medium text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] transition-colors"
          >
            {isAr ? 'ملفي الشخصي' : 'Mon profil'}
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-surface-alt)]">
            <ShoppingBag className="w-7 h-7 text-[var(--color-brand-text-subtle)]" strokeWidth={1.2} />
          </div>
          <div>
            <p className="text-base font-medium text-[var(--color-brand-text)]">
              {isAr ? 'لا توجد طلبات بعد' : 'Aucune commande pour le moment'}
            </p>
            <p className="mt-1 text-sm text-[var(--color-brand-text-muted)]">
              {isAr
                ? 'ابدأ بالتسوق واكتشف مجموعتنا.'
                : 'Découvrez notre collection et passez votre première commande.'}
            </p>
          </div>
          <Link
            href="/products"
            className="mt-1 inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-brand-primary)] transition-colors"
          >
            {isAr ? 'اكتشف المنتجات' : 'Découvrir les produits'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            const total = parseFloat(order.total);
            const date = new Date(order.createdAt).toLocaleDateString(
              isAr ? 'ar-MA' : 'fr-FR',
              { day: 'numeric', month: 'long', year: 'numeric' },
            );
            const firstImage = order.items[0]?.product?.images?.[0];

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-white overflow-hidden"
              >
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[var(--color-brand-text-muted)]">
                      #{order.id}
                    </span>
                    <span className="text-[var(--color-brand-border)]">·</span>
                    <span className="text-xs text-[var(--color-brand-text-muted)]">{date}</span>
                  </div>
                  <OrderStatusBadge
                    status={order.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'}
                    locale={locale}
                  />
                </div>

                {/* Card body */}
                <div className="flex items-center gap-4 px-4 py-4">
                  {/* Product thumbnail */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-[var(--color-brand-border)]" strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-brand-text)] truncate">
                      {order.items[0]?.product
                        ? (isAr ? order.items[0].product.nameAr : order.items[0].product.nameFr)
                        : (isAr ? 'طلب' : 'Commande')}
                      {order.items.length > 1 && (
                        <span className="ms-1 text-[var(--color-brand-text-muted)]">
                          {isAr
                            ? `+${order.items.length - 1} أخرى`
                            : `+${order.items.length - 1} autre${order.items.length - 1 > 1 ? 's' : ''}`}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
                      {isAr
                        ? `${itemCount} ${itemCount === 1 ? 'منتج' : 'منتجات'}`
                        : `${itemCount} article${itemCount > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Total */}
                  <p className="price-display text-sm font-bold text-[var(--color-brand-text)] flex-shrink-0">
                    {formatMAD(total)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
