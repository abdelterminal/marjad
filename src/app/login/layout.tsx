import type { ReactNode } from 'react';

export const metadata = { title: 'Connexion — MARJAD Admin' };

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] antialiased">{children}</div>
  );
}
