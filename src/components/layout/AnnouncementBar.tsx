import { getLocale } from 'next-intl/server';
import { Truck, Phone, RotateCcw } from 'lucide-react';

export async function AnnouncementBar() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const items = isAr
    ? [
        { icon: <Truck className="h-3.5 w-3.5" />, text: 'توصيل مجاني في المغرب' },
        { icon: <Phone className="h-3.5 w-3.5" />, text: 'تأكيد بالهاتف قبل الإرسال' },
        { icon: <RotateCcw className="h-3.5 w-3.5" />, text: 'إرجاع مضمون 48 ساعة' },
      ]
    : [
        { icon: <Truck className="h-3.5 w-3.5" />, text: 'Livraison gratuite au Maroc' },
        { icon: <Phone className="h-3.5 w-3.5" />, text: 'Confirmation par téléphone' },
        { icon: <RotateCcw className="h-3.5 w-3.5" />, text: 'Retours garantis 48h' },
      ];

  return (
    <div className="bg-[var(--color-brand-text)] text-white/80 text-[11px] font-medium py-2 overflow-hidden">
      <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {items.map((item) => (
            <span key={item.text} className="inline-flex items-center gap-1.5 shrink-0">
              <span className="text-[var(--color-brand-secondary)]">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
