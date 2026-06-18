'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Tab {
  value: string;
  label: string;
}

interface StatusTabsProps {
  tabs: Tab[];
  activeValue: string;
  paramName?: string;
}

export function StatusTabs({ tabs, activeValue, paramName = 'status' }: StatusTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => navigate(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
