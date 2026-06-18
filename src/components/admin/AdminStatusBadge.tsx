type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string }> = {
  pending: {
    label: 'En attente',
    classes: 'bg-amber-100 text-amber-800',
  },
  confirmed: {
    label: 'Confirmée',
    classes: 'bg-blue-100 text-blue-800',
  },
  processing: {
    label: 'En traitement',
    classes: 'bg-blue-100 text-blue-800',
  },
  shipped: {
    label: 'Expédiée',
    classes: 'bg-purple-100 text-purple-800',
  },
  delivered: {
    label: 'Livrée',
    classes: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Annulée',
    classes: 'bg-red-100 text-red-800',
  },
};

export function AdminStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
