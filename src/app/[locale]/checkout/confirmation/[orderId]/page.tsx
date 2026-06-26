import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Link } from '@/i18n/navigation';
import { auth } from '@/auth';
import { getOrderById } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { CheckCircle2, Package, MessageCircle, PhoneCall, Truck, Banknote } from 'lucide-react';
import Image from 'next/image';
import { getWhatsAppHref } from '@/lib/contact';
import { createPageMetadata } from '@/lib/seo';

interface ConfirmationPageProps {
  params: Promise<{ locale: string; orderId: string }>;
}

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { locale, orderId } = await params;
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}/checkout/confirmation/${orderId}`,
    title: isAr ? 'تم استلام الطلب' : 'Commande reçue',
    description: isAr
      ? 'تم استلام طلبك في مرجاد. سنتصل بك لتأكيد العنوان والكمية قبل الإرسال.'
      : "Votre commande MARJAD a été reçue. Nous vous appelons pour confirmer l'adresse et la quantité avant l'expédition.",
    image: null,
  });
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const orderIdNum = parseInt(orderId, 10);
  const order = isNaN(orderIdNum) ? null : await getOrderById(orderIdNum);

  // Ownership check — prevents walking sequential IDs to harvest customer PII.
  // Two valid proofs: (1) authenticated user who owns the order, or
  // (2) the HttpOnly confirmation cookie set by POST /api/orders at checkout time.
  const notFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-base text-[var(--color-brand-text-muted)] mb-4">
        {isAr ? 'الطلب غير موجود.' : 'Commande introuvable.'}
      </p>
      <Link href="/" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline">
        {isAr ? 'العودة للرئيسية' : "Retour à l'accueil"}
      </Link>
    </div>
  );

  if (!order) return notFound();

  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const sessionUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (order.userId !== null) {
    // Order belongs to a registered user — session must match
    if (!sessionUserId || sessionUserId !== order.userId) return notFound();
  } else {
    // Guest order — require the proof-of-purchase cookie set at checkout
    if (!cookieStore.has(`marjad_conf_${orderIdNum}`)) return notFound();
  }

  const total = parseFloat(order.total);
  const whatsappHref = getWhatsAppHref(
    isAr
      ? `مرحباً مرجاد، أريد الاستفسار عن طلبي رقم ${order.id}`
      : `Bonjour MARJAD, je souhaite poser une question sur ma commande #${order.id}`,
  );
  const nextSteps = [
    {
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'سنتصل بك' : 'Nous vous appelons',
      body: isAr ? 'لتأكيد العنوان والكمية قبل الإرسال.' : "Pour confirmer l'adresse et la quantité avant l'envoi.",
    },
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'نحضر الطلب' : 'Nous préparons la pièce',
      body: isAr ? 'بتغليف مناسب حتى تصل في حالة ممتازة.' : "Avec un emballage adapté pour l'arrivée en bon état.",
    },
    {
      icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'تدفع عند الاستلام' : 'Vous payez à la livraison',
      body: isAr ? 'لا يوجد أي دفع مطلوب الآن.' : "Aucun paiement n'est demandé maintenant.",
    },
  ];

  return (
    <main className="bg-[var(--color-brand-surface)]">
      <div className="mx-auto max-w-[var(--container-xl)] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_410px]">
            <div className="p-6 text-center sm:p-8 lg:p-10 lg:text-start">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-success-light)] text-[var(--color-brand-success)] lg:mx-0">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>

              <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                {isAr ? 'تم استلام الطلب' : 'Commande reçue'}
              </p>
              <h1 className="mt-2 font-[var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-[var(--color-brand-text)]">
                {isAr ? 'طلبك بين أيدينا.' : 'Votre commande est entre nos mains.'}
              </h1>
              <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-[var(--color-brand-text-muted)] lg:mx-0">
                {isAr
                  ? 'شكراً لك. استلمنا طلبك وسيتواصل معك فريق مرجاد لتأكيد العنوان والكمية قبل أي إرسال.'
                  : "Merci. Nous avons reçu votre commande et l'équipe MARJAD vous appelle pour confirmer l'adresse et la quantité avant tout envoi."}
              </p>

              <div className="mt-6 inline-flex items-center justify-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-4 py-2 font-mono text-sm font-semibold text-[var(--color-brand-text-muted)]">
                {isAr ? `رقم الطلب: #${order.id}` : `N° de commande : #${order.id}`}
              </div>

              <div className="mt-8 grid gap-3 text-start sm:grid-cols-3">
                {nextSteps.map((step) => (
                  <div key={step.title} className="border-t border-[var(--color-brand-border)] pt-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
                      {step.icon}
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-brand-text)]">
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-brand-text-muted)]">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-5 sm:p-6 lg:border-s lg:border-t-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                    {isAr ? 'ملخص' : 'Reçu'}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-[var(--color-brand-text)]">
                    {isAr ? 'ملخص الطلب' : 'Résumé de commande'}
                  </h2>
                </div>
                <span className="price-display text-base font-bold text-[var(--color-brand-primary)]">
                  {formatMAD(total)}
                </span>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-5 overflow-hidden border-y border-[var(--color-brand-border)]">
                  {order.items.map((item) => {
                    const productName = item.product
                      ? (isAr ? item.product.nameAr : item.product.nameFr)
                      : `Produit #${item.productId}`;
                    const productImage = item.product?.images?.[0] ?? null;
                    const lineTotal = parseFloat(item.unitPrice) * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 border-b border-[var(--color-brand-border)] py-3 last:border-b-0"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)]">
                          {productImage && (
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-[var(--color-brand-text)]">
                            {productName}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-brand-text-muted)]">
                            {isAr ? `الكمية: ${item.quantity}` : `Qté: ${item.quantity}`}
                          </p>
                        </div>
                        <span className="price-display flex-shrink-0 text-sm font-semibold text-[var(--color-brand-text)]">
                          {formatMAD(lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex items-start gap-3 border-b border-[var(--color-brand-border)] pb-5 text-start">
                <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-brand-primary)]" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                  {isAr
                    ? 'التوصيل المقدر: 3 إلى 5 أيام عمل داخل المغرب بعد التأكيد الهاتفي.'
                    : 'Livraison estimée : 3 à 5 jours ouvrables au Maroc après confirmation téléphonique.'}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] px-5 text-sm font-semibold text-[var(--color-brand-text)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:text-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                  >
                    <MessageCircle className="h-4 w-4 text-[var(--color-brand-success)]" aria-hidden="true" />
                    {isAr ? 'تواصل عبر واتساب' : 'Contacter sur WhatsApp'}
                  </a>
                )}
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                >
                  {isAr ? 'مواصلة التسوق' : 'Continuer les achats'}
                </Link>
                <Link
                  href="/account"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] px-5 text-sm font-semibold text-[var(--color-brand-text)] transition-colors hover:bg-[var(--color-brand-surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
                >
                  {isAr ? 'عرض طلباتي' : 'Voir mes commandes'}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
