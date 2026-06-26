import type { ReactNode } from 'react';

export const metadata = { title: 'Connexion — MARJAD Admin' };

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-brand-surface)] text-[var(--color-brand-text)] antialiased">
      {children}
    </div>
  );
}
