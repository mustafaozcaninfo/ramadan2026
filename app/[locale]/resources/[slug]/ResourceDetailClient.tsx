'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpenText, Copy, Eye, EyeOff, Heart, Minus, Plus, RotateCcw, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store/useAppStore';
import { useFirestoreResourcesSync } from '@/lib/hooks/useFirestoreResourcesSync';
import { Link } from '@/lib/i18n/routing';
import { trackEvent } from '@/lib/analytics';

type LocaleCode = 'tr' | 'en' | 'ar';

interface ResourceDetailResponse {
  item: {
    id: string;
    slug: string;
    category: string;
    subcategory: string;
    type: 'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird';
    difficulty: 'easy' | 'medium' | 'advanced';
    timing: 'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime';
    counts: { target: number; recommendation: string };
    durationEstimate: string;
    tags: string[];
    texts: Record<LocaleCode, {
      title: string;
      arabic: string;
      transliteration: string;
      translation: string;
      shortDescription: string;
    }>;
  };
  locale: LocaleCode;
  localizedText: {
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    shortDescription: string;
  };
  localizedBenefits: string[];
  localizedFiqhNotes: Array<{ title: string; body: string; sourceRef: string }>;
  sources: Array<{
    entry: {
      id: string;
      kind: 'quran' | 'hadith' | 'athar' | 'classical';
      reference: string;
      grade: 'sahih' | 'hasan' | 'daif' | 'accepted';
      note: Record<LocaleCode, string>;
    };
    note: Record<LocaleCode, string>;
  }>;
}

