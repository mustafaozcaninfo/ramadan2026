import { NextRequest, NextResponse } from 'next/server';
import { queryResourceCatalog, getCatalogMeta } from '@/lib/resources';
import type { ResourceLocale } from '@/lib/resources';

function parseTags(tagsParam: string | null): string[] {
  if (!tagsParam) return [];
  return tagsParam
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const locale = parseLocale(sp.get('locale'));
  const page = Number(sp.get('page') ?? '1');
  const pageSize = Number(sp.get('pageSize') ?? '20');

  const result = queryResourceCatalog({
    q: sp.get('q') ?? undefined,
    locale,
    category: sp.get('category') ?? undefined,
    subcategory: sp.get('subcategory') ?? undefined,
    type: (sp.get('type') as any) ?? undefined,
    difficulty: (sp.get('difficulty') as any) ?? undefined,
    timing: (sp.get('timing') as any) ?? undefined,
    tags: parseTags(sp.get('tags')),
    page,
    pageSize,
  });

  return NextResponse.json({
    ...result,
    meta: getCatalogMeta(locale),
  });
}

function parseLocale(value: string | null): ResourceLocale {
  return value === 'en' || value === 'ar' ? value : 'tr';
}
