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
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${
            highlight ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className={`mt-2 text-2xl font-bold ${highlight ? 'text-amber-800' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
