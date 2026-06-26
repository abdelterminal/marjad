import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { UserLoginForm } from './UserLoginForm';

export async function generateMetadata() {
  const locale = await getLocale();
  return {
    title: locale === 'ar' ? 'تسجيل الدخول' : 'Connexion',
  };
}

export default async function UserLoginPage() {
  const locale = await getLocale();
  return (
    <Suspense>
      <UserLoginForm locale={locale} />
    </Suspense>
  );
}
