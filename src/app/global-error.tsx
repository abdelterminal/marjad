'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          background: '#FAF7F2',
          color: '#1A1A1A',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <title>Une erreur est survenue | MARJAD</title>
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '32px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <p
              style={{
                margin: '0 0 18px',
                color: '#C4622D',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              MARJAD
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(32px, 8vw, 56px)',
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              Un imprévu est survenu.
            </h1>
            <p
              style={{
                margin: '22px 0 28px',
                maxWidth: '470px',
                color: '#6B6560',
                fontSize: '16px',
                lineHeight: 1.7,
              }}
            >
              Notre équipe a été informée. Vous pouvez réessayer maintenant ou
              revenir à l&apos;accueil.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={unstable_retry}
                style={{
                  minHeight: '46px',
                  border: 0,
                  borderRadius: '2px',
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '0 22px',
                }}
              >
                Réessayer
              </button>
              <Link
                href="/fr"
                style={{
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #E0D9CF',
                  borderRadius: '2px',
                  color: '#1A1A1A',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '0 22px',
                  textDecoration: 'none',
                }}
              >
                Retour à l&apos;accueil
              </Link>
            </div>
            {error.digest ? (
              <p
                style={{
                  margin: '24px 0 0',
                  color: '#9E9791',
                  fontSize: '12px',
                }}
              >
                Référence : {error.digest}
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
