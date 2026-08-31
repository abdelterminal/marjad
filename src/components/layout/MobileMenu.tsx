'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Menu, Package, User, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type Category = {
  id: number;
  slug: string;
  nameFr: string;
  nameAr: string;
};

interface Props {
  categories?: Category[];
  locale?: string;
}

export function MobileMenu({ categories = [], locale: localeProp }: Props) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const locale = localeProp ?? currentLocale;
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const isAr = locale === 'ar';

  const primaryLinks = [
    { label: isAr ? 'الجديد' : 'Nouveautés', href: '/products?sort=newest' },
    { label: isAr ? 'حول مرجاد' : 'À propos', href: '/a-propos' },
    { label: isAr ? 'التوصيل والإرجاع' : 'Livraison & retours', href: '/livraison-retours' },
    { label: isAr ? 'تتبع الطلب' : 'Suivi de commande', href: '/suivi-commande' },
    { label: isAr ? 'تواصل معنا' : 'Contact', href: '/contact' },
  ];

  function close() { setOpen(false); }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex items-center justify-center lg:hidden
          h-10 w-10 rounded-full
          border border-[var(--color-brand-border)]
          text-[var(--color-brand-text-muted)]
          hover:border-[var(--color-brand-primary)]/40
          hover:text-[var(--color-brand-primary)]
          hover:bg-[var(--color-brand-surface-alt)]
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
        "
        aria-label={isAr ? 'فتح القائمة' : 'Ouvrir le menu'}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={isAr ? 'right' : 'left'}
          className="flex w-[min(88vw,380px)] flex-col border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-0"
        >
          {/* Header */}
          <SheetHeader className="border-b border-[var(--color-brand-border)] px-5 py-5 bg-[var(--color-brand-surface-alt)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/marjad-mark.svg"
                  alt=""
                  width={368}
                  height={368}
                  className="h-9 w-9 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">MARJAD</p>
                  <SheetTitle className="mt-0.5 font-['Playfair_Display',Georgia,serif] text-xl font-bold text-[var(--color-brand-text)]">
                    {isAr ? 'القائمة' : 'Menu'}
                  </SheetTitle>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] transition-colors"
                aria-label={isAr ? 'إغلاق' : 'Fermer'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </SheetHeader>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label={isAr ? 'التنقل الرئيسي' : 'Navigation principale'}>

            {/* Categories collapsible */}
            {categories.length > 0 && (
              <div className="mb-1">
                <button
                  type="button"
                  onClick={() => setCatsOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors"
                >
                  {isAr ? 'الفئات' : 'Catégories'}
                  <ChevronDown className={`h-4 w-4 text-[var(--color-brand-text-muted)] transition-transform duration-200 ${catsOpen ? 'rotate-180' : ''}`} />
                </button>

                {catsOpen && (
                  <div className="mt-1 ms-3 grid grid-cols-2 gap-2 pb-2">
                    {categories.map((cat) => {
                      const name = isAr ? cat.nameAr : cat.nameFr;
                      return (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.slug}`}
                          onClick={close}
                          className="group rounded-lg overflow-hidden border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/40 transition-colors"
                        >
                          <div
                            className="aspect-video w-full bg-cover bg-center"
                            style={{ backgroundImage: `url('/images/category-${cat.slug}.webp')` }}
                          />
                          <div className="px-2 py-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {name}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Primary links */}
            <div className="space-y-0.5">
              {primaryLinks.map((link) => {
                const active = pathname === link.href || pathname === link.href.split('?')[0];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={[
                      'flex min-h-[46px] items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)] font-semibold'
                        : 'text-[var(--color-brand-text-muted)] hover:bg-[var(--color-brand-surface-alt)] hover:text-[var(--color-brand-text)]',
                    ].join(' ')}
                  >
                    {link.label}
                    <span className="text-[var(--color-brand-text-subtle)] rtl:rotate-180 text-xs">→</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer actions */}
          <div className="border-t border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-5 py-4">
            {session?.user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--color-brand-text)] px-3 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary)] transition-colors"
                >
                  <Package className="h-4 w-4" />
                  {isAr ? 'طلباتي' : 'Commandes'}
                </Link>
                <Link
                  href="/account/profile"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] px-3 text-xs font-semibold text-[var(--color-brand-text)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  <User className="h-4 w-4" />
                  {isAr ? 'ملفي' : 'Profil'}
                </Link>
              </div>
            ) : (
              <Link
                href="/account/login"
                onClick={close}
                className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-brand-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] transition-colors"
              >
                {t('common.login')}
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
