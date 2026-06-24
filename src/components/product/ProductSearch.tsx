'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';

interface ProductSearchProps {
  currentQuery?: string;
}

export function ProductSearch({ currentQuery = '' }: ProductSearchProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [query, setQuery] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function navigate(nextQuery: string) {
    const params = new URLSearchParams(window.location.search);
    const normalized = nextQuery.trim();

    if (normalized) params.set('q', normalized);
    else params.delete('q');
    params.delete('page');

    const search = params.toString();
    startTransition(() => {
      router.push((search ? `${pathname}?${search}` : pathname) as '/');
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query);
  }

  function handleClear() {
    setQuery('');
    navigate('');
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex min-w-0 flex-1 items-center border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] shadow-[var(--shadow-xs)] transition-colors focus-within:border-[var(--color-brand-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--color-brand-primary)_14%,transparent)]"
    >
      <Search
        className="ms-3 h-4 w-4 flex-none text-[var(--color-brand-text-muted)]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        maxLength={80}
        placeholder={isAr ? 'ابحث في المجموعة' : 'Rechercher dans la collection'}
        aria-label={isAr ? 'البحث عن منتج' : 'Rechercher un produit'}
        className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--color-brand-text)] outline-none placeholder:text-[var(--color-brand-text-subtle)]"
      />
      {query ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={isAr ? 'مسح البحث' : 'Effacer la recherche'}
          className="inline-flex h-9 w-9 flex-none items-center justify-center text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-brand-primary)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="me-1 inline-flex h-9 flex-none items-center justify-center bg-[var(--color-brand-text)] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--color-brand-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] disabled:opacity-60"
      >
        {isAr ? 'بحث' : 'Chercher'}
      </button>
    </form>
  );
}
