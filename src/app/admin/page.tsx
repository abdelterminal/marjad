import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  History,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  PackageX,
  Phone,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { DataTable } from '@/components/admin/DataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { OrderQuickActions } from '@/components/admin/OrderQuickActions';
import { RiskHints } from '@/components/admin/RiskHints';
import { getDashboardStats } from '@/lib/queries/orders';
import { getLowStockProducts, getTopSellingProducts } from '@/lib/queries/products';
import { formatMAD } from '@/lib/money';
import { normalizePhone, getWhatsappPhone, getWhatsappMessage } from '@/lib/whatsapp';
import { requireAdmin } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

function pct(part: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [stats, lowStock, topProducts] = await Promise.all([
    getDashboardStats(),
    getLowStockProducts(5),
    getTopSellingProducts(5),
  ]);

  const actionableOrders = stats.pendingOrders + stats.confirmedOrders;
  const completedOrders = stats.deliveredOrders + stats.cancelledOrders;
  const revenueOrders = stats.confirmedOrders + stats.shippedOrders + stats.deliveredOrders;
  const confirmationRate = pct(revenueOrders, stats.totalOrders);
  const deliveryRate = pct(stats.deliveredOrders, completedOrders);
  const cancelRate = pct(stats.cancelledOrders, completedOrders);
  const aov = revenueOrders > 0 ? parseFloat(stats.totalRevenue) / revenueOrders : 0;

  const criticalProduct = lowStock.items[0];
  const lowStockDetail = criticalProduct
    ? `${criticalProduct.stock === 0 ? 'Épuisé' : `${criticalProduct.stock} restant${criticalProduct.stock > 1 ? 's' : ''}`} : ${criticalProduct.nameFr}${
        lowStock.total > 1 ? ` (+${lowStock.total - 1} autre${lowStock.total - 1 > 1 ? 's' : ''})` : ''
      }`
    : '5 unités ou moins';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard COD</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vue opérationnelle des commandes, confirmations et livraisons.
          </p>
        </div>
        <Link
          href="/admin/orders?status=pending"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <Phone className="size-4" />
          Traiter les commandes
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={AlertTriangle}
          label="À traiter"
          value={actionableOrders}
          highlight={actionableOrders > 0}
        />
        <StatCard
          icon={Clock}
          label="En attente"
          value={stats.pendingOrders}
          highlight={stats.pendingOrders > 0}
        />
        <StatCard
          icon={Banknote}
          label="CA aujourd'hui"
          value={formatMAD(parseFloat(stats.todayRevenue))}
        />
        <StatCard
          icon={TrendingUp}
          label="CA actif"
          value={formatMAD(parseFloat(stats.totalRevenue))}
        />
      </div>

      {/* Attention requise — risk, aging, stock */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Attention requise</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            icon={ShieldAlert}
            label="Commandes à risque"
            value={stats.riskyOrders}
            tone="danger"
            highlight={stats.riskyOrders > 0}
            detail="Téléphone ou adresse déjà utilisés"
          />
          <StatCard
            icon={History}
            label="En attente >24h"
            value={stats.agingOrders}
            tone="warning"
            highlight={stats.agingOrders > 0}
            detail="Confirmation en retard"
          />
          <StatCard
            icon={PackageX}
            label="Stock faible"
            value={lowStock.total}
            tone="warning"
            highlight={lowStock.total > 0}
            detail={lowStockDetail}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Aujourd'hui", value: stats.todayOrders, icon: ShoppingCart },
          { label: 'Confirmées', value: stats.confirmedOrders, icon: CheckCircle },
          { label: 'Expédiées', value: stats.shippedOrders, icon: Truck },
          { label: 'CA livré', value: formatMAD(parseFloat(stats.deliveredRevenue)), icon: Banknote },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon className="size-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: CheckCircle,
            label: 'Confirmation',
            value: confirmationRate,
            detail: `${revenueOrders}/${stats.totalOrders} commandes confirmées ou plus`,
          },
          {
            icon: PackageCheck,
            label: 'Livraison',
            value: deliveryRate,
            detail: `${stats.deliveredOrders}/${completedOrders} commandes clôturées livrées`,
          },
          {
            icon: XCircle,
            label: 'Annulation',
            value: cancelRate,
            detail: `${stats.cancelledOrders}/${completedOrders} commandes clôturées annulées`,
          },
          {
            icon: Banknote,
            label: 'Panier moyen',
            value: formatMAD(aov),
            detail: `Sur ${revenueOrders} commande${revenueOrders > 1 ? 's' : ''} confirmée${revenueOrders > 1 ? 's' : ''} ou plus`,
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-400">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Cash in transit */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Truck className="size-4" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Argent en circulation</p>
              <p className="text-xs text-gray-400">Total des commandes expédiées, pas encore encaissées</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMAD(parseFloat(stats.cashInTransit))}</p>
        </div>
      </div>

      {/* Cities, top products, low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Top villes</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {stats.topCities.length === 0 ? (
              <li className="text-sm text-gray-400">Aucune commande pour le moment</li>
            ) : (
              stats.topCities.map((c) => (
                <li key={c.city} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-gray-700">{c.city}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {c.orderCount} commande{c.orderCount > 1 ? 's' : ''}
                    {c.cancelledCount > 0 ? ` · ${pct(c.cancelledCount, c.orderCount)} annulée` : ''}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Top produits</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {topProducts.length === 0 ? (
              <li className="text-sm text-gray-400">Aucune vente pour le moment</li>
            ) : (
              topProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="truncate text-sm text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    {p.nameFr}
                  </Link>
                  <span className="shrink-0 text-xs text-gray-400">{p.qtySold} vendu{p.qtySold > 1 ? 's' : ''}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <PackageX className="size-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Stock faible</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {lowStock.items.length === 0 ? (
              <li className="text-sm text-gray-400">Aucun produit sous le seuil</li>
            ) : (
              lowStock.items.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="truncate text-sm text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    {p.nameFr}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.stock === 0 ? 'Épuisé' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Needs action */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">File à traiter</h2>
            <p className="mt-1 text-sm text-gray-500">
              Priorité aux commandes en attente puis confirmées.
            </p>
          </div>
          <Link
            href="/admin/orders?status=pending"
            className="shrink-0 text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2"
          >
            Voir la file →
          </Link>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {stats.needsActionOrders.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
              Rien à traiter pour le moment
            </p>
          ) : (
            stats.needsActionOrders.map((order) => {
              const phone = normalizePhone(order.customerPhone);
              const whatsappPhone = getWhatsappPhone(order.customerPhone);
              const whatsappMessage = encodeURIComponent(getWhatsappMessage(order));

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border p-4 space-y-3 ${
                    order.status === 'pending'
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-gray-900">#{order.id}</span>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <AdminStatusBadge status={order.status} />
                      <span className="text-sm font-bold text-gray-900">{formatMAD(parseFloat(order.total))}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {order.city} · {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                  </p>
                  <RiskHints hints={order.riskHints} />
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-gray-900"
                    >
                      <Phone className="size-3.5" />
                      Appeler
                    </a>
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      <MessageCircle className="size-3.5" />
                      WhatsApp
                    </a>
                  </div>
                  <OrderQuickActions orderId={order.id} status={order.status} />
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="block text-xs font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-950"
                  >
                    Voir le détail →
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            headers={['Réf.', 'Client', 'Ville', 'Statut', 'Total', 'Date', 'Contact', 'Actions']}
          >
            {stats.needsActionOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  Rien à traiter pour le moment
                </td>
              </tr>
            ) : (
              stats.needsActionOrders.map((order) => {
                const phone = normalizePhone(order.customerPhone);
                const whatsappPhone = getWhatsappPhone(order.customerPhone);
                const whatsappMessage = encodeURIComponent(getWhatsappMessage(order));

                return (
                  <tr key={order.id} className={order.status === 'pending' ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50/70'}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{order.customerPhone}</p>
                      <RiskHints hints={order.riskHints} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.city}</td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatMAD(parseFloat(order.total))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${phone}`}
                          className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-900 hover:text-gray-900"
                          aria-label="Appeler"
                        >
                          <Phone className="size-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                          aria-label="Contacter sur WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <OrderQuickActions orderId={order.id} status={order.status} />
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-950"
                        >
                          Voir le détail
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </DataTable>
        </div>
      </div>

      {/* Recent orders */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2"
          >
            Voir tout →
          </Link>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {stats.recentOrders.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
              Aucune commande pour le moment
            </p>
          ) : (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-gray-900">#{order.id}</span>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{order.customerName}</p>
                  </div>
                  <AdminStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{order.city}</span>
                  <span className="font-semibold text-gray-900">{formatMAD(parseFloat(order.total))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-MA')}</span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable
            headers={['Réf.', 'Client', 'Ville', 'Statut', 'Total', 'Date', '']}
          >
            {stats.recentOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Aucune commande pour le moment
                </td>
              </tr>
            ) : (
              stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.city}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatMAD(parseFloat(order.total))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
