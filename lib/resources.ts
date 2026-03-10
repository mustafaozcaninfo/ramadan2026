import itemsData from '@/lib/resources/data/resources-items.json';
import sourcesData from '@/lib/resources/data/resources-sources.json';
import routinesData from '@/lib/resources/data/resources-routines.json';
import routinePackagesData from '@/lib/resources/data/resources-routine-packages.json';
import weeklyPresetsData from '@/lib/resources/data/resources-weekly-presets.json';
import { z } from 'zod';

export type ResourceLocale = 'tr' | 'en' | 'ar';
export type ResourceType = 'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird';
export type ResourceDifficulty = 'easy' | 'medium' | 'advanced';
export type ResourceTiming = 'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime';
export type SourceKind = 'quran' | 'hadith' | 'athar' | 'classical';
export type SourceGrade = 'sahih' | 'hasan' | 'daif' | 'accepted';

const localizedTextSchema = z.object({
  title: z.string().min(1),
  arabic: z.string().min(1),
  transliteration: z.string().min(1),
  translation: z.string().min(1),
  shortDescription: z.string().min(1),
});

export const sourceEntrySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['quran', 'hadith', 'athar', 'classical']),
  reference: z.string().min(1),
  grade: z.enum(['sahih', 'hasan', 'daif', 'accepted']),
  note: z.object({
    tr: z.string().min(1),
    en: z.string().min(1),
    ar: z.string().min(1),
  }),
});

export const resourceItemSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  slug: z.string().min(1),
  category: z.string().min(1),
  categoryLabel: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  subcategory: z.string().min(1),
  type: z.enum(['zikir', 'tesbihat', 'dua', 'salawat', 'wird']),
  difficulty: z.enum(['easy', 'medium', 'advanced']),
  timing: z.enum(['after_fajr', 'after_maghrib', 'morning_evening', 'anytime']),
  counts: z.object({
    target: z.number().int().positive(),
    recommendation: z.string().min(1),
  }),
  durationEstimate: z.string().min(1),
  texts: z.object({
    tr: localizedTextSchema,
    en: localizedTextSchema,
    ar: localizedTextSchema,
  }),
  sources: z.array(z.object({
    sourceId: z.string().min(1),
    note: z.object({
      tr: z.string(),
      en: z.string(),
      ar: z.string(),
    }),
  })).min(1),
  fiqhNotes: z.array(z.object({
    title: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
    body: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
    sourceRef: z.string().min(1),
  })),
  tags: z.array(z.string().min(1)),
  benefits: z.object({
    tr: z.array(z.string()),
    en: z.array(z.string()),
    ar: z.array(z.string()),
  }),
  audioUrl: z.string().nullable().optional(),
  isCore: z.boolean(),
  updatedAt: z.string().min(1),
});

export const routineSchema = z.object({
  id: z.string().min(1),
  minutes: z.number().int().positive(),
  title: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  description: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  itemSlugs: z.array(z.string()).min(1),
});

export const routinePackageSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['travel', 'stress', 'night_worship', 'friday']),
  title: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  description: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  itemSlugs: z.array(z.string()).min(1),
});

export const weeklyPresetSchema = z.object({
  id: z.string().min(1),
  title: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  description: z.object({ tr: z.string(), en: z.string(), ar: z.string() }),
  days: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    itemSlugs: z.array(z.string()).min(1),
  })).length(7),
});

export type SourceEntry = z.infer<typeof sourceEntrySchema>;
export type ResourceItem = z.infer<typeof resourceItemSchema>;
export type ResourceRoutine = z.infer<typeof routineSchema>;
export type ResourceRoutinePackage = z.infer<typeof routinePackageSchema>;
export type ResourceWeeklyPreset = z.infer<typeof weeklyPresetSchema>;

const parsedSources = z.array(sourceEntrySchema).parse(sourcesData);
const parsedItems = z.array(resourceItemSchema).parse(itemsData);
const parsedRoutines = z.array(routineSchema).parse(routinesData);
const parsedRoutinePackages = z.array(routinePackageSchema).parse(routinePackagesData);
const parsedWeeklyPresets = z.array(weeklyPresetSchema).parse(weeklyPresetsData);

const sourceMap = new Map(parsedSources.map((s) => [s.id, s]));
const itemMap = new Map(parsedItems.map((i) => [i.slug, i]));

export interface ResourceCatalogQuery {
  q?: string;
  locale?: ResourceLocale;
  category?: string;
  subcategory?: string;
  type?: ResourceType;
  difficulty?: ResourceDifficulty;
  timing?: ResourceTiming;
  page?: number;
  pageSize?: number;
  tags?: string[];
}

export interface ResourceCatalogItemSummary {
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  type: ResourceType;
  difficulty: ResourceDifficulty;
  timing: ResourceTiming;
  title: string;
  shortDescription: string;
  durationEstimate: string;
  countTarget: number;
  tags: string[];
  isCore: boolean;
}

