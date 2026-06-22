'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, X, ZoomIn } from 'lucide-react';

interface GalleryProps {
  images: string[];
  productName: string;
}

export function Gallery({ images, productName }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const validImages = images.filter(Boolean);
  const mainImage = validImages[activeIndex] ?? null;

  if (validImages.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] flex items-center justify-center">
        <span className="max-w-[70%] text-center font-[var(--font-display)] text-2xl text-[var(--color-brand-text-subtle)]">
          {productName}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Desktop: thumbnails left + main image right */}
        <div className="flex gap-3">

          {/* Vertical thumbnails — desktop only */}
          {validImages.length > 1 && (
            <div className="hidden lg:flex flex-col items-center gap-2">
              <div
                ref={thumbsRef}
                className="flex flex-col gap-2 max-h-[560px] overflow-y-auto [scrollbar-width:none]"
              >
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className={[
                      'relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 focus-visible:outline-none',
                      idx === activeIndex
                        ? 'border-[var(--color-brand-primary)] opacity-100'
                        : 'border-[var(--color-brand-border)] opacity-55 hover:opacity-90 hover:border-[var(--color-brand-text-muted)]',
                    ].join(' ')}
                  >
                    <Image
                      src={img}
                      alt={`Photo ${idx + 1} de ${productName}`}
                      fill
                      className="object-cover"
                      sizes="74px"
                    />
                  </button>
                ))}
              </div>

              {validImages.length > 5 && (
                <button
                  type="button"
                  onClick={() => thumbsRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-brand-border)] text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] transition-colors"
                  aria-label="Voir plus"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Main image */}
          <div className="relative flex-1 h-[380px] sm:h-[440px] lg:h-[520px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-brand-surface-alt)]">
            {mainImage && (
              <Image
                key={mainImage}
                src={mainImage}
                alt={productName}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            )}

            {/* Zoom button */}
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="Agrandir l'image"
              className="absolute top-3 end-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[var(--color-brand-text)] shadow backdrop-blur-sm hover:bg-white transition-colors"
            >
              <ZoomIn className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Mobile thumbnails — horizontal scroll below main image */}
        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none]">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Photo ${idx + 1}`}
                className={[
                  'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150',
                  idx === activeIndex
                    ? 'border-[var(--color-brand-primary)] opacity-100'
                    : 'border-[var(--color-brand-border)] opacity-55 hover:opacity-90',
                ].join(' ')}
              >
                <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {zoomed && mainImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image agrandie"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] w-full">
              <Image src={mainImage} alt={productName} fill className="object-contain" sizes="90vw" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Fermer"
            className="absolute top-4 end-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
