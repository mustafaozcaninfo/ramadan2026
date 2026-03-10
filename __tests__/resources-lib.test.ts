import {
  getAllResourceItems,
  getCatalogMeta,
  getResourceDetail,
  queryResourceCatalog,
  resourceItemSchema,
} from '@/lib/resources';

describe('resources library', () => {
  it('rejects invalid item with missing sources', () => {
    const sample = {
      id: 'x',
      order: 1,
      slug: 'invalid-item',
      category: 'morning_evening',
      categoryLabel: { tr: 'A', en: 'A', ar: 'A' },
      subcategory: 'morning',
      type: 'zikir',
      difficulty: 'easy',
      timing: 'anytime',
      counts: { target: 33, recommendation: 'daily' },
      durationEstimate: '1-2 min',
      texts: {
        tr: { title: 't', arabic: 'a', transliteration: 'tr', translation: 'tt', shortDescription: 's' },
        en: { title: 't', arabic: 'a', transliteration: 'tr', translation: 'tt', shortDescription: 's' },
        ar: { title: 't', arabic: 'a', transliteration: 'tr', translation: 'tt', shortDescription: 's' },
      },
      sources: [],
      fiqhNotes: [],
      tags: ['x'],
      benefits: { tr: ['b'], en: ['b'], ar: ['b'] },
      isCore: true,
      updatedAt: new Date().toISOString(),
    };

    expect(() => resourceItemSchema.parse(sample)).toThrow();
  });

  it('returns catalog filtered by timing and type', () => {
    const result = queryResourceCatalog({ timing: 'morning_evening', type: 'zikir', locale: 'tr', pageSize: 200 });
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((item) => item.timing === 'morning_evening')).toBe(true);
    expect(result.items.every((item) => item.type === 'zikir')).toBe(true);
  });

  it('returns detailed resource with localized text and sources', () => {
    const first = getAllResourceItems()[0];
    const detail = getResourceDetail(first.slug, 'en');

    expect(detail).not.toBeNull();
    expect(detail?.localizedText.title).toBe(first.texts.en.title);
    expect(detail?.sources.length).toBeGreaterThan(0);
  });

  it('provides catalog meta categories and routines', () => {
    const meta = getCatalogMeta('ar');
    expect(meta.categories.length).toBeGreaterThan(0);
    expect(meta.routines.length).toBeGreaterThan(0);
    expect(meta.routinePackages.length).toBeGreaterThan(0);
    expect(meta.weeklyPresets.length).toBeGreaterThan(0);
  });

  it('meets phase-2 content acceptance baseline', () => {
    const items = getAllResourceItems();
    expect(items.length).toBeGreaterThanOrEqual(200);

    for (const item of items) {
      expect(item.texts.tr.title).toBeTruthy();
      expect(item.texts.en.title).toBeTruthy();
      expect(item.texts.ar.title).toBeTruthy();
      expect(item.sources.length).toBeGreaterThan(0);
    }
  });
});
