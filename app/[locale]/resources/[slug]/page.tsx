import { Navigation } from '@/components/Navigation';
import { MenuButton } from '@/components/MenuButton';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getResourceItemBySlug } from '@/lib/resources';
import { ResourceDetailClient } from './ResourceDetailClient';

export default async function ResourceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, slug } = await params;
  const { lang } = await searchParams;
  const t = await getTranslations('resourcesV2.detail');
  const tResources = await getTranslations('resourcesV2');

  const exists = getResourceItemBySlug(slug);
  if (!exists) {
    notFound();
  }

  const preferredLocale =
    lang === 'en' || lang === 'ar' || lang === 'tr'
      ? lang
      : locale === 'en' || locale === 'ar'
        ? locale
        : 'tr';

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-5 sm:pb-6 relative z-10 safe-area-inset-top">
        <header className="mb-5 sm:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-300">{tResources('headingEyebrow')}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('pageTitle')}
              </h1>
            </div>
            <MenuButton locale={locale as 'tr' | 'en' | 'ar'} />
          </div>
        </header>

        <ResourceDetailClient slug={slug} initialLocale={preferredLocale as 'tr' | 'en' | 'ar'} />
      </div>

      <Navigation />
    </main>
  );
}
