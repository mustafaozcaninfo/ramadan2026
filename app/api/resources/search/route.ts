import { NextRequest, NextResponse } from 'next/server';
import { searchResources } from '@/lib/resources';
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
  const q = sp.get('q') ?? '';
  const page = Number(sp.get('page') ?? '1');
  const pageSize = Number(sp.get('pageSize') ?? '20');

  const result = searchResources({
    q,
    locale,
    category: sp.get('category') ?? undefined,
    subcategory: sp.get('subcategory') ?? undefined,
    type: parseEnum(sp.get('type'), ['zikir', 'tesbihat', 'dua', 'salawat', 'wird']),
    difficulty: parseEnum(sp.get('difficulty'), ['easy', 'medium', 'advanced']),
    timing: parseEnum(sp.get('timing'), ['after_fajr', 'after_maghrib', 'morning_evening', 'anytime']),
    tags: parseTags(sp.get('tags')),
    page,
    pageSize,
  });

  return NextResponse.json(result);
}

function parseLocale(value: string | null): ResourceLocale {
  return value === 'en' || value === 'ar' ? value : 'tr';
}

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value && allowed.includes(value as T) ? (value as T) : undefined;
}
