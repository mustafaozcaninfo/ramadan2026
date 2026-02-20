import { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ramadan-2026-doha.vercel.app';

  const routes = [
    '',
    '/calendar',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    routes.forEach((route) => {
      const url = locale === routing.defaultLocale ? route : `/${locale}${route}`;
      sitemapEntries.push({
        url: `${baseUrl}${url}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
