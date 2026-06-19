import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ChevronLeft, MessageCircle, Phone } from 'lucide-react';
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

function getWhatsappMessage(order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>) {
  const total = formatMAD(parseFloat(order.total));
  const firstItem = order.items[0]?.product?.nameFr ?? 'votre commande';

  if (order.status === 'confirmed') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} (${total}) est confirmée. Nous la préparons avec soin et vous informerons dès son expédition.`;
  }

  if (order.status === 'shipped') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} est en route vers ${order.city}. Paiement à la livraison : ${total}. Merci de garder votre téléphone disponible.`;
  }

  if (order.status === 'delivered') {
    return `Bonjour ${order.customerName}, merci pour votre commande MARJAD #${order.id}. Nous espérons que la pièce vous plaît. Notre équipe reste disponible si besoin.`;
  }

  if (order.status === 'cancelled') {
    return `Bonjour ${order.customerName}, nous vous contactons au sujet de votre commande MARJAD #${order.id}. Dites-nous si vous souhaitez la réactiver ou modifier les informations.`;
  }

  return `Bonjour ${order.customerName}, c'est MARJAD. Nous vous contactons pour confirmer votre commande #${order.id} : ${firstItem} (${total}), livraison à ${order.city}. Pouvez-vous confirmer l'adresse : ${order.address} ?`;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) notFound();

  const order = await getOrderById(orderId);

  if (!order) notFound();

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const normalizedPhone = order.customerPhone.replace(/[^\d+]/g, '');
  const whatsappPhone = normalizedPhone.startsWith('0')
    ? `212${normalizedPhone.slice(1)}`
    : normalizedPhone.replace(/^\+/, '');
  const whatsappMessage = encodeURIComponent(getWhatsappMessage(order));

  return (
    <div className="space-y-6 max-w-[56rem]">
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
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={`tel:${normalizedPhone}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-white"
                  >
                    <Phone className="size-3.5" />
                    Appeler
                  </a>
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-semibold text-green-700 transition-colors hover:bg-white"
                  >
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </a>
                </div>
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

          {order.riskHints.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle className="size-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-amber-950">À vérifier avant confirmation</h2>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Cette commande ressemble à une commande déjà passée. Confirmez le téléphone, l&apos;adresse et le nombre d&apos;articles pendant l&apos;appel.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {order.riskHints.map((hint) => (
                  <div
                    key={`${hint.type}-${hint.label}`}
                    className="rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm font-medium text-amber-900"
                  >
                    {hint.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <OrderActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </div>
  );
}
