import { NextRequest, NextResponse } from 'next/server';
import { getResourceDetail } from '@/lib/resources';
import type { ResourceLocale } from '@/lib/resources';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = parseLocale(request.nextUrl.searchParams.get('locale'));
  const detail = getResourceDetail(slug, locale);

  if (!detail) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  return NextResponse.json(detail);
}

function parseLocale(value: string | null): ResourceLocale {
  return value === 'en' || value === 'ar' ? value : 'tr';
}
