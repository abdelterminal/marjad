import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  MessageCircle, Phone, Package, Clock, CheckCircle2,
  Truck, RotateCcw, ChevronDown, ArrowRight,
} from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';
import { getSupportPhoneHref, getWhatsAppHref } from '@/lib/contact';

export default async function ContactPage() {
  const t = await getTranslations('contact');
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const whatsappHref = getWhatsAppHref();
  const phoneHref = getSupportPhoneHref();
  const df = isAr ? 'var(--font-display-ar)' : 'var(--font-display)';

  const subjects = [
    t('formSubjectOpt1'),
    t('formSubjectOpt2'),
    t('formSubjectOpt3'),
    t('formSubjectOpt4'),
  ];

  const trustItems = [
    { icon: Clock,        label: t('trustTime')    },
    { icon: CheckCircle2, label: t('trustConfirm') },
    { icon: Package,      label: t('trustCod')     },
  ];

  const channels = [
    ...(whatsappHref
      ? [{
          icon: MessageCircle,
          color: '#1B4820',
          title: t('channelWaTitle'),
          desc:  t('channelWaDesc'),
          link:  whatsappHref,
          linkLabel: t('channelWaLink'),
          external: true,
        }]
      : []),
    {
      icon: Package,
      color: 'var(--color-brand-primary)',
      title: t('channelTrackTitle'),
      desc:  t('channelTrackDesc'),
      link:  '/suivi-commande',
      linkLabel: t('channelTrackLink'),
      external: false,
    },
    {
      icon: Truck,
      color: 'var(--color-brand-text)',
      title: t('channelShipTitle'),
      desc:  t('channelShipDesc'),
      link:  '/livraison-retours',
      linkLabel: t('channelShipLink'),
      external: false,
    },
    {
      icon: RotateCcw,
      color: 'var(--color-brand-primary)',
      title: t('channelReturnTitle'),
      desc:  t('channelReturnDesc'),
      link:  '/livraison-retours',
      linkLabel: t('channelReturnLink'),
      external: false,
    },
  ];

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  return (
    <main className="overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ━━━ 1 · Split hero + floating form card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="grid lg:grid-cols-[58%_42%]">

        {/* Left column: photo with cream wash + dark text */}
        <div className="relative flex min-h-[540px] items-end overflow-hidden lg:min-h-[640px]">
          <Image
            src="/images/marjad-hero-lifestyle.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          {/* Cream left-wash makes dark text legible over the photo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: isAr
                ? 'linear-gradient(to left,  rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.75) 42%, rgba(250,247,242,0.18) 72%, transparent 100%)'
                : 'linear-gradient(to right, rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.75) 42%, rgba(250,247,242,0.18) 72%, transparent 100%)',
            }}
          />

          {/* Text content */}
          <div className="relative z-10 w-full p-8 pb-14 lg:p-14 lg:pb-16">
            <div className="max-w-[440px]">
              <h1
                className="text-[2.2rem] font-normal leading-[1.12] lg:text-[2.7rem]"
                style={{ fontFamily: df, color: 'var(--color-brand-text)' }}
              >
                {t('heroHeadline')}
              </h1>
              <div
                aria-hidden
                className="mb-5 mt-4"
                style={{ width: 36, height: 2, background: 'var(--color-brand-primary)' }}
              />
              <p
                className="mb-8 text-[15px] leading-[1.7]"
                style={{ color: 'var(--color-brand-text-muted)' }}
              >
                {t('heroCopy')}
              </p>

              {/* WhatsApp CTA */}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 flex w-fit items-center gap-3 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ background: '#1B4820' }}
                >
                  <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  {t('whatsappBtn')}
                </a>
              )}

              {/* Call CTA */}
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="mb-5 flex w-fit items-center gap-3 rounded-lg border px-5 py-3 text-sm font-semibold transition-all hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    borderColor: 'var(--color-brand-border)',
                    color: 'var(--color-brand-text)',
                  }}
                >
                  <Phone className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  {t('callBtn')}
                </a>
              )}

              {/* Track order link */}
              <Link
                href="/suivi-commande"
                className="group inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
                style={{ color: 'var(--color-brand-text-muted)' }}
              >
                <Package className="h-4 w-4" strokeWidth={1.6} />
                <span className="underline underline-offset-4">{t('trackLink')}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  style={isAr ? { transform: 'rotate(180deg)' } : undefined}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: cream bg + floating form card */}
        <div
          className="flex items-start justify-center px-6 py-10 lg:items-center lg:px-10 lg:py-14"
          style={{ background: 'var(--color-brand-surface)' }}
        >
          {whatsappHref ? (
            <div
              id="contact-form"
              className="w-full max-w-[420px] rounded-2xl p-6 shadow-md lg:p-7"
              style={{
                background: 'var(--color-brand-surface-elevated)',
                border: '1px solid var(--color-brand-border)',
              }}
            >
              <ContactForm
                title={t('formCardTitle')}
                nameLabel={t('formName')}
                phoneLabel={t('formPhone')}
                emailLabel={t('formEmail')}
                subjectLabel={t('formSubject')}
                subjects={subjects}
                messageLabel={t('formMessage')}
                submitLabel={t('formSendBtn')}
                whatsappHref={whatsappHref}
                locale={locale}
              />
            </div>
          ) : (
            <div
              className="w-full max-w-[420px] rounded-2xl p-7 shadow-md"
              style={{
                background: 'var(--color-brand-surface-elevated)',
                border: '1px solid var(--color-brand-border)',
              }}
            >
              <Package
                className="h-8 w-8 text-[var(--color-brand-primary)]"
                strokeWidth={1.5}
              />
              <h2
                className="mt-5 text-xl font-normal text-[var(--color-brand-text)]"
                style={{ fontFamily: df }}
              >
                {isAr ? 'هل تحتاج مساعدة بشأن طلب؟' : 'Besoin d’aide avec une commande ?'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-brand-text-muted)]">
                {isAr
                  ? 'استخدم صفحة تتبع الطلب أو راجع معلومات التوصيل والإرجاع.'
                  : 'Utilisez le suivi de commande ou consultez les informations de livraison et retours.'}
              </p>
              <Link
                href="/suivi-commande"
                className="form-submit mt-6 w-full"
              >
                {t('trackLink')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ━━━ 2 · Trust bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="border-y"
        style={{
          background: 'var(--color-brand-surface)',
          borderColor: 'var(--color-brand-border)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            style={{ borderColor: 'var(--color-brand-border)' }}
          >
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-8 py-5">
                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: 'var(--color-brand-text-muted)' }}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-brand-text)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 3 · Channel cards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-14 lg:py-20" style={{ background: 'var(--color-brand-surface)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map(({ icon: Icon, color, title, desc, link, linkLabel, external }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl p-5 transition-shadow hover:shadow-sm"
                style={{
                  background: 'var(--color-brand-surface-elevated)',
                  border: '1px solid var(--color-brand-border)',
                }}
              >
                {/* Icon chip */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: color }}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.6} />
                </div>

                <div className="flex-1">
                  <h3
                    className="mb-1.5 text-[15px] font-semibold"
                    style={{ fontFamily: df, color: 'var(--color-brand-text)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-brand-text-muted)' }}>
                    {desc}
                  </p>
                </div>

                {/* Link */}
                {external ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all hover:gap-2.5"
                    style={{ color: 'var(--color-brand-text-muted)' }}
                  >
                    {linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" style={isAr ? { transform: 'rotate(180deg)' } : undefined} />
                  </a>
                ) : (
                  <Link
                    href={link}
                    className="group inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all hover:gap-2.5"
                    style={{ color: 'var(--color-brand-primary)' }}
                  >
                    {linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" style={isAr ? { transform: 'rotate(180deg)' } : undefined} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4 · FAQ — 3-column horizontal accordion ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="py-14 lg:py-20"
        style={{
          background: 'var(--color-brand-surface-elevated)',
          borderTop: '1px solid var(--color-brand-border)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          {/* Heading */}
          <div className="mb-10">
            <h2
              className="text-[1.7rem] font-normal"
              style={{ fontFamily: df, color: 'var(--color-brand-text)' }}
            >
              {t('faqTitle')}
            </h2>
            <div
              aria-hidden
              className="mt-3"
              style={{ width: 32, height: 2, background: 'var(--color-brand-primary)' }}
            />
          </div>

          {/* 3-column accordion using native <details> */}
          <div className="grid gap-0 divide-y border-t lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-0" style={{ borderColor: 'var(--color-brand-border)' }}>
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border-t lg:border-t-0" style={{ borderColor: 'var(--color-brand-border)' }}>
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-4 px-0 py-5 lg:px-6 lg:py-6"
                  style={{ color: 'var(--color-brand-text)' }}
                >
                  <span className="text-sm font-semibold leading-snug">{q}</span>
                  <ChevronDown
                    className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    style={{ color: 'var(--color-brand-text-muted)' }}
                    strokeWidth={1.8}
                  />
                </summary>
                <p
                  className="pb-6 text-[14px] leading-relaxed lg:px-6"
                  style={{ color: 'var(--color-brand-text-muted)' }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
