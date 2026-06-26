'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';

interface Props {
  locale: string;
}

export function UserLoginForm({ locale }: Props) {
  const router = useRouter();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError(
          isAr
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : 'Email ou mot de passe incorrect.',
        );
      } else {
        router.push(`/${locale}/account`);
        router.refresh();
      }
    } catch {
      setError(
        isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'Une erreur est survenue. Réessayez.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-[var(--font-display)] text-xs font-bold tracking-[0.22em] uppercase text-[var(--color-brand-primary)] mb-3">
            MARJAD
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-brand-text)]">
            {isAr ? 'تسجيل الدخول' : 'Se connecter'}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-brand-text-muted)]">
            {isAr ? 'أدخل بيانات حسابك للمتابعة' : 'Accédez à votre espace client'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-panel flex flex-col gap-5 p-6">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-[var(--radius-sm)] bg-[var(--color-brand-error-light)] border-s-[3px] border-[var(--color-brand-error)] text-sm text-[var(--color-brand-error)]"
            >
              {error}
            </div>
          )}

          <div className="form-field">
            <label className="form-label" htmlFor="login-email">
              {isAr ? 'البريد الإلكتروني' : 'E-mail'}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              dir="ltr"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">
              {isAr ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="form-submit w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAr ? 'دخول' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-brand-text-muted)]">
          {isAr ? 'ليس لديك حساب؟ ' : "Pas encore de compte ? "}
          <Link
            href="/account/register"
            className="font-semibold text-[var(--color-brand-primary)] hover:underline underline-offset-2"
          >
            {isAr ? 'إنشاء حساب' : 'Créer un compte'}
          </Link>
        </p>
      </div>
    </div>
  );
}
