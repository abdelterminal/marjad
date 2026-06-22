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
import { CartToastProvider } from '@/components/ui/cart-toast';
import { WhatsAppWidget } from '@/components/layout/WhatsAppWidget';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { MarketingPixels } from '@/components/analytics/MarketingPixels';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: 'MARJAD — Décoration marocaine artisanale',
    template: '%s | MARJAD',
  },
  description:
    'Décoration intérieure marocaine: tableaux, lampes, tables et objets artisanaux avec paiement à la livraison partout au Maroc.',
  applicationName: 'MARJAD',
  keywords: [
    'décoration marocaine',
    'artisanat marocain',
    'décoration intérieure Maroc',
    'paiement à la livraison Maroc',
    'lampes marocaines',
    'tableaux marocains',
  ],
  authors: [{ name: 'MARJAD' }],
  creator: 'MARJAD',
  publisher: 'MARJAD',
  robots: {
    index: true,
    follow: true,
  },
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

  const fontClasses = [
    playfairDisplay.variable,
    inter.variable,
    amiri.variable,
    cairo.variable,
  ].join(' ');

  return (
    <div
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col antialiased bg-[var(--color-brand-surface)] ${fontClasses}`}
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
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <CartToastProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartProvider />
            <WhatsAppWidget />
            <AnalyticsTracker />
            <MarketingPixels />
          </CartToastProvider>
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
