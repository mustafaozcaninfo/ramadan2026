'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BookOpen, Clock3, Filter, Heart, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { MenuButton } from '@/components/MenuButton';
import { Navigation } from '@/components/Navigation';
import { Link } from '@/lib/i18n/routing';
import { useAppStore } from '@/lib/store/useAppStore';
import { useFirestoreResourcesSync } from '@/lib/hooks/useFirestoreResourcesSync';

interface CatalogMeta {
  categories: Array<{ id: string; label: string }>;
  timings: Array<'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime'>;
  types: Array<'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird'>;
  difficulties: Array<'easy' | 'medium' | 'advanced'>;
  routines: Array<{ id: string; minutes: number; title: string; description: string; itemSlugs: string[] }>;
  routinePackages: Array<{
    id: string;
    kind: 'travel' | 'stress' | 'night_worship' | 'friday';
    title: string;
    description: string;
    itemSlugs: string[];
  }>;
  weeklyPresets: Array<{
    id: string;
    title: string;
    description: string;
    days: Array<{ day: string; itemSlugs: string[] }>;
  }>;
}

interface CatalogItem {
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  type: 'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird';
  difficulty: 'easy' | 'medium' | 'advanced';
  timing: 'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime';
  title: string;
  shortDescription: string;
  durationEstimate: string;
  countTarget: number;
  tags: string[];
  isCore: boolean;
}

interface CatalogResponse {
  items: CatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  meta: CatalogMeta;
}

const TIMING_LABEL_KEYS: Record<CatalogItem['timing'], 'timing.after_fajr' | 'timing.after_maghrib' | 'timing.morning_evening' | 'timing.anytime'> = {
  after_fajr: 'timing.after_fajr',
  after_maghrib: 'timing.after_maghrib',
  morning_evening: 'timing.morning_evening',
  anytime: 'timing.anytime',
};

const TYPE_LABEL_KEYS: Record<CatalogItem['type'], 'resourceType.zikir' | 'resourceType.tesbihat' | 'resourceType.dua' | 'resourceType.salawat' | 'resourceType.wird'> = {
  zikir: 'resourceType.zikir',
  tesbihat: 'resourceType.tesbihat',
  dua: 'resourceType.dua',
  salawat: 'resourceType.salawat',
  wird: 'resourceType.wird',
};

const DIFFICULTY_LABEL_KEYS: Record<CatalogItem['difficulty'], 'resourceDifficulty.easy' | 'resourceDifficulty.medium' | 'resourceDifficulty.advanced'> = {
  easy: 'resourceDifficulty.easy',
  medium: 'resourceDifficulty.medium',
  advanced: 'resourceDifficulty.advanced',
};

function isTiming(value: string): value is CatalogItem['timing'] {
  return value === 'after_fajr' || value === 'after_maghrib' || value === 'morning_evening' || value === 'anytime';
}

function isType(value: string): value is CatalogItem['type'] {
  return value === 'zikir' || value === 'tesbihat' || value === 'dua' || value === 'salawat' || value === 'wird';
}

function isDifficulty(value: string): value is CatalogItem['difficulty'] {
  return value === 'easy' || value === 'medium' || value === 'advanced';
}

