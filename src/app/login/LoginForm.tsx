'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
    'w-full h-10 px-3 rounded-[2px] bg-white/8 border border-white/12 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-secondary)] focus:ring-1 focus:ring-[var(--color-brand-secondary)] transition-colors disabled:opacity-50';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[2px] bg-[var(--color-brand-primary)] mb-4">
            <span className="font-serif text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-white text-xl font-semibold tracking-tight">MARJAD Admin</h1>
          <p className="text-white/40 text-sm mt-1">Tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-[2px] bg-red-500/15 border border-red-500/30 text-red-300 text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-[0.1em] mb-2">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-[0.1em] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-11 mt-2
              rounded-[2px]
              bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]
              text-white font-semibold text-sm
              flex items-center justify-center gap-2
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
