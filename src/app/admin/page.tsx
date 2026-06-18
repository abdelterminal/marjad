import { ShoppingCart, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { DataTable } from '@/components/admin/DataTable';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { getDashboardStats } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d&apos;ensemble de la boutique</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total commandes"
          value={stats.totalOrders}
        />
        <StatCard
          icon={Clock}
          label="En attente"
          value={stats.pendingOrders}
          highlight={stats.pendingOrders > 0}
        />
        <StatCard
          icon={CheckCircle}
          label="Livrées"
          value={stats.deliveredOrders}
        />
        <StatCard
          icon={TrendingUp}
          label="Chiffre d'affaires"
          value={formatMAD(parseFloat(stats.totalRevenue))}
        />
      </div>

      {/* Recent orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2"
          >
            Voir tout →
          </Link>
        </div>

        <DataTable
          headers={['Réf.', 'Client', 'Téléphone', 'Ville', 'Statut', 'Total', 'Date', '']}
        >
          {stats.recentOrders.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                Aucune commande pour le moment
              </td>
            </tr>
          ) : (
            stats.recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">#{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{order.customerPhone}</td>
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
