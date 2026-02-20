import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes, getDohaDateString } from '@/lib/prayer';

/**
 * API Route for fetching prayer times
 * GET /api/timings?date=YYYY-MM-DD
 * If no date provided, returns today's times (Doha date)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || getDohaDateString();

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const data = await getPrayerTimes(date);

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
