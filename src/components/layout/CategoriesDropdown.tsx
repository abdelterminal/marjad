'use client';

import { useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type Category = {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
};

const categoryHints: Record<string, { fr: string; ar: string }> = {
  tableaux:  { fr: 'Peintures & art mural',       ar: 'لوحات وفن الجدران' },
  lampes:    { fr: 'Suspensions & éclairage',      ar: 'مصابيح وإنارة' },
  tables:    { fr: 'Tables basses & d\'appoint',   ar: 'طاولات وقطع مساعدة' },
  terroir:   { fr: 'Artisanat & tradition',        ar: 'حرف وتراث' },
};

interface Props {
  categories: Category[];
  locale: string;
}

export function CategoriesDropdown({ categories, locale }: Props) {
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => { clearTimeout(hideRef.current); setOpen(true); };
  const hide = () => { hideRef.current = setTimeout(() => setOpen(false), 130); };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger */}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="
          flex items-center gap-1
          text-sm font-medium
          text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)]
          transition-colors duration-150
          focus-visible:outline-none
        "
      >
        {isAr ? 'الفئات' : 'Catégories'}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="
            absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50
            w-[540px]
            rounded-xl border border-[var(--color-brand-border)]
            bg-[var(--color-brand-surface-elevated)]
            shadow-[0_16px_56px_rgba(0,0,0,0.13)]
            p-5
          "
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Caret */}
          <span className="
            absolute -top-[7px] left-1/2 -translate-x-1/2
            block h-3 w-3 rotate-45
            bg-[var(--color-brand-surface-elevated)]
            border-s border-t border-[var(--color-brand-border)]
          " />

          {/* Category grid */}
          <div className="grid grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => {
              const name = isAr ? cat.nameAr : cat.nameFr;
              const hint = categoryHints[cat.slug];
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="group focus-visible:outline-none"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square overflow-hidden rounded-lg bg-[var(--color-brand-surface-alt)]">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
                      style={{ backgroundImage: `url('/images/category-${cat.slug}.webp')` }}
                    />
                  </div>
                  {/* Label */}
                  <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                    {name}
                  </p>
                  {hint && (
                    <p className="mt-0.5 text-[10px] text-[var(--color-brand-text-subtle)] leading-tight">
                      {isAr ? hint.ar : hint.fr}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer link */}
          <div className="mt-4 border-t border-[var(--color-brand-border)] pt-3.5">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-primary)] transition-all hover:gap-2.5"
            >
              {isAr ? 'عرض كل المنتجات' : 'Voir toute la collection'}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
