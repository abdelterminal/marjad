import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatCard({ icon: Icon, label, value, highlight }: StatCardProps) {
  return (
    <div
      className={[
        'rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm',
        highlight ? 'border-[var(--color-brand-primary)]/30' : 'border-gray-200',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg',
            highlight
              ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
              : 'bg-gray-100 text-gray-400',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>
      <p
        className={[
          'mt-3 text-2xl font-bold tracking-tight',
          highlight ? 'text-[var(--color-brand-primary)]' : 'text-gray-900',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}
