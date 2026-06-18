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
      <div className="aspect-square w-full rounded-[var(--radius-md)] bg-[var(--color-brand-surface-alt)] flex items-center justify-center">
        <span className="text-[var(--color-brand-text-subtle)] text-sm">
          {productName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-brand-surface-alt)]">
        <Image
          src={mainImage!}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Photo ${idx + 1} de ${validImages.length}`}
              className={[
                'relative flex-shrink-0 w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-all duration-[var(--transition-fast)]',
                idx === activeIndex
                  ? 'border-[var(--color-brand-primary)]'
                  : 'border-transparent hover:border-[var(--color-brand-border-focus)]/60',
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
