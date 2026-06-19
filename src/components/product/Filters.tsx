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

  function toggleCategory(slug: string) {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-brand-text)] mb-3">
          {isAr ? 'الفئات' : 'Catégories'}
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => {
            const catName = isAr ? cat.nameAr : cat.nameFr;
            const checked = selectedCategories.includes(cat.slug);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer group py-1 min-h-[44px]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat.slug)}
                className="h-4 w-4 cursor-pointer accent-[var(--color-brand-primary)]"
                />
                <span className="text-sm text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                  {catName}
                </span>
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
        <div className="flex items-center gap-2">
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
          onClick={onReset}
          className="flex-1 h-10 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-sm font-semibold text-[var(--color-brand-text-muted)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
        >
          {isAr ? 'إعادة تعيين' : 'Réinitialiser'}
        </button>
        <button
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
      const params = new URLSearchParams();
      if (cats.length === 1) params.set('category', cats[0]);
      if (min) params.set('min', min);
      if (max) params.set('max', max);
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
    router.push(pathname as '/');
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
        onClick={() => setSheetOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 h-9 px-3 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors"
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
      <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto p-4 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
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
