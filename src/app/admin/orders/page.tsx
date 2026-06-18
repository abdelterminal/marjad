import Link from 'next/link';
import { adminListOrders } from '@/lib/queries/orders';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { formatMAD } from '@/lib/money';
import { StatusTabs } from '@/components/admin/StatusTabs';

export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1') || 1);

  const { items: orders, total } = await adminListOrders(status || undefined, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="mt-1 text-sm text-gray-500">{total} commande{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Status filter tabs */}
      <StatusTabs tabs={STATUS_TABS} activeValue={status} paramName="status" />

      <DataTable
        headers={['Réf.', 'Client', 'Téléphone', 'Ville', 'Total', 'Statut', 'Date', '']}
      >
        {orders.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
              Aucune commande
            </td>
          </tr>
        ) : (
          orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                #{order.id}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{order.customerPhone}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{order.city}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatMAD(parseFloat(order.total))}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge status={order.status} />
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

      <AdminPagination page={page} total={total} pageSize={25} />
    </div>
  );
}
