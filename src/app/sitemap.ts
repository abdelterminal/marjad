import type { MetadataRoute } from 'next';
import { listCategories } from '@/lib/queries/categories';
import { listProducts } from '@/lib/queries/products';
import { absoluteUrl, siteConfig } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const staticRoutes = [
  '',
  '/products',
  '/a-propos',
  '/contact',
  '/faq',
  '/livraison-retours',
  '/suivi-commande',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: products }, categories] = await Promise.all([
    listProducts({ pageSize: 100 }),
    listCategories(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of siteConfig.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: absoluteUrl(`/${locale}${route}`),
        lastModified: new Date(),
        changeFrequency: route === '' || route === '/products' ? 'daily' : 'monthly',
        priority: route === '' ? 1 : route === '/products' ? 0.9 : 0.6,
      });
    }

    for (const category of categories) {
      entries.push({
        url: absoluteUrl(`/${locale}/products?category=${category.slug}`),
        lastModified: category.createdAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/${locale}/products/${product.slug}`),
        lastModified: product.updatedAt ?? product.createdAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