export function ResourceDetailClient({ slug, initialLocale }: { slug: string; initialLocale: LocaleCode }) {
  const t = useTranslations('resourcesV2.detail');
  useFirestoreResourcesSync();

  const favoriteResourceIds = useAppStore((s) => s.favoriteResourceIds);
  const resourcesFilters = useAppStore((s) => s.resourcesFilters);
  const toggleFavoriteResourceId = useAppStore((s) => s.toggleFavoriteResourceId);
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);

  const [detail, setDetail] = useState<ResourceDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [count, setCount] = useState(0);

  const effectiveContentLocale = resourcesFilters.language ?? initialLocale;

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/resources/item/${encodeURIComponent(slug)}?locale=${encodeURIComponent(effectiveContentLocale)}`,
          { signal: controller.signal, cache: 'no-store' }
        );

        if (!res.ok) throw new Error('resource detail request failed');

        const data = (await res.json()) as ResourceDetailResponse;
        setDetail(data);
        addRecentlyViewed(data.item.slug);
        trackEvent('resource_open', { slug: data.item.slug, category: data.item.category });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error(error);
          toast.error(t('loadFailed'));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [slug, effectiveContentLocale, addRecentlyViewed, t]);

  const target = detail?.item.counts.target ?? 33;
  const isFav = detail ? favoriteResourceIds.includes(detail.item.id) : false;

  useEffect(() => {
    if (count === target && target > 0) {
      toast.success(t('reached'));
    }
  }, [count, target, t]);

  const shareText = useMemo(() => {
    if (!detail) return '';
    return `${detail.localizedText.title}\n${detail.localizedText.arabic}\n${detail.localizedText.transliteration}\n${detail.localizedText.translation}`;
  }, [detail]);

  if (!detail && !loading) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 text-slate-200">
        {t('notFound')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFocusMode((v) => {
                const next = !v;
                trackEvent('resource_focus_mode_toggle', { enabled: next ? 1 : 0, slug });
                return next;
              })
            }
            className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 text-sm"
          >
            {focusMode ? <EyeOff className="w-4 h-4 inline-block mr-1" /> : <Eye className="w-4 h-4 inline-block mr-1" />}
            {focusMode ? t('focusOff') : t('focusOn')}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!detail) return;
              toggleFavoriteResourceId(detail.item.id);
              trackEvent('resource_favorite_toggle', { slug: detail.item.slug, next: isFav ? 0 : 1 });
              toast.success(isFav ? t('favoriteRemoved') : t('favoriteAdded'));
            }}
            className={`h-10 px-3 rounded-lg border text-sm ${
              isFav
                ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
                : 'border-slate-700 bg-slate-900/60 text-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 inline-block mr-1 ${isFav ? 'fill-current' : ''}`} />
            {t('favorite')}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!shareText) return;
              try {
                await navigator.clipboard.writeText(shareText);
                toast.success(t('copy'));
              } catch {
                toast.error(t('copyFailed'));
              }
            }}
            className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 text-sm"
          >
            <Copy className="w-4 h-4 inline-block mr-1" />
            {t('copy')}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!detail) return;
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: detail.localizedText.title,
                    text: shareText,
                    url: window.location.href,
                  });
                  return;
                }
                await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
                toast.success(t('share'));
              } catch {
                toast.error(t('shareFailed'));
              }
            }}
            className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 text-sm"
          >
            <Share2 className="w-4 h-4 inline-block mr-1" />
            {t('share')}
          </button>
        </div>
      </div>

      {loading && !detail ? <p className="text-sm text-slate-300">{t('loading')}</p> : null}

      {detail ? (
        <>
          <article className="rounded-2xl border border-slate-700/70 bg-slate-900/75 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 text-xs mb-3">
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{detail.item.type}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{detail.item.timing}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{detail.item.difficulty}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">{detail.item.durationEstimate}</span>
            </div>

            <h1 className={`text-xl sm:text-2xl font-semibold text-slate-100 ${focusMode ? 'text-2xl sm:text-3xl' : ''}`}>
              {detail.localizedText.title}
            </h1>
            <p className="mt-2 text-sm text-slate-300">{detail.localizedText.shortDescription}</p>

            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
              <p className={`font-arabic leading-relaxed text-center text-slate-100 ${focusMode ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'}`}>
                {detail.localizedText.arabic}
              </p>
              <p className={`mt-3 text-center text-slate-300 ${focusMode ? 'text-lg sm:text-xl' : 'text-base'}`}>
                {detail.localizedText.transliteration}
              </p>
              <p className={`mt-2 text-center text-slate-200 ${focusMode ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
                {detail.localizedText.translation}
              </p>
            </div>

            <section className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4" aria-live="polite">
              <h2 className="text-sm font-semibold text-slate-100 mb-2">{t('counter')}</h2>
              <p className="text-xs text-slate-400 mb-3">
                {t('recommendation')}: {detail.item.counts.recommendation} • {t('targetLabel')}: {target}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCount((v) => Math.max(0, v - 1))}
                  className="h-10 w-10 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
                  aria-label={t('decreaseCounter')}
                >
                  <Minus className="w-4 h-4 mx-auto" />
                </button>
                <div className="min-w-[84px] h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 flex items-center justify-center text-lg font-semibold tabular-nums text-slate-100">
                  {count}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCount((v) => {
                      const next = Math.min(target, v + 1);
                      if (next !== v) {
                        trackEvent('resource_repeat', { slug, count: next, target });
                      }
                      return next;
                    })
                  }
                  className="h-10 w-10 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
                  aria-label={t('increaseCounter')}
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
                <button
                  type="button"
                  onClick={() => setCount(0)}
                  className="h-10 px-3 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 text-sm"
                >
                  <RotateCcw className="w-4 h-4 inline-block mr-1" />
                  {t('reset')}
                </button>
              </div>
            </section>
          </article>

          {!focusMode && (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
                  <BookOpenText className="w-4 h-4 text-brand-gold" />
                  {t('sourcePanel')}
                </h2>
                <div className="space-y-2">
                  {detail.sources.map((source) => (
                    <article key={source.entry.id} className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
                      <p className="text-xs text-slate-400">{source.entry.kind.toUpperCase()} • {source.entry.grade}</p>
                      <p className="text-sm text-slate-100 font-medium">{source.entry.reference}</p>
                      <p className="text-xs text-slate-300 mt-1">{source.entry.note[detail.locale]}</p>
                      <p className="text-xs text-slate-400 mt-1">{source.note[detail.locale]}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">{t('fiqhPanel')}</h2>
                <div className="space-y-2">
                  {detail.localizedFiqhNotes.map((note, idx) => (
                    <article key={`${note.sourceRef}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-950/45 p-3">
                      <p className="text-sm font-medium text-slate-100">{note.title}</p>
                      <p className="text-sm text-slate-300 mt-1">{note.body}</p>
                      <p className="text-xs text-slate-400 mt-2">{note.sourceRef}</p>
                    </article>
                  ))}
                </div>

                {detail.localizedBenefits.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-100 mb-2">{t('benefits')}</h3>
                    <ul className="space-y-1 text-sm text-slate-300 list-disc pl-5 rtl:pr-5 rtl:pl-0">
                      {detail.localizedBenefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
