'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-[var(--font-display)] text-xs font-bold tracking-[0.22em] uppercase text-[var(--color-brand-primary)] mb-3">
            MARJAD
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-brand-text)]">
            {isAr ? 'إنشاء حساب' : 'Créer un compte'}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-brand-text-muted)]">
            {isAr ? 'انضم إلى مجتمع MARJAD' : 'Rejoignez la communauté MARJAD'}
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
              minLength={8}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <p className="form-help">
              {isAr ? '٨ أحرف على الأقل' : '8 caractères minimum'}
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
              disabled={loading}
              placeholder="0612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              dir="ltr"
            />
          </div>

          <button type="submit" disabled={loading} className="form-submit w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAr ? 'إنشاء الحساب' : 'Créer mon compte'}
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
    </div>
  );
}
