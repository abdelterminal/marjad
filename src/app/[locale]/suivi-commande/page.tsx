import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { TrackOrderForm } from '@/components/order/TrackOrderForm';
import { createPageMetadata } from '@/lib/seo';
import { Banknote, PhoneCall, ShieldCheck, Truck } from 'lucide-react';

/* Hallmark · macrostructure: Support utility · genre: luxury ecommerce · tone: reassuring Moroccan COD
 * theme: custom/MARJAD — terracotta #C4622D · cream #FAF7F2 · brass #D4A853
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

interface TrackOrderPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TrackOrderPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}/suivi-commande`,
    title: isAr ? 'تتبع طلبي' : 'Suivre ma commande',
    description: isAr
      ? 'تتبع حالة طلب مرجاد باستعمال رقم الطلب ورقم الهاتف.'
      : 'Suivez votre commande MARJAD avec votre numéro de commande et téléphone.',
  });
}

export default async function TrackOrderPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const trustItems = [
    {
      icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'بيانات محمية' : 'Données protégées',
      body: isAr
        ? 'لا تظهر تفاصيل الطلب إلا إذا تطابق الهاتف مع رقم الطلب.'
        : 'Les détails ne s’affichent que si le téléphone correspond à la commande.',
    },
    {
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'تأكيد بالهاتف' : 'Confirmation par appel',
      body: isAr
        ? 'نتصل بك قبل إرسال الطلب لتأكيد العنوان والكمية.'
        : "Nous appelons avant l'envoi pour confirmer l'adresse et la quantité.",
    },
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'توصيل داخل المغرب' : 'Livraison au Maroc',
      body: isAr
        ? 'عادة خلال 3 إلى 5 أيام عمل بعد التأكيد.'
        : 'Généralement 3 à 5 jours ouvrables après confirmation.',
    },
  ];

  return (
    <main className="bg-[var(--color-brand-surface)]">
      <section className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="mx-auto grid max-w-[var(--container-xl)] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-14">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              MARJAD COD
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,4vw,3.65rem)] font-bold leading-tight text-[var(--color-brand-text)]">
              {isAr ? 'تتبع طلبك بهدوء.' : 'Suivre votre commande, simplement.'}
            </h1>
            <p className="mt-4 max-w-[680px] text-base leading-7 text-[var(--color-brand-text-muted)]">
              {isAr
                ? 'استعمل رقم الطلب ورقم الهاتف لمعرفة الحالة الحالية. لا نعرض أي معلومات إلا إذا تطابقت البيانات.'
                : 'Entrez le numéro de commande et le téléphone utilisé à l’achat. Les détails restent masqués tant que les deux informations ne correspondent pas.'}
            </p>
          </div>
          <div className="grid gap-3">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 border-t border-[var(--color-brand-border)] pt-4 first:border-t-0 first:pt-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-primary)]">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[var(--color-brand-text)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[var(--color-brand-text-muted)]">
                    {item.body}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-[var(--container-xl)] px-4 sm:px-6 lg:px-10">
          <TrackOrderForm />
          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-brand-border)] pt-5 text-sm text-[var(--color-brand-text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Banknote className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
              {isAr ? 'الدفع عند الاستلام فقط بعد التأكيد.' : 'Paiement à la livraison uniquement après confirmation.'}
            </span>
            <span>
              {isAr ? 'هل تحتاج مساعدة؟ تواصل معنا من صفحة الاتصال.' : 'Besoin d’aide ? La page contact reste disponible.'}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
