import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartIcon } from './CartIcon';
import { HeaderUserMenu } from './HeaderUserMenu';
import { MobileMenu } from './MobileMenu';
import { AnnouncementBar } from './AnnouncementBar';
import { CategoriesDropdown } from './CategoriesDropdown';
import { listCategories } from '@/lib/queries/categories';

export async function Header() {
  const t = await getTranslations();
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const categories = await listCategories();

  const navLinks = [
    {
      label: isAr ? 'الجديد' : 'Nouveautés',
      href: `/${locale}/products?sort=newest`,
      highlight: true,
    },
    {
      label: isAr ? 'حول مرجاد' : 'À propos',
      href: `/${locale}/a-propos`,
    },
    {
      label: isAr ? 'تواصل' : 'Contact',
      href: `/${locale}/contact`,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-brand-surface)]/96 backdrop-blur-md border-b border-[var(--color-brand-border)]">
      <AnnouncementBar />

      <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 lg:h-[72px] items-center">

          {/* ── Logo ── */}
          <Link
            href={`/${locale}`}
            aria-label={`${t('common.brand')} — Accueil`}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 rounded"
          >
            <span className="font-['Playfair_Display',Georgia,serif] text-[1.35rem] font-bold tracking-widest text-[var(--color-brand-text)] hover:text-[var(--color-brand-primary)] transition-colors">
              MARJAD
            </span>
          </Link>

          {/* ── Desktop nav — centered ── */}
          <nav
            className="hidden lg:flex flex-1 items-center justify-center gap-8"
            aria-label="Navigation principale"
          >
            {/* Nouveautés */}
            <Link
              href={`/${locale}/products?sort=newest`}
              className="text-sm font-semibold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] transition-colors focus-visible:outline-none"
            >
              {isAr ? 'الجديد' : 'Nouveautés'}
            </Link>

            {/* Catégories dropdown */}
            <CategoriesDropdown categories={categories} locale={locale} />

            {/* Remaining links */}
            {navLinks.slice(1).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)] transition-colors focus-visible:outline-none"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5 ms-auto">

            {/* Search */}
            <Link
              href={`/${locale}/products`}
              aria-label={isAr ? 'بحث' : 'Rechercher'}
              className="
                hidden md:inline-flex items-center justify-center
                h-10 w-10 rounded-full
                text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)]
                hover:bg-[var(--color-brand-surface-alt)]
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]
              "
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </Link>

            <LanguageSwitcher />
            <CartIcon />

            {/* Account — subtle icon, desktop only */}
            <div className="hidden md:block">
              <HeaderUserMenu />
            </div>

            {/* Mobile hamburger */}
            <MobileMenu categories={categories} locale={locale} />
          </div>

        </div>
      </div>
    </header>
  );
}
