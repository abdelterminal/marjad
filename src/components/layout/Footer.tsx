import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <footer
      className="
        mt-auto
        bg-[var(--color-brand-surface-alt)]
        border-t border-[var(--color-brand-border)]
      "
    >
      <div
        className="
          mx-auto max-w-[var(--container-content)]
          px-4 sm:px-6
          py-12
          grid grid-cols-1 md:grid-cols-3 gap-10
        "
      >
        {/* Col 1: Logo + tagline */}
        <div className="space-y-3">
          <p
            className="
              font-['Playfair_Display',Georgia,serif]
              text-xl font-bold
              text-[var(--color-brand-primary)]
            "
          >
            MARJAD
          </p>
          <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed max-w-xs">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Col 2: Nav links */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-brand-text)] uppercase tracking-wider">
            {t('footer.explore')}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/products`}
                className="
                  text-sm text-[var(--color-brand-text-muted)]
                  hover:text-[var(--color-brand-primary)]
                  transition-colors duration-[var(--transition-fast)]
                "
              >
                {t('nav.products')}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="
                  text-sm text-[var(--color-brand-text-muted)]
                  hover:text-[var(--color-brand-primary)]
                  transition-colors duration-[var(--transition-fast)]
                "
              >
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="
                  text-sm text-[var(--color-brand-text-muted)]
                  hover:text-[var(--color-brand-primary)]
                  transition-colors duration-[var(--transition-fast)]
                "
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Newsletter placeholder */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-brand-text)] uppercase tracking-wider">
            {t('footer.newsletter')}
          </h3>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            {t('footer.newsletterDesc')}
          </p>
          <div className="flex gap-2 max-w-xs">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              aria-label={t('footer.emailPlaceholder')}
              className="
                flex-1 h-10 px-3
                text-sm
                bg-[var(--color-brand-surface-elevated)]
                border border-[var(--color-brand-border)]
                rounded-[var(--radius-input)]
                text-[var(--color-brand-text)]
                placeholder:text-[var(--color-brand-text-subtle)]
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-brand-primary)]/30
                focus:border-[var(--color-brand-border-focus)]
                transition-colors duration-[var(--transition-fast)]
              "
            />
            <button
              type="button"
              className="
                h-10 px-4
                rounded-[var(--radius-btn)]
                bg-[var(--color-brand-primary)]
                hover:bg-[var(--color-brand-primary-hover)]
                text-white text-sm font-semibold
                transition-colors duration-[var(--transition-fast)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-primary)]
                focus-visible:ring-offset-2
                whitespace-nowrap
              "
            >
              {t('footer.subscribe')}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="
          border-t border-[var(--color-brand-border)]
          px-4 sm:px-6 py-4
        "
      >
        <p className="text-center text-xs text-[var(--color-brand-text-muted)]">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
