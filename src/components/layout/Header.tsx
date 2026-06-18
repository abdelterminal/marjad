import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartIcon } from './CartIcon';
import { HeaderUserMenu } from './HeaderUserMenu';

export async function Header() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        bg-[var(--color-brand-surface)]/95
        backdrop-blur-sm
        border-b border-[var(--color-brand-border)]
      "
    >
      <div
        className="
          mx-auto max-w-[var(--container-content)]
          px-4 sm:px-6
          h-14 sm:h-16
          flex items-center
        "
      >
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="
            font-['Playfair_Display',Georgia,serif]
            text-xl font-bold tracking-wide
            text-[var(--color-brand-primary)]
            hover:opacity-80
            transition-opacity duration-[var(--transition-fast)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--color-brand-primary)]
            focus-visible:ring-offset-2
            rounded
          "
          aria-label={`${t('common.brand')} — Accueil`}
        >
          MARJAD
        </Link>

        {/* Desktop nav (center) */}
        <nav
          className="hidden md:flex items-center gap-6 ms-8"
          aria-label="Navigation principale"
        >
          <Link
            href={`/${locale}/products`}
            className="
              text-sm font-medium text-[var(--color-brand-text-muted)]
              hover:text-[var(--color-brand-primary)]
              transition-colors duration-[var(--transition-fast)]
            "
          >
            {t('nav.products')}
          </Link>
          <Link
            href="#"
            className="
              text-sm font-medium text-[var(--color-brand-text-muted)]
              hover:text-[var(--color-brand-primary)]
              transition-colors duration-[var(--transition-fast)]
            "
          >
            {t('nav.about')}
          </Link>
          <Link
            href="#"
            className="
              text-sm font-medium text-[var(--color-brand-text-muted)]
              hover:text-[var(--color-brand-primary)]
              transition-colors duration-[var(--transition-fast)]
            "
          >
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ms-auto">
          <LanguageSwitcher />
          <CartIcon />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
