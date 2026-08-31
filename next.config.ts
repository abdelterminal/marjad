import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp'],
    // Our own trusted SVGs in public/brand/ (logo lockups) — Next.js blocks SVG
    // optimization by default as an XSS precaution against *untrusted* sources.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
