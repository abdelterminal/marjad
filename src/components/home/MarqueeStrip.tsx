const messagesFr = [
  'Artisanat Marocain',
  'Livraison au Maroc',
  'Paiement à la livraison',
  'Pièces uniques',
  'Fait main',
  'Support après commande',
];

const messagesAr = [
  'الحرف اليدوية المغربية',
  'توصيل داخل المغرب',
  'الدفع عند الاستلام',
  'قطع فريدة',
  'صنع يدوي',
  'دعم بعد الطلب',
];

export function MarqueeStrip({ locale }: { locale: string }) {
  const msgs = locale === 'ar' ? messagesAr : messagesFr;
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
