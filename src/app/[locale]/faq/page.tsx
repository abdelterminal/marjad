import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ — MARJAD',
  description: 'Les questions les plus fréquentes sur MARJAD, notre processus de commande, la livraison et les retours.',
};

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
    a: "Nous livrons partout au Maroc : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, et toutes les autres villes. Si vous avez un doute, contactez-nous sur WhatsApp.",
  },
  {
    q: "Combien de temps prend la livraison ?",
    a: "Entre 3 et 5 jours ouvrables après confirmation téléphonique. Pour les grandes villes, c'est souvent 2 à 3 jours. Chaque pièce est emballée individuellement pour arriver en parfait état.",
  },
  {
    q: "Est-ce que je peux retourner un article ?",
    a: "Oui. Si la pièce arrive endommagée ou ne correspond pas à la description, contactez-nous dans les 48h avec des photos. On échange ou on rembourse sans discussion. Voir la page Livraison & Retours pour les détails.",
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
    a: "Le plus rapide : WhatsApp. Disponibles du lundi au samedi de 9h à 20h. Vous pouvez aussi nous écrire sur la page Contact ou par e-mail à contact@marjad.ma.",
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
    a: "نوصل إلى جميع أنحاء المغرب: الدار البيضاء، الرباط، مراكش، فاس، طنجة، أكادير، مكناس، وجدة، وجميع المدن الأخرى. إن كنت في شك، تواصل معنا عبر واتساب.",
  },
  {
    q: "كم يستغرق التوصيل؟",
    a: "بين 3 و5 أيام عمل بعد التأكيد الهاتفي. في المدن الكبرى عادةً 2 إلى 3 أيام. كل قطعة تُغلف بشكل منفرد لتصل في حالة ممتازة.",
  },
  {
    q: "هل يمكنني إرجاع المنتج؟",
    a: "نعم. إذا وصلت القطعة تالفة أو لا تتطابق مع الوصف، تواصل معنا خلال 48 ساعة مع صور. نستبدل أو نسترجع المبلغ دون نقاش. راجع صفحة التوصيل والإرجاع للتفاصيل.",
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
    a: "الأسرع: واتساب. متاحون من الاثنين إلى السبت من 9 صباحًا حتى 8 مساءً. يمكنك أيضًا مراسلتنا عبر صفحة التواصل أو البريد الإلكتروني على contact@marjad.ma.",
  },
];

export default async function FaqPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const faqs = isAr ? faqAr : faqFr;

  return (
    <main className="overflow-x-clip">

      {/* Hero */}
      <section className="bg-[var(--color-brand-surface-alt)] border-b border-[var(--color-brand-border)] py-16 lg:py-24">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
            {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
          </p>
          <h1 className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] font-bold text-[var(--color-brand-text)] leading-tight max-w-[560px]">
            {isAr ? 'ما الذي يشغل بالك؟' : 'Vous avez des questions ?'}
          </h1>
          <p className="mt-4 text-[var(--color-brand-text-muted)] text-base max-w-[480px] leading-relaxed">
            {isAr
              ? 'إجابات صريحة على أكثر الأسئلة شيوعًا. إذا لم تجد ما تبحث عنه، تواصل معنا مباشرةً.'
              : 'Des réponses claires aux questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez, contactez-nous.'}
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[760px]">
            <Accordion>
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
