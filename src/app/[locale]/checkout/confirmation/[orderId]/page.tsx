import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Link } from '@/i18n/navigation';
import { auth } from '@/auth';
import { getOrderById } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { CheckCircle2, Package, MessageCircle, PhoneCall, Truck, Banknote } from 'lucide-react';
import Image from 'next/image';

interface ConfirmationPageProps {
  params: Promise<{ locale: string; orderId: string }>;
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
    <main className="max-w-[var(--container-sm)] mx-auto px-4 py-10 text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-[var(--color-brand-success-light)] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-[var(--color-brand-success)]" />
      </div>

      {/* Headline */}
      <h1 className="mt-4 text-2xl font-bold font-[var(--font-display)] text-[var(--color-brand-text)]">
        {isAr ? 'تم تأكيد طلبك!' : 'Commande confirmée !'}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-brand-text-muted)] max-w-[400px] mx-auto">
        {isAr
          ? 'شكراً لك! تم استلام طلبك. سيتواصل معك فريقنا خلال 24 ساعة لتأكيد التوصيل.'
          : 'Merci ! Votre commande a bien été reçue. Notre équipe vous contactera sous 24h pour confirmer la livraison.'}
      </p>

      {/* Order number */}
      <p className="mt-3 text-sm font-semibold text-[var(--color-brand-text-muted)] font-mono">
        {isAr ? `رقم الطلب: #${order.id}` : `N° de commande : #${order.id}`}
      </p>

      <div className="mt-8 grid gap-3 text-start sm:grid-cols-3">
        {nextSteps.map((step) => (
          <div
            key={step.title}
            className="rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-3"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
              {step.icon}
            </div>
            <p className="text-xs font-semibold text-[var(--color-brand-text)]">
              {step.title}
            </p>
            <p className="mt-1 text-xs leading-snug text-[var(--color-brand-text-muted)]">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      {/* Items summary */}
      {order.items && order.items.length > 0 && (
        <div className="text-start mt-8 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] overflow-hidden">
          {order.items.map((item) => {
            const productName = item.product
              ? (isAr ? item.product.nameAr : item.product.nameFr)
              : `Produit #${item.productId}`;
            const productImage = item.product?.images?.[0] ?? null;
            const lineTotal = parseFloat(item.unitPrice) * item.quantity;

            return (
              <div
                key={item.id}
                className="flex gap-3 p-3 border-b border-[var(--color-brand-border)] last:border-b-0"
              >
                {productImage && (
                  <div className="relative flex-shrink-0 w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-brand-surface-alt)]">
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-1">
                    {productName}
                  </p>
                  <p className="text-xs text-[var(--color-brand-text-muted)]">
                    {isAr ? `× ${item.quantity}` : `× ${item.quantity}`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--color-brand-text)] price-display flex-shrink-0">
                  {formatMAD(lineTotal)}
                </span>
              </div>
            );
          })}
          {/* Total row */}
          <div className="flex justify-between p-3 bg-[var(--color-brand-surface-alt)]">
            <span className="text-sm font-semibold text-[var(--color-brand-text)]">
              {isAr ? 'الإجمالي' : 'Total'}
            </span>
            <span className="text-sm font-bold text-[var(--color-brand-text)] price-display">
              {formatMAD(total)}
            </span>
          </div>
        </div>
      )}

      {/* Delivery info */}
      <div className="mt-6 flex items-center gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] text-start">
        <Package className="w-5 h-5 text-[var(--color-brand-primary)] flex-shrink-0" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">
          {isAr
            ? 'التوصيل المقدر: 3–5 أيام عمل (المغرب)'
            : 'Livraison estimée : 3–5 jours ouvrables (Maroc)'}
        </p>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '212000000000'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
        {isAr ? 'تواصل عبر واتساب' : 'Contacter sur WhatsApp'}
      </a>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center h-10 px-6 rounded-[var(--radius-btn)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold text-sm transition-colors"
        >
          {isAr ? 'مواصلة التسوق' : 'Continuer les achats'}
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center justify-center h-10 px-6 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors"
        >
          {isAr ? 'عرض طلباتي' : 'Voir mes commandes'}
        </Link>
      </div>
    </main>
  );
}
