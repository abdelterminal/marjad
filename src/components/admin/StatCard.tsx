import { type LucideIcon } from 'lucide-react';

type StatCardTone = 'brand' | 'warning' | 'danger';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlight?: boolean;
  tone?: StatCardTone;
  detail?: string;
}

const toneClasses: Record<StatCardTone, { border: string; iconBg: string; value: string }> = {
  brand: {
    border: 'border-[var(--color-brand-primary)]/30',
    iconBg: 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]',
    value: 'text-[var(--color-brand-primary)]',
  },
  warning: {
    border: 'border-amber-300',
    iconBg: 'bg-amber-50 text-amber-600',
    value: 'text-amber-700',
  },
  danger: {
    border: 'border-red-300',
    iconBg: 'bg-red-50 text-red-600',
    value: 'text-red-700',
  },
};

export function StatCard({ icon: Icon, label, value, highlight, tone = 'brand', detail }: StatCardProps) {
  const classes = toneClasses[tone];

  return (
    <div
      className={[
        'rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm',
        highlight ? classes.border : 'border-gray-200',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg',
            highlight ? classes.iconBg : 'bg-gray-100 text-gray-400',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>
      <p
        className={[
          'mt-3 text-2xl font-bold tracking-tight',
          highlight ? classes.value : 'text-gray-900',
        ].join(' ')}
      >
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-gray-400">{detail}</p> : null}
    </div>
  );
}
