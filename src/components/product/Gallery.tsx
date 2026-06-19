'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryProps {
  images: string[];
  productName: string;
}

export function Gallery({ images, productName }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const validImages = images.filter(Boolean);
  const mainImage = validImages[activeIndex] ?? null;

  if (validImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] zellige-texture flex items-center justify-center">
        <span className="max-w-[70%] text-center font-[var(--font-display)] text-2xl text-[var(--color-brand-text-subtle)]">
          {productName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-brand-surface-alt)]">
        <Image
          key={mainImage}
          src={mainImage!}
          alt={productName}
          fill
          className="object-cover page-enter transition-transform duration-700 hover:scale-[1.025]"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/35 to-transparent p-4 text-white">
          <p className="text-xs font-medium text-white/85">
            {productName}
          </p>
          {validImages.length > 1 && (
            <p className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-medium backdrop-blur-sm">
              {activeIndex + 1} / {validImages.length}
            </p>
          )}
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Photo ${idx + 1} de ${validImages.length}`}
              className={[
                'relative flex-shrink-0 w-14 h-14 rounded-[var(--radius-sm)] overflow-hidden border transition-all duration-[var(--transition-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
                idx === activeIndex
                  ? 'border-[var(--color-brand-primary)] opacity-100 shadow-[var(--shadow-xs)]'
                  : 'border-[var(--color-brand-border)] opacity-70 hover:opacity-100 hover:border-[var(--color-brand-border-focus)]/60',
              ].join(' ')}
            >
              <Image
                src={img}
                alt={`Photo ${idx + 1} de ${productName}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
