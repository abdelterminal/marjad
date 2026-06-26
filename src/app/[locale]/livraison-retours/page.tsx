import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Truck, RotateCcw, ShieldCheck, Phone, Clock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';

interface LivraisonRetoursPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LivraisonRetoursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}/livraison-retours`,
    title: isAr ? 'التوصيل والإرجاع' : 'Livraison & Retours',
    description: isAr
      ? 'تعرف على طريقة التوصيل داخل المغرب، الدفع عند الاستلام، وشروط الإرجاع لدى مرجاد.'
      : 'Consultez les conditions de livraison au Maroc, le paiement à la réception et les retours MARJAD.',
  });
}

export default async function LivraisonRetoursPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const deliverySteps = isAr
    ? [
        { icon: <Phone className="h-5 w-5" />, title: 'تأكيد الطلب', body: 'فريقنا يتصل بك خلال 24 ساعة لتأكيد العنوان والكمية والسعر.' },
        { icon: <ShieldCheck className="h-5 w-5" />, title: 'التحضير والتغليف', body: 'كل قطعة تُغلف بعناية ومواد مناسبة لطبيعتها، حسب الحجم ونوع المنتج.' },
        { icon: <Truck className="h-5 w-5" />, title: 'التوصيل', body: 'يصل الطلب إلى بابك في 3 إلى 5 أيام عمل. الدفع للمندوب عند الاستلام.' },
      ]
    : [
        { icon: <Phone className="h-5 w-5" />, title: 'Confirmation de commande', body: "Notre équipe vous rappelle dans les 24h pour confirmer l'adresse, la quantité et le prix." },
        { icon: <ShieldCheck className="h-5 w-5" />, title: 'Préparation & emballage', body: 'Chaque pièce est emballée avec soin, selon sa taille et sa nature.' },
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
    <main className="overflow-x-clip bg-[var(--color-brand-surface)]">

      {/* Hero */}
      <section className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="mx-auto grid max-w-[var(--container-xl)] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-16">
          <div>
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
            {isAr ? 'التوصيل والإرجاع' : 'Livraison & Retours'}
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.75rem)] font-bold text-[var(--color-brand-text)] leading-tight max-w-[680px]">
            {isAr ? 'التوصيل واضح من البداية.' : 'Une livraison claire dès le départ.'}
          </h1>
          <p className="mt-4 text-[var(--color-brand-text-muted)] text-base max-w-[620px] leading-relaxed">
            {isAr
              ? 'نؤكد الطلب بالهاتف قبل الإرسال، ونوضح التوصيل والدفع والإرجاع قبل أن تغادر القطعة مخزن مرجاد.'
              : "Nous confirmons votre commande par téléphone avant l'envoi, avec des règles simples pour la livraison, le paiement et les retours."}
          </p>
          </div>
          <div className="border-t border-[var(--color-brand-border)] pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
            <p className="text-sm font-semibold text-[var(--color-brand-text)]">
              {isAr ? 'ملخص سريع' : 'En bref'}
            </p>
            <div className="mt-5 grid gap-4">
              {[
                isAr ? 'الدفع نقداً عند الاستلام.' : 'Paiement en espèces à la réception.',
                isAr ? 'التوصيل عادة خلال 3 إلى 5 أيام عمل بعد التأكيد.' : 'Livraison généralement en 3 à 5 jours ouvrables après confirmation.',
                isAr ? 'الإرجاع خلال 48 ساعة إذا كان المنتج تالفاً أو غير مطابق.' : 'Retour sous 48h si la pièce est endommagée ou non conforme.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery process */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-10">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-3">
            {isAr ? 'كيف يعمل' : 'Comment ça marche'}
          </p>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-12">
            {isAr ? 'من الطلب إلى بابك' : 'De la commande à votre porte'}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {deliverySteps.map((step, i) => (
              <div key={step.title} className="border-t border-[var(--color-brand-border)] pt-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-bold text-[var(--color-brand-border)]">
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
      <section className="py-12 bg-[var(--color-brand-surface-alt)] border-y border-[var(--color-brand-border)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: <Clock className="h-5 w-5" />,
                label: isAr ? 'مدة التوصيل' : 'Délai de livraison',
                value: isAr ? '3 إلى 5 أيام' : '3 à 5 jours',
                note: isAr ? 'بعد التأكيد الهاتفي' : 'Après confirmation',
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                label: isAr ? 'نطاق التوصيل' : 'Zone de livraison',
                value: isAr ? 'داخل المغرب' : 'Au Maroc',
                note: isAr ? 'حسب توفر شركة التوصيل' : 'Selon couverture du transporteur',
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                label: isAr ? 'طريقة الدفع' : 'Mode de paiement',
                value: isAr ? 'عند الاستلام' : 'À la livraison',
                note: isAr ? 'نقدًا فقط' : 'En espèces uniquement',
              },
            ].map((item) => (
              <div key={item.label} className="border-t border-[var(--color-brand-primary)] pt-5 sm:px-4 first:ps-0 last:pe-0">
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
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="h-5 w-5 text-[var(--color-brand-primary)]" />
                <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase">
                {isAr ? 'سياسة الإرجاع' : 'Politique de retour'}
              </p>
              </div>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--color-brand-text)] mb-5">
                {isAr ? 'إرجاع واضح للحالات الصحيحة.' : 'Des retours clairs, pour les bons cas.'}
              </h2>
              <p className="text-[var(--color-brand-text-muted)] leading-relaxed mb-6">
                {isAr
                  ? 'إذا وصلت القطعة تالفة أو لا تتطابق مع وصفها، نراجع الحالة خلال 48 ساعة من الاستلام عند إرسال الصور المطلوبة.'
                  : "Si la pièce arrive endommagée ou ne correspond pas à sa description, nous étudions la demande sous 48h après réception avec les photos demandées."}
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

            <div className="border-y border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] p-6 lg:p-8 space-y-5">
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
