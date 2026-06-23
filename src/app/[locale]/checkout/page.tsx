import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { createPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}/checkout`,
    title: isAr ? 'إتمام الطلب' : 'Finaliser la commande',
    description: isAr
      ? 'أكمل طلبك في مرجاد مع الدفع عند الاستلام والتأكيد الهاتفي قبل الإرسال.'
      : 'Finalisez votre commande MARJAD avec paiement à la livraison et confirmation par téléphone avant expédition.',
  });
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
