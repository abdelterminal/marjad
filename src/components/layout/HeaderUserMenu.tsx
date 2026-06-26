'use client';

import { useSession, signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { User, LogOut, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HeaderUserMenu() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  if (status === 'loading') {
    return (
      <div className="hidden sm:block h-9 w-24 rounded-[var(--radius-btn)] bg-[var(--color-brand-surface-alt)] animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/account/login"
        className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-semibold text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
      >
        {isAr ? 'تسجيل الدخول' : 'Connexion'}
      </Link>
    );
  }

  const name = session.user.name ?? session.user.email ?? '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-[var(--radius-btn)] border border-[var(--color-brand-border)] text-sm font-medium text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2"
            aria-label={isAr ? 'قائمة المستخدم' : 'Menu utilisateur'}
          >
            <span className="w-6 h-6 rounded-full bg-[var(--color-brand-primary-light)] flex items-center justify-center text-[var(--color-brand-primary)] text-xs font-bold flex-shrink-0">
              {initial}
            </span>
            <span className="max-w-[100px] truncate">{name}</span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm"
          onClick={() => router.push('/account' as '/')}
        >
          <Package className="w-4 h-4" />
          {isAr ? 'طلباتي' : 'Mes commandes'}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm"
          onClick={() => router.push('/account/profile' as '/')}
        >
          <User className="w-4 h-4" />
          {isAr ? 'ملفي الشخصي' : 'Mon profil'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm text-[var(--color-brand-error)]"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
        >
          <LogOut className="w-4 h-4" />
          {isAr ? 'تسجيل الخروج' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
