import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Banknote, PhoneCall, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FaqPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return createPageMetadata({
    locale,
    path: `/${locale}/faq`,
    title: isAr ? 'الأسئلة الشائعة' : 'FAQ',
    description: isAr
      ? 'إجابات عن الطلب، الدفع عند الاستلام، التوصيل، الإرجاع والتواصل مع مرجاد.'
      : 'Réponses sur la commande, le paiement à la livraison, la livraison, les retours et le contact MARJAD.',
  });
}

const faqFr = [
  {
    q: "Comment se passe une commande chez MARJAD ?",
    a: "C'est simple : vous choisissez votre pièce, vous l'ajoutez au panier, et vous remplissez vos coordonnées. Aucun paiement en ligne. Notre équipe vous rappelle dans les 24h pour confirmer l'adresse et la quantité, puis on prépare votre commande avec soin.",
  },
  {
    q: "Est-ce que je dois payer à l'avance ?",
    a: "Non. Chez MARJAD, c'est paiement à la livraison uniquement. Vous réglez le montant au livreur, en espèces, le jour de la réception. Pas de carte bancaire, pas de risque en ligne.",
  },
  {
    q: "Dans quelles villes livrez-vous ?",
    a: "Nous livrons au Maroc selon la couverture du transporteur. Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès et Oujda sont généralement couvertes. Si vous avez un doute sur votre ville, contactez-nous avant de commander.",
  },
  {
    q: "Combien de temps prend la livraison ?",
    a: "La livraison prend généralement 3 à 5 jours ouvrables après confirmation téléphonique. Chaque pièce est emballée selon sa taille et sa nature avant l'envoi.",
  },
  {
    q: "Est-ce que je peux retourner un article ?",
    a: "Oui, dans les cas prévus. Si la pièce arrive endommagée ou ne correspond pas à la description, contactez-nous dans les 48h avec des photos. Nous étudions la demande et organisons l'échange ou le remboursement si le cas est validé.",
  },
  {
    q: "Les pièces sont-elles vraiment fabriquées à la main ?",
    a: "Absolument. Chaque article dans notre collection vient d'ateliers artisanaux au Maroc — potiers, ferrailleurs, calligraphes, menuisiers. Nous visitons les ateliers avant de sélectionner un produit. Rien n'entre dans la collection MARJAD sans qu'on l'ait tenu entre les mains.",
  },
  {
    q: "Puis-je commander en grande quantité pour un projet de décoration ?",
    a: "Oui, pour les projets d'hôtels, restaurants, ou grandes résidences, contactez-nous directement par e-mail ou WhatsApp. On établit un devis personnalisé avec des délais adaptés.",
  },
  {
    q: "Comment puis-je vous contacter ?",
    a: "Le plus simple est de passer par la page Contact. Si WhatsApp est activé, le bouton apparaît sur le site. Vous pouvez aussi utiliser les informations de contact indiquées sur la page Contact.",
  },
];

const faqAr = [
  {
    q: "كيف تتم عملية الطلب في مرجاد؟",
    a: "الأمر بسيط: تختار القطعة التي تعجبك، تضيفها إلى السلة، ثم تملأ بياناتك. لا دفع إلكتروني. فريقنا يتصل بك خلال 24 ساعة لتأكيد العنوان والكمية، وبعدها نجهز طلبك بعناية.",
  },
  {
    q: "هل يجب أن أدفع مسبقًا؟",
    a: "لا. في مرجاد، الدفع عند الاستلام فقط. تدفع للمندوب نقدًا يوم التسليم. لا بطاقة بنكية، لا مخاطر.",
  },
  {
    q: "في أي مدن تتوفر خدمة التوصيل؟",
    a: "نوصل داخل المغرب حسب تغطية شركة التوصيل. المدن الكبرى مثل الدار البيضاء والرباط ومراكش وفاس وطنجة وأكادير ومكناس ووجدة تكون غالباً مغطاة. إذا كان لديك شك حول مدينتك، تواصل معنا قبل الطلب.",
  },
  {
    q: "كم يستغرق التوصيل؟",
    a: "عادة بين 3 و5 أيام عمل بعد التأكيد الهاتفي. نغلف كل قطعة حسب حجمها ونوعها قبل الإرسال.",
  },
  {
    q: "هل يمكنني إرجاع المنتج؟",
    a: "نعم، في الحالات المحددة. إذا وصلت القطعة تالفة أو لا تتطابق مع الوصف، تواصل معنا خلال 48 ساعة مع الصور المطلوبة. نراجع الحالة ونرتب الاستبدال أو الاسترجاع إذا تم قبول الطلب.",
  },
  {
    q: "هل القطع مصنوعة يدويًا حقًا؟",
    a: "تمامًا. كل ما في مجموعتنا يأتي من ورشات حرفية في المغرب — فخارانيون، حدادون، خطاطون، نجارون. نزور الورشات قبل اختيار أي منتج. لا شيء يدخل مجموعة مرجاد إلا وقد لمسناه بأيدينا.",
  },
  {
    q: "هل يمكنني الطلب بكميات كبيرة لمشروع تصميم داخلي؟",
    a: "نعم، للفنادق والمطاعم والمساكن الكبيرة، تواصل معنا مباشرة عبر واتساب أو البريد الإلكتروني. نعدّ عرض سعر مخصص بمواعيد تسليم مناسبة.",
  },
  {
    q: "كيف أتواصل معكم؟",
    a: "الأفضل استعمال صفحة التواصل. إذا كان واتساب مفعلاً سيظهر الزر في الموقع، ويمكنك أيضاً استعمال معلومات التواصل الموجودة في صفحة الاتصال.",
  },
];

