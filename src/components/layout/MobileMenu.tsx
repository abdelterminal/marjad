'use client';

import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, Package, User, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuthModal } from '@/components/auth/AuthProvider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function MobileMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';

  const primaryLinks = [
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.about'), href: '/a-propos' },
    { label: t('footer.supportDelivery'), href: '/livraison-retours' },
    { label: t('footer.supportTrack'), href: '/suivi-commande' },
    { label: t('footer.supportFaq'), href: '/faq' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  function close() {
    setOpen(false);
  }

  function handleLogin() {
    close();
    openAuthModal('login');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex items-center justify-center md:hidden
          min-w-[44px] min-h-[44px]
          rounded-[var(--radius-pill)]
          border border-[var(--color-brand-border)]
          bg-[var(--color-brand-surface-elevated)]
          text-[var(--color-brand-text)]
          hover:border-[var(--color-brand-primary)]/40
          hover:text-[var(--color-brand-primary)]
          transition-colors duration-[var(--transition-fast)]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
        "
        aria-label={isAr ? 'فتح القائمة' : 'Ouvrir le menu'}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={isAr ? 'right' : 'left'}
          className="flex w-[min(88vw,380px)] flex-col border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-0"
        >
          <SheetHeader className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-brand-primary)]">
                  MARJAD
                </p>
                <SheetTitle className="mt-1 font-[var(--font-display)] text-2xl font-bold text-[var(--color-brand-text)]">
                  {isAr ? 'القائمة' : 'Menu'}
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-text)]"
                aria-label={isAr ? 'إغلاق القائمة' : 'Fermer le menu'}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </SheetHeader>

          <nav className="flex-1 px-5 py-5" aria-label={isAr ? 'التنقل الرئيسي' : 'Navigation principale'}>
            <div className="space-y-1">
              {primaryLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={[
                      'flex min-h-[46px] items-center justify-between rounded-[var(--radius-sm)] px-3 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]'
                        : 'text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] hover:text-[var(--color-brand-primary)]',
                    ].join(' ')}
                  >
                    {link.label}
                    <span className="text-[var(--color-brand-text-subtle)] rtl:rotate-180">→</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-5 py-5">
            {session?.user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)]"
                >
                  <Package className="h-4 w-4" aria-hidden="true" />
                  {isAr ? 'طلباتي' : 'Commandes'}
                </Link>
                <Link
                  href="/account/profile"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] px-3 text-xs font-semibold text-[var(--color-brand-text)] transition-colors hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  {isAr ? 'ملفي' : 'Profil'}
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-primary)]"
              >
                {t('common.login')}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
