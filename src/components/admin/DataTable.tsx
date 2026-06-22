import { cn } from '@/lib/utils';

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  );
}
