import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes, getDohaDateString } from '@/lib/prayer';
import { timingsQuerySchema, getValidatedCityConfig } from '@/lib/api-validation';
import { checkApiRateLimit } from '@/lib/rate-limit';

/**
 * API Route for fetching prayer times
 * GET /api/timings?date=YYYY-MM-DD&city=CityName&country=CountryName
 * If no date provided, returns today's times (Doha date).
 * City/country default to Doha, Qatar.
 */
export async function GET(request: NextRequest) {
  try {
    const limitResult = await checkApiRateLimit(request, 'timings', 60, 60);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = timingsQuerySchema.safeParse({
      date: searchParams.get('date') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      country: searchParams.get('country') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query. Use date=YYYY-MM-DD, city and country optional.' },
        { status: 400 }
      );
    }
    const { date: dateParam, city, country } = parsed.data;
    const date = dateParam ?? getDohaDateString();
    const cityConfig = getValidatedCityConfig(city, country);

    const data = await getPrayerTimes(date, cityConfig);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}
