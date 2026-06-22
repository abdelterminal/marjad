import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { getWhatsAppHref } from '@/lib/contact';

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const whatsappHref = getWhatsAppHref();

  return (
    <footer className="mt-auto bg-[var(--color-brand-text)] text-white">

      {/* Main footer body */}
      <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

          {/* Brand column — spans 5 on md */}
          <div className="md:col-span-5 space-y-4">
            <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-secondary)] tracking-wide">
              MARJAD
            </p>
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

          {/* Newsletter column */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.14em]">
              {t('footer.newsletter')}
            </h3>
            <p className="text-sm text-white/60 leading-snug">
              {t('footer.newsletterDesc')}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                aria-label={t('footer.emailPlaceholder')}
                className="
                  flex-1 h-10 px-3
                  text-sm text-white
                  bg-white/10 border border-white/20
                  rounded-[var(--radius-input)]
                  placeholder:text-white/35
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)]/50
                  focus:border-[var(--color-brand-secondary)]/60
                  hover:border-white/35
                  transition-colors duration-150
                "
              />
              <button
                type="button"
                className="
                  h-10 px-4 flex-shrink-0
                  rounded-[var(--radius-btn)]
                  bg-white text-[var(--color-brand-text)]
                  hover:bg-[var(--color-brand-secondary)]
                  text-sm font-semibold
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-1
                  focus-visible:ring-offset-[var(--color-brand-text)]
                "
              >
                {t('footer.subscribe')}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-[var(--container-content)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            {whatsappHref && (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/35 hover:text-[var(--color-brand-secondary)] transition-colors duration-150"
                  aria-label="WhatsApp"
                >
                  WhatsApp
                </a>
                <span className="text-white/15">·</span>
              </>
            )}
            <Link
              href={`/${locale}/livraison-retours`}
              className="text-xs text-white/35 hover:text-[var(--color-brand-secondary)] transition-colors duration-150"
            >
              {t('footer.supportDelivery')}
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
