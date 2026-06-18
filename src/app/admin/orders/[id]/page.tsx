import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { getOrderById } from '@/lib/queries/orders';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { OrderActions } from '@/components/admin/OrderActions';
import { formatMAD } from '@/lib/money';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) notFound();

  const order = await getOrderById(orderId);

  if (!order) notFound();

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ChevronLeft className="size-4" />
          Retour aux commandes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commande #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('fr-MA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <AdminStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Articles commandés</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.nameFr}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="size-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.nameFr}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatMAD(parseFloat(item.unitPrice))} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {formatMAD(parseFloat(item.unitPrice) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="border-t border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatMAD(parseFloat(order.total))}
                </span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Suivi de la commande</h2>
            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-700">Commande annulée</span>
              </div>
            ) : (
              <div className="flex items-center gap-0">
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= currentStatusIndex;
                  const current = i === currentStatusIndex;
                  return (
                    <div key={s} className="flex items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`size-3 rounded-full transition-colors ${
                            done ? 'bg-gray-900' : 'bg-gray-200'
                          } ${current ? 'ring-4 ring-gray-900/20' : ''}`}
                        />
                        <span
                          className={`text-xs whitespace-nowrap ${
                            current
                              ? 'font-semibold text-gray-900'
                              : done
                              ? 'text-gray-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div
                          className={`h-0.5 w-16 mx-1 -mt-4 ${
                            i < currentStatusIndex ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-900">Informations client</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Nom</dt>
                <dd className="font-medium text-gray-900">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Téléphone</dt>
                <dd className="font-medium text-gray-900">{order.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ville</dt>
                <dd className="font-medium text-gray-900">{order.city}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Adresse</dt>
                <dd className="font-medium text-gray-900">{order.address}</dd>
              </div>
              {order.notes && (
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-700 italic">{order.notes}</dd>
                </div>
              )}
              {order.user && (
                <div>
                  <dt className="text-gray-500">Compte</dt>
                  <dd className="font-medium text-gray-900">{order.user.email}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <OrderActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </div>
  );
}
