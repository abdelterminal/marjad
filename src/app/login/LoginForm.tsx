'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'form-input h-12 bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-text)] placeholder:text-[var(--color-brand-text-subtle)] disabled:opacity-60';

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--color-brand-surface)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1200px] grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)]">
        <section className="hidden border-e border-[var(--color-brand-border)] bg-[var(--color-brand-text)] text-white lg:block">
          <div className="relative flex h-full min-h-screen flex-col justify-between overflow-hidden px-10 py-10">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.48]"
              style={{ backgroundImage: "url('/images/brand-story.webp')" }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,26,0.38)_0%,rgba(26,26,26,0.82)_100%)]" />

            <div className="relative z-10">
              <Link
                href="/fr"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/78 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au site
              </Link>
            </div>

            <div className="relative z-10 max-w-[430px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-secondary)]">
                MARJAD
              </p>
              <h1 className="mt-4 font-[var(--font-display)] text-5xl font-bold leading-[1.02] text-white">
                Espace admin
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/76">
                Gérez les produits, les commandes et les catégories depuis un accès réservé à l&apos;équipe.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 border-t border-white/18 pt-5 text-sm text-white/72">
              <ShieldCheck className="h-5 w-5 text-[var(--color-brand-secondary)]" />
              Connexion sécurisée par identifiants administrateur.
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-14">
          <div className="mx-auto w-full max-w-[440px]">
            <Link
              href="/fr"
              className="mb-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-text-muted)] transition-colors hover:text-[var(--color-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>

            <div className="mb-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-text)] text-white shadow-[var(--shadow-sm)]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                MARJAD Admin
              </p>
              <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2.1rem,7vw,3.25rem)] font-bold leading-[1.04] text-[var(--color-brand-text)]">
                Connexion
              </h1>
              <p className="mt-3 max-w-[34rem] text-sm leading-6 text-[var(--color-brand-text-muted)]">
                Accédez au tableau de bord pour suivre les commandes et mettre à jour le catalogue.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="form-panel space-y-5 p-5 sm:p-6"
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--color-brand-border-error)] bg-[var(--color-brand-error-light)] px-4 py-3 text-sm leading-6 text-[var(--color-brand-error)]"
                >
                  {error}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="admin-email" className="form-label">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} ${error ? 'form-input-error' : ''}`}
                  aria-invalid={Boolean(error)}
                  dir="ltr"
                />
              </div>

              <div className="form-field">
                <label htmlFor="admin-password" className="form-label">
                  Mot de passe
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} ${error ? 'form-input-error' : ''}`}
                  aria-invalid={Boolean(error)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="form-submit h-12 w-full bg-[var(--color-brand-text)] hover:bg-[var(--color-brand-primary)] disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-[var(--color-brand-text-subtle)]">
              Accès réservé aux administrateurs MARJAD.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
