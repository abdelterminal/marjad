import { MessageCircle, PackageCheck, ShieldCheck } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  city: string;
  initials: string;
  text: string;
}

const testimonialsFr: Testimonial[] = [
  {
    name: 'Laila',
    initials: 'L',
    role: 'Cliente',
    city: 'Casablanca',
    text: "J'ai reçu ma commande rapidement et l'emballage était parfait. La pièce est encore plus belle en vrai ! Je recommande MARJAD.",
  },
  {
    name: 'Youssef',
    initials: 'Y',
    role: 'Client',
    city: 'Rabat',
    text: "Service impeccable, appel de confirmation rassurant et paiement à la livraison très pratique. Mes attentes ont été largement dépassées.",
  },
  {
    name: 'Sanae',
    initials: 'S',
    role: 'Cliente',
    city: 'Marrakech',
    text: "Des pièces uniques et authentiques qui donnent une âme à ma maison. Bravo pour le soin apporté à chaque détail.",
  },
];

const testimonialsAr: Testimonial[] = [
  {
    name: 'ليلى',
    initials: 'ل',
    role: 'عميلة',
    city: 'الدار البيضاء',
    text: 'استلمت طلبي بسرعة والتغليف كان رائعاً. القطعة أجمل بكثير من الصورة! أنصح بمرجاد بشدة.',
  },
  {
    name: 'يوسف',
    initials: 'ي',
    role: 'عميل',
    city: 'الرباط',
    text: 'خدمة ممتازة، اتصال تأكيد مطمئن والدفع عند الاستلام مريح جداً. تجاوزت توقعاتي بكثير.',
  },
  {
    name: 'سناء',
    initials: 'س',
    role: 'عميلة',
    city: 'مراكش',
    text: 'قطع فريدة وأصيلة تمنح روحاً لمنزلي. أحسنتم في الاهتمام بكل تفصيل.',
  },
];

interface Props {
  locale: string;
}

export function TestimonialsSection({ locale }: Props) {
  const isAr = locale === 'ar';
  const reviews = isAr ? testimonialsAr : testimonialsFr;
  const trustNotes = isAr
    ? [
        { icon: PackageCheck, label: 'طلب مؤكد' },
        { icon: MessageCircle, label: 'تواصل واضح' },
        { icon: ShieldCheck, label: 'تغليف بعناية' },
      ]
    : [
        { icon: PackageCheck, label: 'Commande confirmée' },
        { icon: MessageCircle, label: 'Échange clair' },
        { icon: ShieldCheck, label: 'Emballage soigné' },
      ];

  return (
    <section className="bg-[var(--color-brand-surface-alt)] py-16 lg:py-24">
      <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-wide text-[var(--color-brand-text)] sm:text-3xl">
            {isAr ? 'يثقون بنا' : 'ILS NOUS FONT CONFIANCE'}
          </h2>
          <div className="mt-3 flex justify-center">
            <span className="text-sm text-[var(--color-brand-secondary)]">◆</span>
          </div>
        </div>

        {/* 3-column cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((review, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] p-6 shadow-[var(--shadow-xs)]"
            >
              {(() => {
                const note = trustNotes[i % trustNotes.length];
                const Icon = note.icon;
                return (
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-brand-primary-light)] px-3 py-1 text-[11px] font-semibold text-[var(--color-brand-primary)]">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {note.label}
                  </div>
                );
              })()}

              {/* Text */}
              <blockquote className="flex-1 text-sm leading-relaxed text-[var(--color-brand-text)]">
                {review.text}
              </blockquote>

              {/* Author */}
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-sm font-semibold text-[var(--color-brand-primary)] select-none">
                  {review.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-brand-text)]">{review.name}</p>
                  <p className="text-xs text-[var(--color-brand-text-muted)]">
                    {review.role}, {review.city}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>


      </div>
    </section>
  );
}
