import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const REDIS_PREFIX = 'ramadan:push:';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * POST /api/push-subscribe
 * Body: { subscription: PushSubscriptionJSON, locale?: 'tr' | 'en' }
 * Stores subscription for Web Push (iOS 16.4+ PWA, Chrome, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: 'Push not configured (missing Redis)' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const subscription = body?.subscription;
    const locale = body?.locale === 'en' ? 'en' : 'tr';

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription (endpoint and keys required)' },
        { status: 400 }
      );
    }

    const key = `${REDIS_PREFIX}${encodeURIComponent(subscription.endpoint)}`;
    await redis.set(key, JSON.stringify({ subscription, locale }), { ex: 60 * 60 * 24 * 180 }); // 180 days TTL

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Push subscribe error:', e);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
