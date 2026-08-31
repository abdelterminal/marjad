import type { Metadata } from 'next';

export const siteConfig = {
  name: 'MARJAD',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000',
  defaultImage: '/images/hero-bg.webp',
  locales: ['fr', 'ar'] as const,
  defaultLocale: 'fr',
};

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function localizedAlternates(path: string) {
  const normalizedPath = path === '/' ? '' : path.replace(/^\/(fr|ar)/, '');

  return {
    canonical: absoluteUrl(`/fr${normalizedPath}`),
    languages: {
      fr: absoluteUrl(`/fr${normalizedPath}`),
      ar: absoluteUrl(`/ar${normalizedPath}`),
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  locale,
  image = siteConfig.defaultImage,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string | null;
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl(siteConfig.defaultImage);

  return {
    title,
    description,
    alternates: localizedAlternates(path),
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
