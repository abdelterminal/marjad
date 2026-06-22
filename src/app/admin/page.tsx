import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  PackageCheck,
  Phone,
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
import { getDashboardStats } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';

export const dynamic = 'force-dynamic';

function pct(part: number, total: number) {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const actionableOrders = stats.pendingOrders + stats.confirmedOrders;
  const completedOrders = stats.deliveredOrders + stats.cancelledOrders;
  const confirmationRate = pct(stats.confirmedOrders + stats.shippedOrders + stats.deliveredOrders, stats.totalOrders);
  const deliveryRate = pct(stats.deliveredOrders, completedOrders);
  const cancelRate = pct(stats.cancelledOrders, completedOrders);

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
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-gray-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
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

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: CheckCircle,
            label: 'Confirmation',
            value: confirmationRate,
            detail: `${stats.confirmedOrders + stats.shippedOrders + stats.deliveredOrders}/${stats.totalOrders} commandes confirmées ou plus`,
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
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-950">{metric.value}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Aujourd'hui", value: stats.todayOrders, icon: ShoppingCart },
          { label: 'Confirmées', value: stats.confirmedOrders, icon: CheckCircle },
          { label: 'Expédiées', value: stats.shippedOrders, icon: Truck },
          { label: 'CA livré', value: formatMAD(parseFloat(stats.deliveredRevenue)), icon: Banknote },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon className="size-4 text-gray-400" />
              </div>
              <p className="mt-2 text-xl font-bold text-gray-950">{item.value}</p>
            </div>
          );
        })}
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

        <DataTable
          headers={['Réf.', 'Client', 'Ville', 'Statut', 'Total', 'Date', 'Actions']}
        >
          {stats.needsActionOrders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                Rien à traiter pour le moment
              </td>
            </tr>
          ) : (
            stats.needsActionOrders.map((order) => (
              <tr key={order.id} className={order.status === 'pending' ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-gray-50'}>
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
            ))
          )}
        </DataTable>
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
  );
}
