import { getLocale } from 'next-intl/server';

const messagesFr = [
  'Artisanat Marocain',
  'Livraison partout au Maroc',
  'Paiement à la livraison',
  'Pièces uniques',
  'Fait main',
  'Retours garantis 48h',
];

const messagesAr = [
  'الحرف اليدوية المغربية',
  'توصيل في جميع أنحاء المغرب',
  'الدفع عند الاستلام',
  'قطع فريدة',
  'صنع يدوي',
  'إرجاع مضمون 48 ساعة',
];

export async function MarqueeStrip() {
  const locale = await getLocale();
  const msgs = locale === 'ar' ? messagesAr : messagesFr;
  // Duplicate for seamless loop
  const items = [...msgs, ...msgs];

  return (
    <div
      className="overflow-hidden bg-[var(--color-brand-text)] py-3 select-none"
      aria-hidden="true"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-6"
          >
            <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-white/80">
              {msg}
            </span>
            <span className="text-[var(--color-brand-secondary)] text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
