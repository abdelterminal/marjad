import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { TrackOrderForm } from '@/components/order/TrackOrderForm';
import { createPageMetadata } from '@/lib/seo';

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

  return (
    <main className="bg-[var(--color-brand-surface)]">
      <section className="zellige-texture border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] py-14 sm:py-18">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
            MARJAD COD
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-[var(--color-brand-text)]">
            {isAr ? 'تتبع طلبك' : 'Suivre ma commande'}
          </h1>
          <p className="mt-4 max-w-[640px] text-base leading-7 text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'اعرف أين وصل طلبك باستعمال رقم الطلب ورقم الهاتف. لا نعرض أي معلومات إلا إذا تطابقت البيانات.'
              : 'Consultez l’état de votre commande avec le numéro de commande et le téléphone utilisé à l’achat. Les informations ne s’affichent que si les deux correspondent.'}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <TrackOrderForm />
        </div>
      </section>
    </main>
  );
}
