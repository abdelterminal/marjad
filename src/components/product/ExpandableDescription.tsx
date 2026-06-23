'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  text: string;
  locale: string;
}

export function ExpandableDescription({ text, locale }: Props) {
  const isAr = locale === 'ar';
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > 220;
  const descriptionId = 'product-description';

  return (
    <div className="mt-4 max-w-prose">
      <p
        id={descriptionId}
        className={[
          'text-sm leading-relaxed text-[var(--color-brand-text-muted)]',
          !expanded && isLong ? 'line-clamp-4' : '',
        ].join(' ')}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={descriptionId}
          className="
            mt-2 inline-flex cursor-pointer items-center gap-1
            rounded-sm
            text-xs font-semibold text-[var(--color-brand-primary)]
            hover:text-[var(--color-brand-primary-hover)]
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
          "
        >
          {expanded
            ? (isAr ? 'عرض أقل' : 'Voir moins')
            : (isAr ? 'قراءة المزيد' : 'Lire la suite')}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
