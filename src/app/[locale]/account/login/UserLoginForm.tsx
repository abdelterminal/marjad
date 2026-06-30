'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Loader2, LockKeyhole, PackageCheck, ShieldCheck } from 'lucide-react';

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
    <main className="bg-[var(--color-brand-surface)]">
      <section className="mx-auto grid min-h-[calc(100svh-9rem)] w-full max-w-[1120px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,480px)] lg:px-10 lg:py-16">
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
            MARJAD
          </p>
          <h1 className="mt-4 max-w-[560px] font-[var(--font-display)] text-[clamp(3rem,5.6vw,5.75rem)] font-bold leading-[0.98] text-[var(--color-brand-text)]">
            {isAr ? 'مساحتك الخاصة' : 'Votre espace client'}
          </h1>
          <p className="mt-6 max-w-[440px] text-base leading-7 text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'تابع طلباتك واحفظ معلوماتك لتجربة أسرع في الطلب القادم.'
              : 'Suivez vos commandes et retrouvez vos informations pour commander plus vite.'}
          </p>
          <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-3">
            {[
              {
                icon: PackageCheck,
                label: isAr ? 'تتبع الطلبات' : 'Suivi des commandes',
              },
              {
                icon: ShieldCheck,
                label: isAr ? 'حساب آمن' : 'Compte sécurisé',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex min-h-16 items-center gap-3 border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] px-4 py-3"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[var(--color-brand-primary)]" />
                  <span className="text-sm font-semibold text-[var(--color-brand-text)]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto min-w-0" style={{ width: 'min(100%, 480px)' }}>
          <div className="mb-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-text)] text-white">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              MARJAD
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-[clamp(2rem,8vw,3.25rem)] font-bold leading-tight text-[var(--color-brand-text)]">
              {isAr ? 'تسجيل الدخول' : 'Se connecter'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-brand-text-muted)]">
              {isAr ? 'أدخل بيانات حسابك للمتابعة.' : 'Accédez à votre espace client.'}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="form-panel flex w-full flex-col gap-5 p-5 sm:p-6">
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
              maxLength={254}
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
              maxLength={72}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="form-submit w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? (isAr ? 'جار الدخول...' : 'Connexion...') : isAr ? 'دخول' : 'Se connecter'}
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
      </section>
    </main>
  );
}
