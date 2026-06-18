'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const targetLocale = locale === 'fr' ? 'ar' : 'fr';
  // Label shows what the user will switch TO
  const label = locale === 'fr' ? 'ع' : 'FR';
  const ariaLabel = locale === 'fr' ? 'Passer en arabe' : 'Switch to French';

  function handleSwitch() {
    router.replace(pathname, { locale: targetLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      aria-label={ariaLabel}
      className="
        inline-flex items-center justify-center
        min-w-[44px] min-h-[44px] px-3
        rounded-[var(--radius-pill)]
        border border-[var(--color-brand-border)]
        bg-[var(--color-brand-surface)]
        text-[var(--color-brand-text-muted)]
        text-sm font-semibold
        hover:border-[var(--color-brand-primary)]
        hover:text-[var(--color-brand-primary)]
        transition-colors duration-[var(--transition-fast)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-brand-primary)]
        focus-visible:ring-offset-2
      "
    >
      {label}
    </button>
  );
}
