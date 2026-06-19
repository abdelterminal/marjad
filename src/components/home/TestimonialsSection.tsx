'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  text: string;
  product: string;
}

const testimonialsFr: Testimonial[] = [
  {
    name: 'Fatima R.',
    initials: 'FR',
    role: 'Cliente — Casablanca',
    product: 'Tableau calligraphie',
    text: "Le tableau m'a littéralement coupé le souffle. L'emballage était soigné, la livraison rapide. C'est exactement l'âme que je cherchais pour mon salon. Je reviendrai.",
  },
  {
    name: 'Mehdi A.',
    initials: 'MA',
    role: 'Client — Rabat',
    product: 'Lampe en fer forgé',
    text: "Commande confirmée par téléphone, pièce arrivée en parfait état dans un emballage impeccable. C'est exactement ce que je cherchais. Le service est à la hauteur du produit.",
  },
  {
    name: 'Nadia B.',
    initials: 'NB',
    role: 'Cliente — Marrakech',
    product: 'Table en bois sculpté',
    text: "La lampe est encore plus belle en vrai qu'en photo. L'équipe a été très professionnelle, m'a appelée pour confirmer les détails. Une expérience d'achat vraiment agréable.",
  },
];

const testimonialsAr: Testimonial[] = [
  {
    name: 'فاطمة ر.',
    initials: 'ف',
    role: 'عميلة — الدار البيضاء',
    product: 'لوحة خط عربي',
    text: 'اللوحة فاقت توقعاتي تماماً. التغليف كان رائعاً والتوصيل سريع. هذا بالضبط ما كنت أبحث عنه لصالوني. سأعود بالتأكيد للتسوق من مرجاد.',
  },
  {
    name: 'مهدي أ.',
    initials: 'م',
    role: 'عميل — الرباط',
    product: 'مصباح حديد مطروق',
    text: 'تم تأكيد الطلب بالهاتف ووصلت القطعة في حالة ممتازة بتغليف احترافي. هذا بالضبط ما كنت أبحث عنه. الخدمة في مستوى المنتج.',
  },
  {
    name: 'نادية ب.',
    initials: 'ن',
    role: 'عميلة — مراكش',
    product: 'طاولة خشب منحوت',
    text: 'المصباح أجمل بكثير من الصورة. الفريق كان محترفاً جداً، اتصلوا بي لتأكيد التفاصيل. تجربة شراء ممتعة حقاً.',
  },
];

interface Props {
  locale: string;
}

export function TestimonialsSection({ locale }: Props) {
  const isAr = locale === 'ar';
  const reviews = isAr ? testimonialsAr : testimonialsFr;
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setActive((i) => (i + 1) % reviews.length);
  const current = reviews[active];

  return (
    <section className="zellige-texture bg-[var(--color-brand-surface-alt)] py-16 lg:py-24">
      <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-center">

          {/* Left — heading + meta */}
          <div>
            <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
              {isAr ? 'ماذا يقول عملاؤنا' : 'Ce que disent nos clients'}
            </p>
            <h2 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[var(--color-brand-text)] leading-tight mb-8">
              {isAr
                ? 'جرّبوه. أوصوا به.'
                : 'Ils ont essayé. Ils recommandent.'}
            </h2>

            {/* Stars + rating */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[var(--color-brand-secondary)] text-xl tracking-tight">
                ★★★★★
              </span>
              <span className="text-sm text-[var(--color-brand-text-muted)]">
                {isAr ? '٥ / ٥ — تقييم عملائنا' : '5 / 5 — Note de nos clients'}
              </span>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Avis ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-8 bg-[var(--color-brand-primary)]'
                      : 'w-4 bg-[var(--color-brand-border)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right — review card */}
          <div className="relative">
            {/* Large decorative quote */}
            <span
              className="absolute -top-6 start-0 font-[var(--font-display)] text-[8rem] leading-none text-[var(--color-brand-primary-light)] select-none pointer-events-none"
              aria-hidden="true"
            >
              &quot;
            </span>

            <div className="relative bg-[var(--color-brand-surface-elevated)] rounded-[var(--radius-md)] p-7 sm:p-9">
              {/* Review text */}
              <p
                key={active}
                className="font-[var(--font-display)] text-lg sm:text-xl leading-relaxed text-[var(--color-brand-text)] transition-opacity duration-300"
              >
                {current.text}
              </p>

              {/* Product tag */}
              <p className="mt-5 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-brand-primary)]">
                {current.product}
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)] font-semibold text-sm select-none">
                    {current.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-brand-text)]">{current.name}</p>
                    <p className="text-xs text-[var(--color-brand-text-muted)]">{current.role}</p>
                  </div>
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    aria-label={isAr ? 'السابق' : 'Précédent'}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-[var(--radius-btn)]
                      bg-[var(--color-brand-surface-alt)]
                      hover:bg-[var(--color-brand-primary-light)]
                      text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)]
                      transition-colors duration-[var(--transition-base)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
                    "
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  </button>
                  <button
                    onClick={next}
                    aria-label={isAr ? 'التالي' : 'Suivant'}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-[var(--radius-btn)]
                      bg-[var(--color-brand-primary)]
                      hover:bg-[var(--color-brand-primary-hover)]
                      text-white
                      transition-colors duration-[var(--transition-base)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
                    "
                  >
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
