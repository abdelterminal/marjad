type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  locale?: string;
}

const statusConfig: Record<
  OrderStatus,
  { labelFr: string; labelAr: string; bgVar: string; textVar: string }
> = {
  pending: {
    labelFr: 'En attente',
    labelAr: 'في الانتظار',
    bgVar: 'var(--color-brand-neutral-light)',
    textVar: 'var(--color-brand-neutral)',
  },
  confirmed: {
    labelFr: 'Confirmée',
    labelAr: 'مؤكد',
    bgVar: 'var(--color-brand-info-light)',
    textVar: 'var(--color-brand-info)',
  },
  processing: {
    labelFr: 'En traitement',
    labelAr: 'قيد المعالجة',
    bgVar: 'var(--color-brand-info-light)',
    textVar: 'var(--color-brand-info)',
  },
  shipped: {
    labelFr: 'Expédiée',
    labelAr: 'تم الشحن',
    bgVar: 'var(--color-brand-warning-light)',
    textVar: 'var(--color-brand-warning)',
  },
  delivered: {
    labelFr: 'Livrée',
    labelAr: 'تم التوصيل',
    bgVar: 'var(--color-brand-success-light)',
    textVar: 'var(--color-brand-success)',
  },
  cancelled: {
    labelFr: 'Annulée',
    labelAr: 'ملغى',
    bgVar: 'var(--color-brand-error-light)',
    textVar: 'var(--color-brand-error)',
  },
};

export function OrderStatusBadge({ status, locale = 'fr' }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const label = locale === 'ar' ? config.labelAr : config.labelFr;

  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-medium"
      style={{ backgroundColor: config.bgVar, color: config.textVar }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.textVar }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
