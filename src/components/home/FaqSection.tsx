'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqsFr = [
  {
    q: 'Comment fonctionne le paiement à la livraison (COD) ?',
    a: 'Vous passez votre commande en ligne, notre équipe vous appelle pour confirmer, puis le livreur vous remet la pièce et vous payez en espèces à la réception. Aucune carte bancaire requise.',
  },
  {
    q: 'Quels sont les détails de livraison ?',
    a: 'Nous livrons partout au Maroc en 3 à 5 jours ouvrables selon votre ville. Les pièces sont soigneusement emballées pour garantir leur intégrité à l\'arrivée.',
  },
  {
    q: 'Puis-je retourner un produit ?',
    a: 'Oui, vous disposez de 48h après réception pour signaler tout problème. Contactez notre service client par WhatsApp ou téléphone et nous vous guiderons vers une solution.',
  },
  {
    q: 'Vos produits sont-ils artisanaux ?',
    a: 'Absolument. Chaque pièce est fabriquée à la main par des artisans marocains passionnés. Nous travaillons directement avec eux pour garantir l\'authenticité, la qualité et le respect du savoir-faire traditionnel.',
  },
];

const faqsAr = [
  {
    q: 'كيف يعمل نظام الدفع عند الاستلام (COD)؟',
    a: 'تضع طلبك عبر الإنترنت، يتصل بك فريقنا للتأكيد، ثم يسلمك المندوب القطعة وتدفع نقداً عند الاستلام. لا حاجة لبطاقة بنكية.',
  },
  {
    q: 'ما هي تفاصيل التوصيل؟',
    a: 'نوصل في جميع أنحاء المغرب في غضون 3 إلى 5 أيام عمل حسب مدينتك. يتم تغليف القطع بعناية لضمان سلامتها عند الوصول.',
  },
  {
    q: 'هل يمكنني إرجاع المنتج؟',
    a: 'نعم، لديك 48 ساعة بعد الاستلام للإبلاغ عن أي مشكلة. تواصل مع خدمة العملاء عبر واتساب أو الهاتف وسنرشدك نحو حل.',
  },
  {
    q: 'هل منتجاتكم حرفية يدوية؟',
    a: 'بالتأكيد. كل قطعة مصنوعة يدوياً من قبل حرفيين مغاربة شغوفين. نعمل معهم مباشرة لضمان الأصالة والجودة واحترام الحرفة التقليدية.',
  },
];

interface Props {
  locale: string;
}

export function FaqSection({ locale }: Props) {
  const isAr = locale === 'ar';
  const faqs = isAr ? faqsAr : faqsFr;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-[var(--color-brand-surface)] py-14 lg:py-20">
      <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

        <h2 className="mb-10 text-center font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)] sm:text-3xl">
          {isAr ? 'هل تحتاج مساعدة؟' : "BESOIN D'AIDE ?"}
        </h2>

        <div className="divide-y divide-[var(--color-brand-border)]">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                type="button"
                id={`home-faq-trigger-${i}`}
                className="group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`home-faq-panel-${i}`}
              >
                <span className="flex-1 min-w-0 text-sm font-medium text-[var(--color-brand-text)] transition-colors group-hover:text-[var(--color-brand-primary)]">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--color-brand-text-muted)] transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div
                  id={`home-faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`home-faq-trigger-${i}`}
                  className="max-w-prose pb-4 text-sm leading-relaxed text-[var(--color-brand-text-muted)]"
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
