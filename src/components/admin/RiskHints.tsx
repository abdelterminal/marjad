import { AlertTriangle } from 'lucide-react';
import type { OrderRiskHint } from '@/lib/queries/orders';

const toneClasses = {
  danger: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function RiskHints({ hints }: { hints: OrderRiskHint[] }) {
  if (hints.length === 0) return null;

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
