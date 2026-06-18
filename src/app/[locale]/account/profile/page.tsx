import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth-guards';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from '@/components/account/ProfileForm';

export default async function ProfilePage() {
  const user = await requireUser();
  const locale = await getLocale();
  const isAr = locale === 'ar';

  // Fetch full user data from DB to get phone
  const userId = parseInt(user.id, 10);
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, email: true, phone: true },
  });

  return (
    <main className="max-w-[var(--container-lg)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--color-brand-text)]">
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
            className="pb-3 text-sm font-semibold text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]"
            aria-current="page"
          >
            {isAr ? 'ملفي الشخصي' : 'Mon profil'}
          </Link>
        </div>
      </div>

      <ProfileForm
        initialName={dbUser?.name ?? user.name ?? ''}
        initialPhone={dbUser?.phone ?? ''}
        email={dbUser?.email ?? user.email ?? ''}
        locale={locale}
      />
    </main>
  );
}
