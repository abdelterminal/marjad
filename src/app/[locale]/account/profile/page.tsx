import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth-guards';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from '@/components/account/ProfileForm';

export default async function ProfilePage() {
  const locale = await getLocale();
  const user = await requireUser(locale);
  const isAr = locale === 'ar';

  const userId = parseInt(user.id, 10);
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, email: true, phone: true },
  });

  const displayName = dbUser?.name ?? user.name ?? '';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <main className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)] tracking-wide">
          {isAr ? 'حسابي' : 'Mon compte'}
        </h1>

        {/* Tab nav */}
        <div className="flex gap-6 mt-4 border-b border-[var(--color-brand-border)]">
          <Link
            href="/account"
            className="pb-3 text-sm font-medium text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] transition-colors"
          >
            {isAr ? 'طلباتي' : 'Mes commandes'}
          </Link>
          <Link
            href="/account/profile"
            className="pb-3 text-sm font-semibold text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)] -mb-px"
            aria-current="page"
          >
            {isAr ? 'ملفي الشخصي' : 'Mon profil'}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        {/* Avatar card */}
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-border)] bg-white px-8 py-8 text-center lg:w-52 shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-primary-light)] text-[var(--color-brand-primary)]">
            <span className="font-[var(--font-display)] text-xl font-bold">
              {initials || '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-brand-text)] truncate max-w-[160px]">
              {displayName || '—'}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-brand-text-muted)] truncate max-w-[160px]">
              {dbUser?.email ?? user.email ?? ''}
            </p>
          </div>
        </div>

        {/* Profile form */}
        <div className="flex-1 min-w-0">
          <ProfileForm
            initialName={dbUser?.name ?? user.name ?? ''}
            initialPhone={dbUser?.phone ?? ''}
            email={dbUser?.email ?? user.email ?? ''}
            locale={locale}
          />
        </div>
      </div>
    </main>
  );
}
