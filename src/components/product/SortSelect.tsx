'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortSelectProps {
  currentSort?: string;
}

export function SortSelect({ currentSort = 'newest' }: SortSelectProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isAr = locale === 'ar';

  const options = [
    { value: 'newest', labelFr: 'Nouveautés', labelAr: 'الأحدث' },
    { value: 'price_desc', labelFr: 'Plus cher', labelAr: 'الأعلى سعراً' },
    { value: 'price_asc', labelFr: 'Moins cher', labelAr: 'الأقل سعراً' },
  ];

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    );
    params.set('sort', value);
    params.delete('page'); // reset to page 1
    router.push(`${pathname}?${params.toString()}` as '/');
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[160px] text-sm border-[var(--color-brand-border)] focus:ring-[var(--color-brand-primary)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-sm">
            {isAr ? opt.labelAr : opt.labelFr}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
