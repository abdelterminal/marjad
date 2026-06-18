'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isAr = locale === 'ar';

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}` as '/');
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={!hasPrev}
        aria-label={isAr ? 'الصفحة السابقة' : 'Page précédente'}
        className="inline-flex items-center justify-center h-9 px-3 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        <span className="ms-1 hidden sm:inline">
          {isAr ? 'السابق' : 'Précédent'}
        </span>
      </button>

      <span className="text-sm text-[var(--color-brand-text-muted)]">
        {isAr
          ? `${currentPage} / ${totalPages}`
          : `Page ${currentPage} / ${totalPages}`}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNext}
        aria-label={isAr ? 'الصفحة التالية' : 'Page suivante'}
        className="inline-flex items-center justify-center h-9 px-3 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="me-1 hidden sm:inline">
          {isAr ? 'التالي' : 'Suivant'}
        </span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </div>
  );
}
