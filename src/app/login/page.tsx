import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[var(--color-brand-surface)] px-5">
          <div className="h-10 w-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-brand-primary-light)]" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
