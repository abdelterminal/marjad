'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function resetErrors() {
    setError(null);
    setFieldErrors({});
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        setError(
          isAr ? 'بيانات غير صحيحة.' : 'Identifiants incorrects.',
        );
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch {
      setError(
        isAr
          ? 'تعذر الاتصال. تحقق من اتصالك.'
          : 'Impossible de se connecter. Vérifiez votre connexion.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone || undefined,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setFieldErrors({
          email: isAr
            ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
            : 'Cet email est déjà utilisé.',
        });
        return;
      }
      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields);
        } else {
          setError(data.error ?? (isAr ? 'حدث خطأ.' : 'Une erreur est survenue.'));
        }
        return;
      }

      // Auto sign-in after register
      const signInResult = await signIn('credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });
      if (signInResult?.error) {
        // Register succeeded but sign-in failed — close modal, user can log in
        onOpenChange(false);
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch {
      setError(
        isAr
          ? 'تعذر الاتصال. تحقق من اتصالك.'
          : 'Impossible de se connecter. Vérifiez votre connexion.',
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'form-input';
  const labelClass = 'form-label';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-[440px] rounded-[var(--radius-md)] bg-[var(--color-brand-surface)] p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="p-6">
          {/* Logo mark */}
          <div className="flex justify-center mb-5">
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary-light)] flex items-center justify-center">
              <span className="text-[var(--color-brand-primary)] font-bold text-lg font-[var(--font-display)]">
                M
              </span>
            </div>
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-[var(--color-brand-text)] mb-1">
              {tab === 'login'
                ? isAr ? 'تسجيل الدخول' : 'Connexion'
                : isAr ? 'إنشاء حساب' : "S'inscrire"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex border-b border-[var(--color-brand-border)] mb-5 mt-3">
            <button
              onClick={() => { setTab('login'); resetErrors(); }}
              className={[
                'flex-1 pb-2 text-sm font-medium transition-colors',
                tab === 'login'
                  ? 'border-b-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                  : 'text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)]',
              ].join(' ')}
            >
              {isAr ? 'تسجيل الدخول' : 'Connexion'}
            </button>
            <button
              onClick={() => { setTab('register'); resetErrors(); }}
              className={[
                'flex-1 pb-2 text-sm font-medium transition-colors',
                tab === 'register'
                  ? 'border-b-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                  : 'text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)]',
              ].join(' ')}
            >
              {isAr ? 'إنشاء حساب' : "S'inscrire"}
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-[var(--radius-sm)] bg-[var(--color-brand-error-light)] border-s-[3px] border-[var(--color-brand-error)] text-sm text-[var(--color-brand-error)]"
            >
              {error}
            </div>
          )}

          {/* LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="form-panel flex flex-col gap-4 p-4">
              <div className="form-field">
                <label className={labelClass} htmlFor="login-email">
                  {isAr ? 'البريد الإلكتروني' : 'E-mail'}
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <div className="form-field">
                <label className={labelClass} htmlFor="login-password">
                  {isAr ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="form-submit w-full mt-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? 'تسجيل الدخول' : 'Se connecter'}
              </button>
            </form>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="form-panel flex flex-col gap-4 p-4">
              <div className="form-field">
                <label className={labelClass} htmlFor="reg-name">
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
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="form-field">
                <label className={labelClass} htmlFor="reg-email">
                  {isAr ? 'البريد الإلكتروني' : 'E-mail'}
                  <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={inputClass}
                  dir="ltr"
                />
                {fieldErrors.email && (
                  <p role="alert" className="form-error">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div className="form-field">
                <label className={labelClass} htmlFor="reg-password">
                  {isAr ? 'كلمة المرور (8 أحرف على الأقل)' : 'Mot de passe (min. 8 caractères)'}
                  <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
                </label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="form-field">
                <label className={labelClass} htmlFor="reg-phone">
                  {isAr ? 'رقم الهاتف (اختياري)' : 'Téléphone (optionnel)'}
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  disabled={loading}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="form-submit w-full mt-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAr ? 'إنشاء حساب' : 'Créer mon compte'}
              </button>
            </form>
          )}

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 end-3 flex items-center justify-center w-8 h-8 rounded-full text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text)] hover:bg-[var(--color-brand-surface-alt)] transition-colors"
            aria-label={isAr ? 'إغلاق' : 'Fermer'}
          >
            ×
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
