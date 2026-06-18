import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth-guards';
import { getUserOrders } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { ShoppingBag } from 'lucide-react';

export default async function AccountPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const userId = parseInt(user.id, 10);
  const orders = await getUserOrders(userId);

  return (
    <main className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)]">
          {isAr ? 'حسابي' : 'Mon compte'}
        </h1>

        {/* Tab nav */}
        <div className="flex gap-6 mt-4 border-b border-[var(--color-brand-border)]">
          <Link
            href="/account"
            className="pb-3 text-sm font-semibold text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]"
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

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <ShoppingBag className="w-12 h-12 text-[var(--color-brand-border)]" strokeWidth={1} />
          <p className="text-base text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'لم تقم بأي طلب بعد.'
              : "Vous n'avez pas encore passé de commande."}
          </p>
          <Link
            href="/products"
            className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline"
          >
            {isAr ? 'اكتشف منتجاتنا' : 'Découvrir les produits'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            const total = parseFloat(order.total);
            const date = new Date(order.createdAt).toLocaleDateString(
              isAr ? 'ar-MA' : 'fr-FR',
              { day: 'numeric', month: 'long', year: 'numeric' },
            );

            return (
              <div
                key={order.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-brand-text)]">
                      {isAr ? `#${order.id}` : `Commande #${order.id}`}
                    </p>
                    <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5">
                      {date}
                    </p>
                  </div>
                  <OrderStatusBadge
                    status={order.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'}
                    locale={locale}
                  />
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-brand-text-muted)]">
                  <span>
                    {isAr
                      ? `${itemCount} ${itemCount === 1 ? 'منتج' : 'منتجات'}`
                      : `${itemCount} article${itemCount > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-[var(--color-brand-border)]">·</span>
                  <span className="price-display font-semibold text-[var(--color-brand-text)]">
                    {formatMAD(total)}
                  </span>
                </div>

                {/* Items preview */}
                {order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-brand-border)]">
                    {order.items.slice(0, 3).map((item) => {
                      const itemName = item.product
                        ? (isAr ? item.product.nameAr : item.product.nameFr)
                        : `Produit #${item.productId}`;
                      return (
                        <p
                          key={item.id}
                          className="text-xs text-[var(--color-brand-text-muted)] truncate"
                        >
                          {itemName}
                          {' '}
                          <span className="font-medium">× {item.quantity}</span>
                        </p>
                      );
                    })}
                    {order.items.length > 3 && (
                      <p className="text-xs text-[var(--color-brand-text-subtle)] mt-0.5">
                        {isAr
                          ? `+${order.items.length - 3} أخرى`
                          : `+${order.items.length - 3} autre${order.items.length - 3 > 1 ? 's' : ''}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