export default async function FaqPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const faqs = isAr ? faqAr : faqFr;
  const supportPoints = [
    {
      icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
      body: isAr ? 'لا تدفع قبل التأكيد والاستلام.' : 'Aucun paiement avant confirmation et réception.',
    },
    {
      icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? 'تأكيد هاتفي' : 'Confirmation par appel',
      body: isAr ? 'نؤكد العنوان والكمية قبل الإرسال.' : "Nous confirmons l'adresse et la quantité avant l'envoi.",
    },
    {
      icon: <Truck className="h-4 w-4" aria-hidden="true" />,
      title: isAr ? '3 إلى 5 أيام' : '3 à 5 jours',
      body: isAr ? 'عادة بعد التأكيد الهاتفي.' : 'Généralement après confirmation téléphonique.',
    },
  ];

  return (
    <main className="overflow-x-clip bg-[var(--color-brand-surface)]">

      {/* Hero */}
      <section className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="mx-auto grid max-w-[var(--container-xl)] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-16">
          <div>
            <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
              {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
            </p>
            <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.75rem)] font-bold text-[var(--color-brand-text)] leading-tight max-w-[720px]">
              {isAr ? 'إجابات واضحة قبل الطلب.' : 'Des réponses claires avant de commander.'}
            </h1>
            <p className="mt-4 text-[var(--color-brand-text-muted)] text-base max-w-[620px] leading-relaxed">
              {isAr
                ? 'كل ما تحتاج معرفته عن الطلب، الدفع عند الاستلام، التوصيل، الإرجاع، والتواصل مع فريق مرجاد.'
                : 'Tout ce qu’il faut savoir sur la commande, le paiement à la livraison, la livraison, les retours et le contact MARJAD.'}
            </p>
          </div>
          <div className="grid gap-4 border-t border-[var(--color-brand-border)] pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
            {supportPoints.map((item) => (
              <div key={item.title} className="flex gap-3">
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

      {/* FAQ Accordion */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,760px)] lg:items-start">
            <aside className="border-t border-[var(--color-brand-border)] pt-5">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                {isAr ? 'الموضوعات' : 'Sujets'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'الأسئلة مرتبة حسب رحلة العميل: الطلب، الدفع، التوصيل، الإرجاع، والحرفية.'
                  : 'Les questions suivent le parcours client : commande, paiement, livraison, retours et artisanat.'}
              </p>
              <div className="mt-5 flex items-start gap-3 text-sm text-[var(--color-brand-text-muted)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" aria-hidden="true" />
                <span>
                  {isAr
                    ? 'لا نعرض وعوداً غير مؤكدة. الشروط النهائية تتأكد قبل الإرسال.'
                    : 'Pas de promesse floue : les conditions finales sont confirmées avant l’envoi.'}
                </span>
              </div>
            </aside>
            <div>
            <Accordion>
              {faqs.map((item, i) => (
                <AccordionItem key={item.q} value={String(i)}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-[var(--color-brand-text-muted)] text-base mb-5">
            {isAr ? 'لم تجد إجابتك؟' : 'Pas trouvé votre réponse ?'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="
                inline-flex items-center gap-2 h-11 px-6
                rounded-[var(--radius-btn)]
                bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
                text-white text-sm font-semibold transition-colors
              "
            >
              {isAr ? 'تواصل معنا' : 'Nous contacter'}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <Link
              href="/livraison-retours"
              className="
                inline-flex items-center gap-2 h-11 px-6
                rounded-[var(--radius-btn)]
                border border-[var(--color-brand-border)]
                bg-[var(--color-brand-surface-elevated)]
                hover:border-[var(--color-brand-primary)]/40
                text-[var(--color-brand-text)] text-sm font-semibold transition-colors
              "
            >
              {isAr ? 'التوصيل والإرجاع' : 'Livraison & retours'}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