export function ResourcesPageClient() {
  const locale = useLocale() as 'tr' | 'en' | 'ar';
  const t = useTranslations('resourcesV2');

  useFirestoreResourcesSync();

  const resourcesSearch = useAppStore((s) => s.resourcesSearch);
  const resourcesFilters = useAppStore((s) => s.resourcesFilters);
  const favoriteResourceIds = useAppStore((s) => s.favoriteResourceIds);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);

  const setResourcesSearch = useAppStore((s) => s.setResourcesSearch);
  const setResourcesFilters = useAppStore((s) => s.setResourcesFilters);
  const resetResourcesFilters = useAppStore((s) => s.resetResourcesFilters);
  const toggleFavoriteResourceId = useAppStore((s) => s.toggleFavoriteResourceId);

  const [response, setResponse] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const effectiveContentLocale = resourcesFilters.language ?? locale;

  const timingText = (timing: CatalogItem['timing']) => t(TIMING_LABEL_KEYS[timing]);
  const typeText = (type: CatalogItem['type']) => t(TYPE_LABEL_KEYS[type]);
  const difficultyText = (difficulty: CatalogItem['difficulty']) => t(DIFFICULTY_LABEL_KEYS[difficulty]);

  useEffect(() => {
    if (!resourcesFilters.language) {
      setResourcesFilters({ language: locale });
    }
  }, [locale, resourcesFilters.language, setResourcesFilters]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const sp = new URLSearchParams();
        sp.set('locale', effectiveContentLocale);
        sp.set('page', '1');
        sp.set('pageSize', '100');

        if (resourcesSearch.trim()) sp.set('q', resourcesSearch.trim());
        if (resourcesFilters.category) sp.set('category', resourcesFilters.category);
        if (resourcesFilters.subcategory) sp.set('subcategory', resourcesFilters.subcategory);
        if (resourcesFilters.type) sp.set('type', resourcesFilters.type);
        if (resourcesFilters.difficulty) sp.set('difficulty', resourcesFilters.difficulty);
        if (resourcesFilters.timing) sp.set('timing', resourcesFilters.timing);

        const res = await fetch(`/api/resources/catalog?${sp.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('catalog request failed');

        const data = (await res.json()) as CatalogResponse;
        setResponse(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error(error);
          toast.error(t('loadFailed'));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    resourcesSearch,
    resourcesFilters.category,
    resourcesFilters.subcategory,
    resourcesFilters.type,
    resourcesFilters.difficulty,
    resourcesFilters.timing,
    effectiveContentLocale,
    t,
  ]);

  const filteredItems = useMemo(() => {
    const base = response?.items ?? [];
    if (!favoritesOnly) return base;
    return base.filter((item) => favoriteResourceIds.includes(item.id));
  }, [response?.items, favoritesOnly, favoriteResourceIds]);

  const recentlyViewedItems = useMemo(() => {
    if (!response?.items?.length) return [] as CatalogItem[];
    const map = new Map(response.items.map((item) => [item.slug, item]));
    return recentlyViewed
      .map((slug) => map.get(slug))
      .filter((item): item is CatalogItem => Boolean(item))
      .slice(0, 6);
  }, [response?.items, recentlyViewed]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of response?.items ?? []) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return map;
  }, [response?.items]);

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-brand-gold rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-5 sm:pb-6 relative z-10 safe-area-inset-top">
        <header className="mb-5 sm:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-300">{t('headingEyebrow')}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('headingTitle')}
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">{t('headingSub')}</p>
            </div>
            <MenuButton locale={locale} />
          </div>
        </header>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 backdrop-blur-sm p-4 sm:p-5 shadow-xl shadow-black/20">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-[1.6fr,1fr]">
            <label className="relative block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={resourcesSearch}
                onChange={(e) => setResourcesSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950/70 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-green/70"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setResourcesSearch('');
                  resetResourcesFilters();
                  setResourcesFilters({ language: locale });
                }}
                className="h-11 px-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-200 text-sm hover:border-slate-500 transition-colors"
              >
                <X className="w-4 h-4 inline-block mr-1" />
                {t('clear')}
              </button>
              <button
                type="button"
                onClick={() => setFavoritesOnly((v) => !v)}
                className={`h-11 px-3 rounded-xl border text-sm transition-colors ${
                  favoritesOnly
                    ? 'border-rose-400/70 bg-rose-500/15 text-rose-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-500'
                }`}
              >
                <Heart className="w-4 h-4 inline-block mr-1" />
                {t('favoritesOnly')}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('contentLanguage')}</p>
              <select
                value={effectiveContentLocale}
                onChange={(e) => setResourcesFilters({ language: e.target.value as 'tr' | 'en' | 'ar' })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950/70 px-2 text-sm text-slate-100"
              >
                <option value="tr">TR</option>
                <option value="en">EN</option>
                <option value="ar">AR</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('filters')}</p>
              <select
                value={resourcesFilters.timing ?? ''}
                onChange={(e) => {
                  const { value } = e.target;
                  setResourcesFilters({ timing: value && isTiming(value) ? value : undefined });
                }}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950/70 px-2 text-sm text-slate-100"
              >
                <option value="">{t('all')}</option>
                {response?.meta.timings.map((timing) => (
                  <option key={timing} value={timing}>
                    {timingText(timing)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('type')}</p>
              <select
                value={resourcesFilters.type ?? ''}
                onChange={(e) => {
                  const { value } = e.target;
                  setResourcesFilters({ type: value && isType(value) ? value : undefined });
                }}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950/70 px-2 text-sm text-slate-100"
              >
                <option value="">{t('all')}</option>
                {response?.meta.types.map((type) => (
                  <option key={type} value={type}>
                    {typeText(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('difficulty')}</p>
              <select
                value={resourcesFilters.difficulty ?? ''}
                onChange={(e) =>
                  setResourcesFilters({
                    difficulty: e.target.value && isDifficulty(e.target.value) ? e.target.value : undefined,
                  })
                }
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950/70 px-2 text-sm text-slate-100"
              >
                <option value="">{t('all')}</option>
                {response?.meta.difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficultyText(difficulty)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('category')}</p>
              <select
                value={resourcesFilters.category ?? ''}
                onChange={(e) => setResourcesFilters({ category: e.target.value || undefined })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950/70 px-2 text-sm text-slate-100"
              >
                <option value="">{t('all')}</option>
                {response?.meta.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-gold" />
              {t('categories')}
            </h2>
            <div className="mt-3 space-y-2">
              {response?.meta.categories.map((category) => {
                const active = resourcesFilters.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setResourcesFilters({
                        category: active ? undefined : category.id,
                      })
                    }
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'border-brand-green/60 bg-brand-green/15 text-emerald-100'
                        : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="text-xs text-slate-400 ml-2">({categoryCounts.get(category.id) ?? 0})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              {t('routines')}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {response?.meta.routines.map((routine) => (
                <div key={routine.id} className="rounded-xl border border-slate-700 bg-slate-950/45 p-3">
                  <p className="text-xs text-brand-gold font-semibold flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {routine.minutes} {t('min')}
                  </p>
                  <p className="mt-1 text-sm text-slate-100 font-medium">{routine.title}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{routine.description}</p>
                  {routine.itemSlugs[0] && (
                    <Link
                      href={`/resources/${routine.itemSlugs[0]}?lang=${effectiveContentLocale}`}
                      className="mt-2 inline-flex items-center text-xs text-emerald-300 hover:text-emerald-200"
                    >
                      {t('openRoutine')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">{t('packages')}</h2>
            <div className="space-y-2">
              {response?.meta.routinePackages?.map((pkg) => (
                <div key={pkg.id} className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
                  <p className="text-sm text-slate-100 font-medium">{pkg.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{pkg.description}</p>
                  {pkg.itemSlugs[0] && (
                    <Link
                      href={`/resources/${pkg.itemSlugs[0]}?lang=${effectiveContentLocale}`}
                      className="mt-2 inline-flex items-center text-xs text-emerald-300 hover:text-emerald-200"
                    >
                      {t('openDetail')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">{t('weekly')}</h2>
            <div className="space-y-2">
              {response?.meta.weeklyPresets?.map((preset) => (
                <div key={preset.id} className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
                  <p className="text-sm text-slate-100 font-medium">{preset.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {t('weeklySummary', { count: preset.days.reduce((sum, d) => sum + d.itemSlugs.length, 0) })}
                  </p>
                  {preset.days[0]?.itemSlugs[0] && (
                    <Link
                      href={`/resources/${preset.days[0].itemSlugs[0]}?lang=${effectiveContentLocale}`}
                      className="mt-2 inline-flex items-center text-xs text-emerald-300 hover:text-emerald-200"
                    >
                      {t('openDetail')}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-300" aria-live="polite">
              {filteredItems.length} {t('results')}
            </p>
            {loading && <p className="text-xs text-slate-400">{t('loading')}</p>}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 text-sm text-slate-300">
              {t('noResults')}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const isFav = favoriteResourceIds.includes(item.id);
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 backdrop-blur-sm hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          {timingText(item.timing)} • {typeText(item.type)}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-slate-100 line-clamp-2">{item.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleFavoriteResourceId(item.id);
                          toast.success(isFav ? t('removedFavorite') : t('addedFavorite'));
                        }}
                        className={`rounded-lg border p-2 ${
                          isFav
                            ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
                            : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                        }`}
                        aria-label={isFav ? t('removedFavorite') : t('addedFavorite')}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-300 line-clamp-2">{item.shortDescription}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{item.durationEstimate}</span>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                        {item.countTarget} {t('target')}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                        {difficultyText(item.difficulty)}
                      </span>
                    </div>

                    <Link
                      href={`/resources/${item.slug}?lang=${effectiveContentLocale}`}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200"
                    >
                      <BookOpen className="w-4 h-4" />
                      {t('openDetail')}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {recentlyViewedItems.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-slate-100 mb-3">{t('recent')}</h2>
            <div className="flex flex-wrap gap-2">
              {recentlyViewedItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/resources/${item.slug}?lang=${effectiveContentLocale}`}
                  className="rounded-lg border border-slate-700 bg-slate-950/45 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Navigation />
    </main>
  );
}
