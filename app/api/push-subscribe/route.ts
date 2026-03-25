import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getValidatedCityConfig, pushSubscribeBodySchema } from '@/lib/api-validation';
import { checkApiRateLimit } from '@/lib/rate-limit';

const REDIS_PREFIX = 'prayer:push:';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * POST /api/push-subscribe
 * Body: { subscription: PushSubscriptionJSON, locale?: 'tr' | 'en' | 'ar' }
 * Stores subscription for Web Push (iOS 16.4+ PWA, Chrome, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const limitResult = await checkApiRateLimit(request, 'push-subscribe', 10, 60);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: 'Push not configured (missing Redis)' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = pushSubscribeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription (endpoint and keys required)' },
        { status: 400 }
      );
    }
    const { subscription, locale: localeParam, reminderIntervals, city, country } = parsed.data;
    const locale = localeParam === 'en' ? 'en' : localeParam === 'ar' ? 'ar' : 'tr';
    const intervals = reminderIntervals?.length
      ? Array.from(new Set(reminderIntervals)).sort((a, b) => b - a)
      : [15, 10, 5, 0];
    const cityCfg = getValidatedCityConfig(city, country);

    const key = `${REDIS_PREFIX}${encodeURIComponent(subscription.endpoint)}`;
    await redis.set(
      key,
      JSON.stringify({
        subscription: parsed.data.subscription,
        locale,
        reminderIntervals: intervals,
        city: cityCfg.city,
        country: cityCfg.country,
      }),
      { ex: 60 * 60 * 24 * 180 }
    ); // 180 days TTL

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Push subscribe error:', e);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