export interface ResourceCatalogResponse {
  items: ResourceCatalogItemSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizeLocale(locale?: string): ResourceLocale {
  return locale === 'en' || locale === 'ar' ? locale : 'tr';
}

function normalizePage(value?: number): number {
  if (!value || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

function normalizePageSize(value?: number): number {
  if (!value || Number.isNaN(value) || value < 1) return 20;
  return Math.min(100, Math.floor(value));
}

function textSearchIndex(item: ResourceItem): string {
  return [
    item.slug,
    item.category,
    item.subcategory,
    item.texts.tr.title,
    item.texts.en.title,
    item.texts.ar.title,
    item.texts.tr.translation,
    item.texts.en.translation,
    item.texts.ar.translation,
    ...item.tags,
  ].join(' ').toLowerCase();
}

export function getAllResourceItems(): ResourceItem[] {
  return parsedItems;
}

export function getAllSources(): SourceEntry[] {
  return parsedSources;
}

export function getAllRoutines(): ResourceRoutine[] {
  return parsedRoutines;
}

export function getAllRoutinePackages(): ResourceRoutinePackage[] {
  return parsedRoutinePackages;
}

export function getAllWeeklyPresets(): ResourceWeeklyPreset[] {
  return parsedWeeklyPresets;
}

export function getResourceItemBySlug(slug: string): ResourceItem | null {
  return itemMap.get(slug) ?? null;
}

export function resolveResourceSources(item: ResourceItem): Array<{ entry: SourceEntry; note: { tr: string; en: string; ar: string } }> {
  return item.sources
    .map((s) => {
      const entry = sourceMap.get(s.sourceId);
      if (!entry) return null;
      return { entry, note: s.note };
    })
    .filter((v): v is { entry: SourceEntry; note: { tr: string; en: string; ar: string } } => Boolean(v));
}

export function queryResourceCatalog(query: ResourceCatalogQuery): ResourceCatalogResponse {
  const locale = normalizeLocale(query.locale);
  const page = normalizePage(query.page);
  const pageSize = normalizePageSize(query.pageSize);
  const q = query.q?.trim().toLowerCase();
  const requiredTags = (query.tags ?? []).map((t) => t.toLowerCase()).filter(Boolean);

  let list = parsedItems.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.subcategory && item.subcategory !== query.subcategory) return false;
    if (query.type && item.type !== query.type) return false;
    if (query.difficulty && item.difficulty !== query.difficulty) return false;
    if (query.timing && item.timing !== query.timing) return false;
    if (requiredTags.length && !requiredTags.every((tag) => item.tags.map((x) => x.toLowerCase()).includes(tag))) return false;
    if (q && !textSearchIndex(item).includes(q)) return false;
    return true;
  });

  list = list.sort((a, b) => a.order - b.order);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);

  const items = slice.map<ResourceCatalogItemSummary>((item) => ({
    id: item.id,
    slug: item.slug,
    category: item.category,
    subcategory: item.subcategory,
    type: item.type,
    difficulty: item.difficulty,
    timing: item.timing,
    title: item.texts[locale].title,
    shortDescription: item.texts[locale].shortDescription,
    durationEstimate: item.durationEstimate,
    countTarget: item.counts.target,
    tags: item.tags,
    isCore: item.isCore,
  }));

  return {
    items,
    total,
    page: clampedPage,
    pageSize,
    totalPages,
  };
}

export function getResourceDetail(slug: string, locale?: string) {
  const item = getResourceItemBySlug(slug);
  if (!item) return null;
  const resolvedLocale = normalizeLocale(locale);
  const sources = resolveResourceSources(item);

  return {
    item,
    locale: resolvedLocale,
    localizedText: item.texts[resolvedLocale],
    localizedBenefits: item.benefits[resolvedLocale],
    localizedFiqhNotes: item.fiqhNotes.map((n) => ({
      title: n.title[resolvedLocale],
      body: n.body[resolvedLocale],
      sourceRef: n.sourceRef,
    })),
    sources,
  };
}

export function searchResources(query: ResourceCatalogQuery): ResourceCatalogResponse {
  return queryResourceCatalog(query);
}

export function getSourceById(id: string): SourceEntry | null {
  return sourceMap.get(id) ?? null;
}

export function getCatalogMeta(locale?: string) {
  const resolvedLocale = normalizeLocale(locale);
  const categories = Array.from(
    new Map(parsedItems.map((item) => [item.category, item.categoryLabel[resolvedLocale]])).entries()
  ).map(([id, label]) => ({ id, label }));

  const timings = Array.from(new Set(parsedItems.map((i) => i.timing))).sort();
  const types = Array.from(new Set(parsedItems.map((i) => i.type))).sort();
  const difficulties = Array.from(new Set(parsedItems.map((i) => i.difficulty))).sort();

  return {
    categories,
    timings,
    types,
    difficulties,
    routines: parsedRoutines.map((r) => ({
      id: r.id,
      minutes: r.minutes,
      title: r.title[resolvedLocale],
      description: r.description[resolvedLocale],
      itemSlugs: r.itemSlugs,
    })),
    routinePackages: parsedRoutinePackages.map((p) => ({
      id: p.id,
      kind: p.kind,
      title: p.title[resolvedLocale],
      description: p.description[resolvedLocale],
      itemSlugs: p.itemSlugs,
    })),
    weeklyPresets: parsedWeeklyPresets.map((p) => ({
      id: p.id,
      title: p.title[resolvedLocale],
      description: p.description[resolvedLocale],
      days: p.days,
    })),
  };
}
