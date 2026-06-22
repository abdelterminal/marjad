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
        'relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        highlight
          ? 'border-[var(--color-brand-primary)]/25'
          : 'border-gray-200',
      ].join(' ')}
    >
      {/* Icon chip — top right */}
      <div
        className={[
          'absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg',
          highlight
            ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
            : 'bg-gray-100 text-gray-400',
        ].join(' ')}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>

      {/* Metric */}
      <p
        className={[
          'mt-6 text-[2rem] font-bold leading-none tracking-tight',
          highlight ? 'text-[var(--color-brand-primary)]' : 'text-gray-900',
        ].join(' ')}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm text-gray-500">{label}</p>

      {/* Bottom accent for highlighted cards */}
      {highlight && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--color-brand-primary)]/30" />
      )}
    </div>
  );
}
