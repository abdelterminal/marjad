type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; classes: string }> = {
  pending: {
    label: 'En attente',
    dot: 'bg-amber-400',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-300/50',
  },
  confirmed: {
    label: 'Confirmée',
    dot: 'bg-blue-400',
    classes: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-300/50',
  },
  processing: {
    label: 'En traitement',
    dot: 'bg-blue-400',
    classes: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-300/50',
  },
  shipped: {
    label: 'Expédiée',
    dot: 'bg-violet-400',
    classes: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-300/50',
  },
  delivered: {
    label: 'Livrée',
    dot: 'bg-emerald-400',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-300/50',
  },
  cancelled: {
    label: 'Annulée',
    dot: 'bg-red-400',
    classes: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-300/50',
  },
};

export function AdminStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
