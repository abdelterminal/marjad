'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Loader2, PackageCheck, ShieldCheck, UserPlus } from 'lucide-react';

interface Props {
  locale: string;
}

export function RegisterForm({ locale }: Props) {
  const router = useRouter();
  const isAr = locale === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(
          json.error ??
            (isAr ? 'تعذر إنشاء الحساب.' : 'Impossible de créer le compte.'),
        );
        return;
      }

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError(
          isAr
            ? 'تم إنشاء الحساب. يرجى تسجيل الدخول.'
            : 'Compte créé. Veuillez vous connecter.',
        );
        router.push(`/${locale}/account/login`);
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
      <section className="mx-auto grid min-h-[calc(100svh-9rem)] w-full max-w-[1120px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,500px)] lg:px-10 lg:py-16">
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
            MARJAD
          </p>
          <h1 className="mt-4 max-w-[560px] font-[var(--font-display)] text-[clamp(3rem,5.6vw,5.75rem)] font-bold leading-[0.98] text-[var(--color-brand-text)]">
            {isAr ? 'ابدأ رحلتك معنا' : 'Créer votre espace'}
          </h1>
          <p className="mt-6 max-w-[440px] text-base leading-7 text-[var(--color-brand-text-muted)]">
            {isAr
              ? 'احفظ معلوماتك، تابع طلباتك، واجعل تجربة الشراء القادمة أسرع.'
              : 'Enregistrez vos informations, suivez vos commandes et facilitez vos prochains achats.'}
          </p>
          <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-3">
            {[
              {
                icon: PackageCheck,
                label: isAr ? 'طلبات محفوظة' : 'Commandes suivies',
              },
              {
                icon: ShieldCheck,
                label: isAr ? 'بيانات محمية' : 'Données protégées',
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

        <div className="mx-auto min-w-0" style={{ width: 'min(100%, 500px)' }}>
          <div className="mb-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-text)] text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              MARJAD
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-[clamp(2rem,8vw,3.25rem)] font-bold leading-tight text-[var(--color-brand-text)]">
              {isAr ? 'إنشاء حساب' : 'Créer un compte'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-brand-text-muted)]">
              {isAr ? 'انضم إلى مجتمع MARJAD.' : 'Rejoignez la communauté MARJAD.'}
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
            <label className="form-label" htmlFor="reg-name">
              {isAr ? 'الاسم الكامل' : 'Nom complet'}
              <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-email">
              {isAr ? 'البريد الإلكتروني' : 'E-mail'}
              <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
            </label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">
              {isAr ? 'كلمة المرور' : 'Mot de passe'}
              <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={72}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <p className="form-help">
              {isAr
                ? '١٠ أحرف على الأقل، مع حرف ورقم'
                : '10 caractères minimum, avec une lettre et un chiffre'}
            </p>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-phone">
              {isAr ? 'رقم الهاتف' : 'Téléphone'}
              <span className="ms-1 font-normal normal-case tracking-normal text-[var(--color-brand-text-muted)]">
                ({isAr ? 'اختياري' : 'facultatif'})
              </span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              maxLength={17}
              disabled={loading}
              placeholder="0612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              dir="ltr"
            />
          </div>

          <button type="submit" disabled={loading} className="form-submit w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading
              ? isAr
                ? 'جار إنشاء الحساب...'
                : 'Création...'
              : isAr
                ? 'إنشاء الحساب'
                : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-brand-text-muted)]">
          {isAr ? 'لديك حساب بالفعل؟ ' : 'Déjà un compte ? '}
          <Link
            href="/account/login"
            className="font-semibold text-[var(--color-brand-primary)] hover:underline underline-offset-2"
          >
            {isAr ? 'تسجيل الدخول' : 'Se connecter'}
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}
