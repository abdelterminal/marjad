import Link from 'next/link';
import { AlertTriangle, Download, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import { adminListOrders } from '@/lib/queries/orders';
import { DataTable } from '@/components/admin/DataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { OrderQuickActions } from '@/components/admin/OrderQuickActions';
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

const COURIER_PRESETS = [
  {
    title: 'À confirmer',
    description: 'Appels COD du jour avant préparation.',
    status: 'pending',
    exportPreset: 'to-confirm',
    cta: 'Voir à confirmer',
  },
  {
    title: 'Prêtes à expédier',
    description: 'Commandes confirmées à remettre au coursier.',
    status: 'confirmed',
    exportPreset: 'ready-to-ship',
    cta: 'Voir prêtes',
  },
  {
    title: 'En transit',
    description: 'Suivi client et rappels de disponibilité.',
    status: 'shipped',
    exportPreset: 'in-transit',
    cta: 'Voir transit',
  },
  {
    title: 'Livrées',
    description: 'Rapprochement COD et performance réelle.',
    status: 'delivered',
    exportPreset: 'delivered',
    cta: 'Voir livrées',
  },
];

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

function getWhatsappPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized.startsWith('0') ? `212${normalized.slice(1)}` : normalized.replace(/^\+/, '');
}

function getWhatsappMessage(order: Awaited<ReturnType<typeof adminListOrders>>['items'][number]) {
  const total = formatMAD(parseFloat(order.total));
  const firstItem = order.items[0]?.product?.nameFr ?? 'votre commande';

  if (order.status === 'confirmed') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} (${total}) est confirmée. Nous la préparons avec soin et vous informerons dès son expédition.`;
  }

  if (order.status === 'shipped') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} est en route vers ${order.city}. Paiement à la livraison : ${total}. Merci de garder votre téléphone disponible.`;
  }

  if (order.status === 'cancelled') {
    return `Bonjour ${order.customerName}, nous vous contactons au sujet de votre commande MARJAD #${order.id}. Dites-nous si vous souhaitez la réactiver ou modifier les informations.`;
  }

  return `Bonjour ${order.customerName}, c'est MARJAD. Nous vous contactons pour confirmer votre commande #${order.id} : ${firstItem} (${total}), livraison à ${order.city}. Pouvez-vous confirmer l'adresse : ${order.address} ?`;
}

