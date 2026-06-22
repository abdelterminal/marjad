'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Package2, Truck } from 'lucide-react';

export type AccordionItemDef = {
  icon: 'details' | 'origine' | 'livraison';
  title: string;
  summary: string;
  content: string;
};

const Icons = {
  details: Package2,
  origine: MapPin,
  livraison: Truck,
} as const;

export function ProductAccordion({ items }: { items: AccordionItemDef[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const Icon = Icons[item.icon];
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-[var(--color-brand-border)]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-3 py-4 text-start focus-visible:outline-none"
              aria-expanded={isOpen}
            >
              <Icon className="h-4 w-4 shrink-0 text-[var(--color-brand-text-muted)]" />
              <span className="flex-1 text-sm font-semibold text-[var(--color-brand-text)]">{item.title}</span>
              <span className="hidden text-xs text-[var(--color-brand-text-subtle)] sm:block">{item.summary}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--color-brand-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <p className="pb-4 ps-7 text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                {item.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
