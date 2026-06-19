import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Truck, RotateCcw, ShieldCheck, Phone, Clock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Livraison & Retours — MARJAD',
  description: 'Toutes les informations sur la livraison au Maroc et notre politique de retours.',
};

export default async function LivraisonRetoursPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const deliverySteps = isAr
    ? [
        { icon: <Phone className="h-5 w-5" />, title: 'تأكيد الطلب', body: 'فريقنا يتصل بك خلال 24 ساعة لتأكيد العنوان والكمية والسعر.' },
        { icon: <ShieldCheck className="h-5 w-5" />, title: 'التحضير والتغليف', body: 'كل قطعة تُغلف بعناية ومواد مناسبة لطبيعتها — لوحة، مصباح، أو تحفة.' },
        { icon: <Truck className="h-5 w-5" />, title: 'التوصيل', body: 'يصل الطلب إلى بابك في 3 إلى 5 أيام عمل. الدفع للمندوب عند الاستلام.' },
      ]
    : [
        { icon: <Phone className="h-5 w-5" />, title: 'Confirmation de commande', body: "Notre équipe vous rappelle dans les 24h pour confirmer l'adresse, la quantité et le prix." },
        { icon: <ShieldCheck className="h-5 w-5" />, title: 'Préparation & emballage', body: 'Chaque pièce est emballée avec soin et des matériaux adaptés — tableau, lampe, ou objet décoratif.' },
        { icon: <Truck className="h-5 w-5" />, title: 'Livraison', body: 'Votre commande arrive à votre porte en 3 à 5 jours ouvrables. Vous réglez à la réception.' },
      ];

  const returnSteps = isAr
    ? [
        'تواصل معنا عبر واتساب أو البريد الإلكتروني خلال 48 ساعة من الاستلام',
        'أرسل صورًا للقطعة وصورة لملصق التسليم',
        'يؤكد فريقنا الطلب ويرتب الاستبدال أو الاسترداد',
      ]
    : [
        'Contactez-nous via WhatsApp ou e-mail dans les 48h après réception',
        'Envoyez des photos de la pièce et du bon de livraison',
        "Notre équipe confirme et organise l'échange ou le remboursement",
      ];

  const returnReasons = isAr
    ? ['القطعة وصلت تالفة', 'القطعة لا تتطابق مع الوصف', 'خطأ في الطلب']
    : ["La pièce est arrivée endommagée", "La pièce ne correspond pas à la description", "Erreur de commande"];

  return (
    <main className="overflow-x-clip">

      {/* Hero */}
      <section className="bg-[var(--color-brand-surface-alt)] border-b border-[var(--color-brand-border)] py-16 lg:py-24">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
            {isAr ? 'التوصيل والإرجاع' : 'Livraison & Retours'}
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-bold text-[var(--color-brand-text)] leading-tight max-w-[560px]">
            {isAr ? 'طلبك يستحق العناية.' : "Votre commande mérite d'être soignée."}
          </h1>
          <p className="mt-4 text-[var(--color-brand-text-muted)] text-base max-w-[480px] leading-relaxed">
            {isAr
              ? 'نوصل إلى جميع أنحاء المغرب، مع تأكيد هاتفي قبل الإرسال ودفع عند الاستلام.'
              : 'Livraison partout au Maroc, confirmation téléphonique avant envoi, paiement à la réception.'}
          </p>
        </div>
      </section>

      {/* Delivery process */}
      <section className="py-16 lg:py-24 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-3">
            {isAr ? 'كيف يعمل' : 'Comment ça marche'}
          </p>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-12">
            {isAr ? 'من الطلب إلى بابك' : 'De la commande à votre porte'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deliverySteps.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-[var(--color-brand-border)]">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-brand-text)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-14 bg-[var(--color-brand-surface-alt)] border-y border-[var(--color-brand-border)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            {[
              {
                icon: <Clock className="h-5 w-5" />,
                label: isAr ? 'مدة التوصيل' : 'Délai de livraison',
                value: isAr ? '3 – 5 أيام' : '3 – 5 jours',
                note: isAr ? 'بعد التأكيد الهاتفي' : 'Après confirmation',
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                label: isAr ? 'نطاق التوصيل' : 'Zone de livraison',
                value: isAr ? 'المغرب كله' : 'Tout le Maroc',
                note: isAr ? 'بما فيها المدن الصغيرة' : 'Toutes villes confondues',
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                label: isAr ? 'طريقة الدفع' : 'Mode de paiement',
                value: isAr ? 'عند الاستلام' : 'À la livraison',
                note: isAr ? 'نقدًا فقط' : 'En espèces uniquement',
              },
            ].map((item, i) => (
              <div key={i} className="sm:px-10 first:ps-0 last:pe-0 border-t-2 border-[var(--color-brand-primary)] pt-5">
                <div className="text-[var(--color-brand-primary)] mb-3">{item.icon}</div>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-brand-text-muted)] mb-1">
                  {item.label}
                </p>
                <p className="font-[var(--font-display)] text-xl font-bold text-[var(--color-brand-text)]">
                  {item.value}
                </p>
                <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Returns */}
      <section className="py-16 lg:py-24 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="h-5 w-5 text-[var(--color-brand-primary)]" />
                <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase">
                  {isAr ? 'سياسة الإرجاع' : 'Politique de retour'}
                </p>
              </div>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-5">
                {isAr ? 'رضاك مضمون، بلا نقاش.' : 'Votre satisfaction est garantie, sans discussion.'}
              </h2>
              <p className="text-[var(--color-brand-text-muted)] leading-relaxed mb-6">
                {isAr
                  ? 'إذا وصلت القطعة تالفة أو لا تتطابق مع وصفها، نرد أو نستبدل — خلال 48 ساعة من الاستلام مع صور.'
                  : "Si la pièce arrive endommagée ou ne correspond pas à sa description, on rembourse ou on échange — dans les 48h après réception avec photos."}
              </p>
              <p className="text-sm font-semibold text-[var(--color-brand-text)] mb-3">
                {isAr ? 'حالات الإرجاع المقبولة:' : 'Cas de retour acceptés :'}
              </p>
              <ul className="space-y-2 mb-8">
                {returnReasons.map((r) => (
                  <li key={r} className="flex items-center gap-3 text-sm text-[var(--color-brand-text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-6 lg:p-8 space-y-5">
              <p className="font-[var(--font-display)] text-lg font-bold text-[var(--color-brand-text)]">
                {isAr ? 'كيف تطلب إرجاعًا؟' : 'Comment demander un retour ?'}
              </p>
              {returnSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="shrink-0 font-mono text-sm font-bold text-[var(--color-brand-secondary)] w-5">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed">{step}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-[var(--color-brand-border)]">
                <Link
                  href="/contact"
                  className="
                    inline-flex items-center gap-2 h-11 px-5
                    rounded-[var(--radius-btn)]
                    bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
                    text-white text-sm font-semibold transition-colors
                  "
                >
                  {isAr ? 'تواصل معنا' : 'Nous contacter'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