function RiskHints({ hints }: { hints: Awaited<ReturnType<typeof adminListOrders>>['items'][number]['riskHints'] }) {
  if (hints.length === 0) return null;

  const toneClasses = {
    danger: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  return (
    <div className="mt-3 flex max-w-[240px] flex-wrap gap-1.5">
      {hints.map((hint) => (
        <span
          key={`${hint.type}-${hint.label}`}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold leading-none ${toneClasses[hint.tone]}`}
        >
          <AlertTriangle className="size-3" />
          {hint.label}
        </span>
      ))}
    </div>
  );
}

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="mt-1 text-sm text-gray-500">{total} commande{total !== 1 ? 's' : ''}</p>
        </div>
        <a
          href={`/api/admin/orders/export${status ? `?status=${encodeURIComponent(status)}` : ''}`}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Export CSV{status ? ' filtré' : ''}</span>
          <span className="sm:hidden">CSV</span>
        </a>
      </div>

      {/* Status filter tabs */}
      <StatusTabs tabs={STATUS_TABS} activeValue={status} paramName="status" />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COURIER_PRESETS.map((preset) => {
          const isActive = status === preset.status;

          return (
            <div
              key={preset.exportPreset}
              className={`rounded-xl border p-4 transition ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-semibold">{preset.title}</div>
              <p className={`mt-1 min-h-10 text-xs leading-5 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {preset.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/orders?status=${preset.status}`}
                  className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white text-gray-950 hover:bg-gray-100'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950'
                  }`}
                >
                  {preset.cta}
                </Link>
                <a
                  href={`/api/admin/orders/export?preset=${preset.exportPreset}`}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                    isActive
                      ? 'border border-white/20 text-white hover:bg-white/10'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950'
                  }`}
                >
                  <Download className="size-3.5" />
                  CSV
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* Mobile card list — hidden on md+ */}
      <div className="space-y-3 md:hidden">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Aucune commande
          </p>
        ) : (
          orders.map((order) => {
            const isPending = order.status === 'pending';
            const phone = normalizePhone(order.customerPhone);
            const whatsappPhone = getWhatsappPhone(order.customerPhone);
            const whatsappMessage = encodeURIComponent(getWhatsappMessage(order));
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const primaryItem = order.items[0]?.product?.nameFr ?? 'Commande COD';
            const extraItems = Math.max(order.items.length - 1, 0);

            return (
              <div
                key={order.id}
                className={`rounded-xl border bg-white p-4 space-y-3 ${
                  isPending ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-sm font-bold text-gray-950">#{order.id}</div>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <AdminStatusBadge status={order.status} />
                    <span className="text-sm font-bold text-gray-950">{formatMAD(parseFloat(order.total))}</span>
                  </div>
                </div>

                {/* Location + items */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  <span>{order.city}</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    <ShoppingBag className="mr-1 inline size-3 text-gray-400" />
                    {itemCount} article{itemCount > 1 ? 's' : ''}
                    {extraItems > 0 ? ` +${extraItems}` : ''}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('fr-MA')}</span>
                </div>

                {/* Item name */}
                <p className="line-clamp-1 text-xs text-gray-500">{primaryItem}</p>

                {/* Risk hints */}
                <RiskHints hints={order.riskHints} />

                {/* Contact buttons */}
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
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-gray-900"
                  >
                    Détail
                  </Link>
                </div>

                {/* Quick status actions */}
                <OrderQuickActions orderId={order.id} status={order.status} />
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block">
        <DataTable
          headers={['Commande', 'Client & contact', 'Adresse', 'Panier', 'Total', 'Statut', 'Date', '']}
        >
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                Aucune commande
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const primaryItem = order.items[0]?.product?.nameFr ?? 'Commande COD';
              const extraItems = Math.max(order.items.length - 1, 0);
              const isPending = order.status === 'pending';
              const phone = normalizePhone(order.customerPhone);
              const whatsappPhone = getWhatsappPhone(order.customerPhone);
              const whatsappMessage = encodeURIComponent(getWhatsappMessage(order));

              return (
                <tr
                  key={order.id}
                  className={isPending ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-4 py-4 align-top">
                    <div className="font-mono text-sm font-semibold text-gray-950">#{order.id}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {isPending ? 'À confirmer' : 'COD'}
                    </div>
                  </td>
                  <td className="min-w-[220px] px-4 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-950">{order.customerName}</div>
                    <div className="mt-1 text-sm text-gray-500">{order.customerPhone}</div>
                    <RiskHints hints={order.riskHints} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-900 hover:text-gray-950"
                      >
                        <Phone className="size-3.5" />
                        Appeler
                      </a>
                      <a
                        href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:border-emerald-500 hover:bg-emerald-100"
                      >
                        <MessageCircle className="size-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </td>
                  <td className="min-w-[160px] px-4 py-4 align-top text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{order.city}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                      {order.address}
                    </div>
                  </td>
                  <td className="min-w-[190px] px-4 py-4 align-top">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <ShoppingBag className="size-4 text-gray-400" />
                      {itemCount} article{itemCount > 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {primaryItem}
                      {extraItems > 0 ? ` +${extraItems}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-semibold text-gray-950">
                    {formatMAD(parseFloat(order.total))}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex min-w-[180px] flex-col gap-2">
                      <OrderQuickActions orderId={order.id} status={order.status} />
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-950 hover:text-gray-950"
                      >
                        Détail
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>

      <AdminPagination page={page} total={total} pageSize={25} />
    </div>
  );
}
