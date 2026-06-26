import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { RegisterForm } from './RegisterForm';

export async function generateMetadata() {
  const locale = await getLocale();
  return {
    title: locale === 'ar' ? 'إنشاء حساب' : 'Créer un compte',
  };
}

export default async function RegisterPage() {
  const locale = await getLocale();
  return (
    <Suspense>
      <RegisterForm locale={locale} />
    </Suspense>
  );
}
