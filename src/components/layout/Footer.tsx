import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';
import { getWhatsAppHref, getSupportPhoneHref, getPublicSupportPhoneNumber } from '@/lib/contact';

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const whatsappHref = getWhatsAppHref();
  const phoneHref = getSupportPhoneHref();
  const phoneDisplay = getPublicSupportPhoneNumber();

  return (
    <footer className="mt-auto bg-[var(--color-brand-text)] text-white">

      {/* Main footer body */}
      <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

          {/* Brand column — spans 5 on md */}
          <div className="md:col-span-5 space-y-4">
            <Image
              src="/brand/marjad-logo-horizontal.svg"
              alt="MARJAD"
              width={860}
              height={189}
              className="h-9 w-auto"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-[300px]">
              {t('footer.tagline')}
            </p>
            <p className="text-white/35 text-xs font-mono tracking-wider">
              {t('footer.madeIn')}
            </p>
          </div>

          {/* Explore column */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.14em]">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.products'), href: `/${locale}/products` },
                { label: t('nav.about'),    href: `/${locale}/a-propos` },
                { label: t('nav.contact'),  href: `/${locale}/contact` },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="
                      text-sm text-white/65
                      hover:text-[var(--color-brand-secondary)]
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-1
                      focus-visible:ring-[var(--color-brand-secondary)] rounded-sm
                    "
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.14em]">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('footer.supportDelivery'), href: `/${locale}/livraison-retours` },
                { label: t('footer.supportTrack'),    href: `/${locale}/suivi-commande` },
                { label: t('footer.supportFaq'),      href: `/${locale}/faq` },
                { label: t('footer.supportContact'),  href: `/${locale}/contact` },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="
                      text-sm text-white/65
                      hover:text-[var(--color-brand-secondary)]
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-1
                      focus-visible:ring-[var(--color-brand-secondary)] rounded-sm
                    "
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.14em]">
              {locale === 'ar' ? 'تواصل معنا' : 'Nous contacter'}
            </h3>
            <p className="text-sm text-white/60 leading-snug">
              {locale === 'ar'
                ? 'أسئلة؟ سواء قبل الطلب أو بعده — فريقنا متاح عبر واتساب.'
                : 'Des questions ? Avant ou après commande — notre équipe répond sur WhatsApp.'}
            </p>
            <div className="flex flex-col gap-2.5">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2.5
                    h-11 px-5
                    rounded-[var(--radius-btn)]
                    bg-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-secondary-hover)]
                    text-[var(--color-brand-text)] text-sm font-semibold
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-1
                    focus-visible:ring-offset-[var(--color-brand-text)]
                  "
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {locale === 'ar' ? 'راسلنا على واتساب' : 'Écrire sur WhatsApp'}
                </a>
              )}
              {phoneHref && phoneDisplay && (
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 rounded-sm text-sm text-white/65 transition-colors duration-150 hover:text-[var(--color-brand-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-secondary)]"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {phoneDisplay}
                </a>
              )}
            </div>
            <Link
              href={`/${locale}/contact`}
              className="block rounded-sm text-xs text-white/35 transition-colors duration-150 hover:text-[var(--color-brand-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-secondary)]"
            >
              {locale === 'ar' ? 'أو عبر نموذج التواصل ←' : 'Ou via le formulaire de contact →'}
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-[var(--container-content)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            {phoneHref && phoneDisplay && (
              <>
                <a
                  href={phoneHref}
                  className="rounded-sm text-xs text-white/35 transition-colors duration-150 hover:text-[var(--color-brand-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-secondary)]"
                >
                  {phoneDisplay}
                </a>
                <span className="text-white/15">·</span>
              </>
            )}
            {whatsappHref && (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm text-xs text-white/35 transition-colors duration-150 hover:text-[var(--color-brand-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-secondary)]"
                  aria-label="WhatsApp"
                >
                  WhatsApp
                </a>
                <span className="text-white/15">·</span>
              </>
            )}
            <Link
              href={`/${locale}/livraison-retours`}
              className="rounded-sm text-xs text-white/35 transition-colors duration-150 hover:text-[var(--color-brand-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-secondary)]"
            >
              {t('footer.supportDelivery')}
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
