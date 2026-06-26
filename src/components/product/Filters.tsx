'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type Category = {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
};

interface FiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentMin?: number;
  currentMax?: number;
}

function FilterContent({
  categories,
  selectedCategories,
  setSelectedCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApply,
  onReset,
  locale,
}: {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (c: string[]) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  locale: string;
}) {
  const isAr = locale === 'ar';
  const activeFilters = selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  function toggleCategory(slug: string) {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Categories */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-brand-text)]">
            {isAr ? 'الفئات' : 'Catégories'}
          </h3>
          {activeFilters > 0 && (
            <span className="rounded-[var(--radius-full)] bg-[var(--color-brand-primary-light)] px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-primary)]">
              {isAr ? `${activeFilters} مفعلة` : `${activeFilters} actif${activeFilters > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
        <div className="divide-y divide-[var(--color-brand-border)] border-y border-[var(--color-brand-border)]">
          {categories.map((cat) => {
            const catName = isAr ? cat.nameAr : cat.nameFr;
            const checked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.id}
                className="group flex min-h-[48px] cursor-pointer items-center justify-between gap-3 py-2"
              >
                <span className="text-sm text-[var(--color-brand-text)] transition-colors group-hover:text-[var(--color-brand-primary)]">
                  {catName}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat.slug)}
                  className="h-4 w-4 cursor-pointer rounded border-[var(--color-brand-border)] accent-[var(--color-brand-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-brand-text)] mb-3">
          {isAr ? 'السعر (درهم)' : 'Prix (MAD)'}
        </h3>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={isAr ? 'الحد الأدنى' : 'Min'}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="form-input min-h-10"
          />
          <span className="text-[var(--color-brand-text-muted)] text-sm flex-shrink-0">—</span>
          <input
            type="number"
            min={0}
            placeholder={isAr ? 'الحد الأقصى' : 'Max'}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="form-input min-h-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-[var(--color-brand-border)]">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 h-10 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-sm font-semibold text-[var(--color-brand-text-muted)] transition-colors hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
        >
          {isAr ? 'إعادة تعيين' : 'Réinitialiser'}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="form-submit flex-1 min-h-10"
        >
          {isAr ? 'تطبيق' : 'Appliquer'}
        </button>
      </div>
    </div>
  );
}

/**
 * Filters component.
 * - On mobile (< lg): renders a trigger button only. The actual sheet opens on click.
 * - On desktop (≥ lg): renders the sidebar.
 * Place the <Filters> element in your layout so on desktop it sits in the sidebar column.
 */
export function Filters({ categories, currentCategory, currentMin, currentMax }: FiltersProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isAr = locale === 'ar';

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentCategory ? [currentCategory] : [],
  );
  const [minPrice, setMinPrice] = useState(currentMin ? String(currentMin) : '');
  const [maxPrice, setMaxPrice] = useState(currentMax ? String(currentMax) : '');

  const buildUrl = useCallback(
    (cats: string[], min: string, max: string) => {
      const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
      );
      if (cats.length === 1) params.set('category', cats[0]);
      else params.delete('category');
      if (min) params.set('min', min);
      else params.delete('min');
      if (max) params.set('max', max);
      else params.delete('max');
      params.delete('page');
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname],
  );

  function handleApply() {
    router.push(buildUrl(selectedCategories, minPrice, maxPrice) as '/');
    setSheetOpen(false);
  }

  function handleReset() {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    router.push(buildUrl([], '', '') as '/');
    setSheetOpen(false);
  }

  // Desktop: apply immediately on change
  function handleDesktopCategoryChange(cats: string[]) {
    setSelectedCategories(cats);
    router.push(buildUrl(cats, minPrice, maxPrice) as '/');
  }

  return (
    <>
      {/* Mobile filter button — only shown below lg */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="lg:hidden inline-flex h-9 items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] px-3 text-sm font-semibold text-[var(--color-brand-text)] shadow-[var(--shadow-xs)] transition-colors hover:bg-[var(--color-brand-surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {isAr ? 'الفلاتر' : 'Filtres'}
      </button>

      {/* Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open: boolean) => setSheetOpen(open)}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-[var(--radius-xl)] bg-[var(--color-brand-surface)] flex flex-col p-0"
        >
          <SheetHeader className="px-5 py-4 border-b border-[var(--color-brand-border)] flex-shrink-0">
            <SheetTitle className="text-base font-semibold text-[var(--color-brand-text)]">
              {isAr ? 'الفلاتر' : 'Filtres'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterContent
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onApply={handleApply}
              onReset={handleReset}
              locale={locale}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — only shown at lg+ */}
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 sticky top-[116px] max-h-[calc(100vh-116px)] overflow-y-auto p-4 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
        <FilterContent
          categories={categories}
          selectedCategories={selectedCategories}
          setSelectedCategories={handleDesktopCategoryChange}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onApply={handleApply}
          onReset={handleReset}
          locale={locale}
        />
      </aside>
    </>
  );
}
