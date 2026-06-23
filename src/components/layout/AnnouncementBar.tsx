import { getLocale } from 'next-intl/server';
import { Truck, Phone, RotateCcw } from 'lucide-react';

export async function AnnouncementBar() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const items = isAr
    ? [
        { icon: <Truck className="h-3.5 w-3.5" />, text: 'توصيل داخل المغرب' },
        { icon: <Phone className="h-3.5 w-3.5" />, text: 'تأكيد بالهاتف قبل الإرسال' },
        { icon: <RotateCcw className="h-3.5 w-3.5" />, text: 'دعم بعد الطلب' },
      ]
    : [
        { icon: <Truck className="h-3.5 w-3.5" />, text: 'Livraison au Maroc' },
        { icon: <Phone className="h-3.5 w-3.5" />, text: 'Confirmation par téléphone' },
        { icon: <RotateCcw className="h-3.5 w-3.5" />, text: 'Support après commande' },
      ];

  return (
    <div
      className="overflow-hidden bg-[var(--color-brand-text)] py-2 text-[11px] font-medium text-white/80"
      aria-label={isAr ? 'معلومات الطلب والدعم' : 'Informations commande et support'}
    >
      {/* Mobile: scrolling marquee */}
      <div className="sm:hidden flex animate-marquee whitespace-nowrap">
        {[0, 1].map((cycle) => (
          <span key={cycle} className="inline-flex shrink-0" aria-hidden={cycle === 1}>
            {items.map((item) => (
              <span key={`${cycle}-${item.text}`} className="inline-flex shrink-0 items-center gap-1.5 px-6">
                <span className="text-[var(--color-brand-secondary)]">{item.icon}</span>
                {item.text}
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Desktop: static centered row */}
      <div className="hidden sm:flex max-w-[var(--container-content)] mx-auto px-4 sm:px-6 items-center justify-center gap-8 sm:gap-12">
        {items.map((item) => (
          <span key={item.text} className="inline-flex items-center gap-1.5 shrink-0">
            <span className="text-[var(--color-brand-secondary)]">{item.icon}</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
