import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notre histoire — MARJAD',
  description: 'Découvrez l\'histoire de MARJAD, maison de décoration intérieure artisanale marocaine.',
};

export default async function AboutPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const values = [
    {
      title: t('about.value1Title'),
      desc: t('about.value1Desc'),
      number: '01',
    },
    {
      title: t('about.value2Title'),
      desc: t('about.value2Desc'),
      number: '02',
    },
    {
      title: t('about.value3Title'),
      desc: t('about.value3Desc'),
      number: '03',
    },
  ];

  return (
    <main className="overflow-x-clip">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-32 bg-[var(--color-brand-surface-alt)] overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary-light)]/60 via-transparent to-[var(--color-brand-surface-alt)] pointer-events-none" />
        <div className="absolute top-0 end-0 w-[40vw] h-[40vw] rounded-full bg-[var(--color-brand-secondary)]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-5">
            {t('about.eyebrow')}
          </p>
          <h1 className="
            font-[var(--font-display)]
            text-[clamp(2.5rem,6vw,5rem)]
            font-bold text-[var(--color-brand-text)]
            leading-[1.08] tracking-tight
            max-w-[700px]
            overflow-wrap-anywhere min-w-0
          ">
            {t('about.subtitle')}
          </h1>
          <p className="mt-6 text-[var(--color-brand-text-muted)] text-lg max-w-[520px] leading-relaxed">
            {t('about.heroBody')}
          </p>
        </div>
      </section>

      {/* ── STORY — 2-column ─────────────────────────────────── */}
      <section className="py-16 lg:py-28 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div
                className="aspect-[4/5] rounded-[var(--radius-xl)] overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, #8B3E1A 0%, #C4622D 50%, #D4A853 100%)',
                  backgroundImage: "url('/images/about-story.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Floating accent */}
              <div className="
                absolute -top-4 -end-4
                w-24 h-24 rounded-full
                bg-[var(--color-brand-secondary)]/20
                blur-2xl pointer-events-none
              " />
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
                {t('about.title')}
              </p>
              <h2 className="
                font-[var(--font-display)]
                text-[clamp(1.75rem,3.5vw,2.75rem)]
                font-bold text-[var(--color-brand-text)]
                leading-tight mb-6
              ">
                {t('about.story1')}
              </h2>
              <p className="text-[var(--color-brand-text-muted)] text-base leading-relaxed mb-5">
                {t('about.story2')}
              </p>
              <p className="text-[var(--color-brand-text-muted)] text-base leading-relaxed">
                {isAr
                  ? 'كل قطعة في مرجاد تحمل قصة — قصة حرفي، ورشة، ومنطقة من المغرب العريق.'
                  : "Chaque pièce MARJAD porte une histoire — celle d'un artisan, d'un atelier, d'une région du Maroc."}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── QUOTE ────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)] border-y border-[var(--color-brand-border)]">
        <div className="max-w-[680px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-[var(--color-brand-secondary)] text-5xl font-[var(--font-display)] leading-none mb-2" aria-hidden="true">&ldquo;</span>
          <p className="
            font-[var(--font-display)]
            text-[clamp(1.2rem,2.5vw,1.65rem)]
            text-[var(--color-brand-text)]
            leading-relaxed
          ">
            {t('about.storyQuote')}
          </p>
          <p className="mt-5 text-[var(--color-brand-text-muted)] text-sm font-mono tracking-wider uppercase">
            {t('about.storyQuoteAuthor')}
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12">
            <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-3">
              {t('about.valuesEyebrow')}
            </p>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)]">
              {t('about.valuesHeading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.number} className="group">
                {/* Number — large editorial */}
                <p className="
                  font-[var(--font-display)]
                  text-5xl font-bold
                  text-[var(--color-brand-primary)]/15
                  leading-none mb-5
                  select-none
                ">
                  {v.number}
                </p>
                <h3 className="
                  font-[var(--font-display)]
                  text-xl font-semibold text-[var(--color-brand-text)]
                  mb-3
                ">
                  {v.title}
                </h3>
                <p className="text-[var(--color-brand-text-muted)] text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-[var(--color-brand-text)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="
            font-[var(--font-display)]
            text-2xl sm:text-3xl lg:text-4xl
            font-bold text-white
            mb-3
          ">
            {t('about.ctaHeading')}
          </h2>
          <p className="text-white/55 text-base mb-8 max-w-[400px] mx-auto">
            {t('about.ctaDesc')}
          </p>
          <Link
            href="/products"
            className="
              inline-flex items-center gap-2
              h-12 px-8
              rounded-[var(--radius-btn)]
              bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
              text-white font-semibold text-sm
              transition-colors duration-[var(--transition-base)]
              active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-2
              focus-visible:ring-offset-[var(--color-brand-text)]
            "
          >
            {t('about.cta')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

    </main>
  );
}
