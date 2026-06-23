/* Hallmark · macrostructure: studied-DNA · tone: warm editorial · anchor hue: terracotta
 * theme: studied-DNA (source: image — MARJAD about page reference)
 * paper: #FAF7F2 · accent: #C4622D · display: Playfair Display + body: Inter
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Leaf, Flower2, Tag, Truck, Heart } from 'lucide-react';

export default async function AProposPage() {
  const t = await getTranslations('about');
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const displayFont = isAr ? 'var(--font-display-ar)' : 'var(--font-display)';

  return (
    <main className="overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ━━━ 1 · Hero — full-bleed photo + left-anchored text overlay ━━━━━━━━━━ */}
      <section className="relative isolate h-[70vh] min-h-[560px] overflow-hidden">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Directional gradient keeps text readable without crushing the photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: isAr
              ? 'linear-gradient(to left,  rgba(12,7,3,0.74) 28%, rgba(12,7,3,0.38) 54%, transparent 78%)'
              : 'linear-gradient(to right, rgba(12,7,3,0.74) 28%, rgba(12,7,3,0.38) 54%, transparent 78%)',
          }}
        />
        {/* Subtle bottom vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 35%)' }}
        />

        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto w-full max-w-7xl px-8 pb-14 lg:px-16">
            <div className="max-w-[560px]">
              <h1
                className="text-[2.6rem] font-normal leading-[1.1] text-white sm:text-[3rem] lg:text-[3.5rem]"
                style={{ fontFamily: displayFont }}
              >
                {t('heroLine')}
              </h1>
              {/* Terracotta rule */}
              <div
                aria-hidden
                className="mb-6 mt-5"
                style={{ width: 40, height: 2, background: 'var(--color-brand-primary)' }}
              />
              <p className="max-w-[400px] text-[15px] leading-relaxed text-white/78">
                {t('heroCopy')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 2 · Notre regard — text + portrait photo ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: 'var(--color-brand-surface)' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-8 py-20 lg:grid-cols-2 lg:gap-20 lg:px-16 lg:py-28">

          {/* Text — DOM-first keeps correct read order on both LTR and RTL */}
          <div>
            {/* Kicker + rule */}
            <div className="mb-5">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.17em]"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {t('regardLabel')}
              </span>
              <div
                aria-hidden
                className="mt-2.5"
                style={{ width: 32, height: 2, background: 'var(--color-brand-primary)' }}
              />
            </div>

            <h2
              className="text-[1.9rem] font-normal leading-[1.2] lg:text-[2.35rem]"
              style={{ fontFamily: displayFont, color: 'var(--color-brand-text)' }}
            >
              {t('regardHeadline')}
            </h2>

            <p
              className="mt-6 text-[15px] leading-[1.8]"
              style={{ color: 'var(--color-brand-text-muted)' }}
            >
              {t('regardBody')}
            </p>

            <Link
              href="/products"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-all duration-150 hover:gap-3"
              style={{ color: 'var(--color-brand-primary)' }}
            >
              {t('regardLink')}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                style={isAr ? { transform: 'rotate(180deg)' } : undefined}
              />
            </Link>
          </div>

          {/* Photo */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm">
            <Image
              src="/images/about-story.png"
              alt={t('regardPhotoAlt')}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ━━━ 3 · Two-panel — full-bleed photos, text at bottom ━━━━━━━━━━━━━━━━━ */}
      <section className="grid divide-white/10 lg:grid-cols-2">
        {(
          [
            {
              src: '/images/marjad-hero-detail.png',
              Icon: Leaf,
              title: t('artisanTitle'),
              body: t('artisanBody'),
            },
            {
              src: '/images/marjad-hero-product.png',
              Icon: Flower2,
              title: t('matiereTitle'),
              body: t('matiereBody'),
            },
          ] as const
        ).map(({ src, Icon, title, body }) => (
          <div
            key={title}
            className="group relative flex min-h-[420px] items-end overflow-hidden lg:min-h-[500px]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Bottom-up gradient for text legibility */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,4,0,0.82) 0%, rgba(8,4,0,0.44) 42%, rgba(8,4,0,0.12) 100%)',
              }}
            />
            <div className="relative z-10 p-10 lg:p-12">
              <Icon className="mb-5 h-5 w-5 text-white/55" strokeWidth={1.2} />
              <h3
                className="text-[1.65rem] font-normal text-white lg:text-[1.9rem]"
                style={{ fontFamily: displayFont }}
              >
                {title}
              </h3>
              <div
                aria-hidden
                className="mb-4 mt-3"
                style={{ width: 32, height: 2, background: 'var(--color-brand-primary)' }}
              />
              <p className="max-w-[300px] text-[14px] leading-relaxed text-white/70 lg:text-[15px]">
                {body}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ━━━ 4 · Values — 3-col strip with icons ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="border-y"
        style={{
          background: 'var(--color-brand-surface-elevated)',
          borderColor: 'var(--color-brand-border)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0"
            style={{ borderColor: 'var(--color-brand-border)' }}
          >
            {(
              [
                { Icon: Tag,   title: t('selectTitle'), body: t('selectBody') },
                { Icon: Truck, title: t('codTitle'),    body: t('codBody')    },
                { Icon: Heart, title: t('atelierTitle'),body: t('atelierBody')},
              ] as const
            ).map(({ Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-5 px-8 py-12 lg:px-10"
              >
                <Icon
                  className="mt-0.5 h-9 w-9 shrink-0"
                  style={{ color: 'var(--color-brand-primary)' }}
                  strokeWidth={1.2}
                />
                <div>
                  <h4
                    className="text-[1.05rem] font-medium"
                    style={{ fontFamily: displayFont, color: 'var(--color-brand-text)' }}
                  >
                    {title}
                  </h4>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--color-brand-text-muted)' }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5 · CTA — cream left, photo bleeds in from the right ━━━━━━━━━━━━━━ */}
      <section
        className="relative overflow-hidden py-24 lg:py-36"
        style={{ background: 'var(--color-brand-surface)' }}
      >
        {/* Right-side photo (hidden on mobile — not enough space) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 hidden overflow-hidden lg:block"
          style={{
            right: isAr ? 'auto' : 0,
            left: isAr ? 0 : 'auto',
            width: '54%',
          }}
        >
          <Image
            src="/images/brand-story.png"
            alt=""
            fill
            className="object-cover object-left-top"
            sizes="54vw"
          />
          {/* Gradient fades the photo into the cream background */}
          <div
            className="absolute inset-0"
            style={{
              background: isAr
                ? 'linear-gradient(to left,  var(--color-brand-surface) 0%, rgba(250,247,242,0.08) 100%)'
                : 'linear-gradient(to right, var(--color-brand-surface) 0%, rgba(250,247,242,0.08) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-8 lg:px-16">
          <div className="max-w-[480px]">
            <h2
              className="text-[2.4rem] font-normal leading-[1.14] lg:text-[3rem]"
              style={{ fontFamily: displayFont, color: 'var(--color-brand-text)' }}
            >
              {t('collectionHeadline')}
            </h2>
            <div
              aria-hidden
              className="mb-6 mt-4"
              style={{ width: 40, height: 2, background: 'var(--color-brand-primary)' }}
            />
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: 'var(--color-brand-text-muted)' }}
            >
              {t('collectionBody')}
            </p>
            <Link
              href="/products"
              className="group mt-9 inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: 'var(--color-brand-primary)',
                '--tw-ring-color': 'var(--color-brand-primary)',
              } as React.CSSProperties}
            >
              {t('collectionBtn')}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                style={isAr ? { transform: 'rotate(180deg)' } : undefined}
              />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
