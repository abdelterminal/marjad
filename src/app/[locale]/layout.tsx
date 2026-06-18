import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Playfair_Display, Inter, Amiri, Cairo } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import '../globals.css';

// ── Google Fonts (LTR — French) ──────────────────────────────
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--loaded-font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--loaded-font-body',
  display: 'swap',
});

// ── Google Fonts (RTL — Arabic) ───────────────────────────────
const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--loaded-font-display-ar',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--loaded-font-body-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MARJAD — Décoration Intérieure',
  description: 'Tableaux, lampes, tables et objets décoratifs artisanaux',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'fr' | 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  // Font variable classes applied to <html> so CSS vars resolve correctly
  const fontClasses = [
    playfairDisplay.variable,
    inter.variable,
    amiri.variable,
    cairo.variable,
  ].join(' ');

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`h-full antialiased ${fontClasses}`}
      style={
        isRTL
          ? {
              '--font-body': `var(--loaded-font-body-ar, 'Cairo', 'Segoe UI', sans-serif)`,
              '--font-display': `var(--loaded-font-display-ar, 'Amiri', 'Traditional Arabic', serif)`,
            } as React.CSSProperties
          : {
              '--font-body': `var(--loaded-font-body, 'Inter', system-ui, sans-serif)`,
              '--font-display': `var(--loaded-font-display, 'Playfair Display', Georgia, serif)`,
            } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-[var(--color-brand-surface)]">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartProvider />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
