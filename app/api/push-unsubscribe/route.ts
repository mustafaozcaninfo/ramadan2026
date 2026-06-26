import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { pushUnsubscribeBodySchema } from '@/lib/api-validation';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { LEGACY_PUSH_SUBSCRIPTION_PREFIX, PUSH_SUBSCRIPTION_PREFIX } from '@/lib/pushRedis';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * POST /api/push-unsubscribe
 * Body: { subscription: { endpoint: string } }
 * Removes Web Push subscription from Redis.
 */
export async function POST(request: NextRequest) {
  try {
    const limitResult = await checkApiRateLimit(request, 'push-unsubscribe', 20, 60);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many unsubscribe attempts' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ ok: true, skipped: 'no-redis' });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = pushUnsubscribeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription endpoint' }, { status: 400 });
    }

    const endpoint = parsed.data.subscription.endpoint;
    const keys = [
      `${PUSH_SUBSCRIPTION_PREFIX}${encodeURIComponent(endpoint)}`,
      `${LEGACY_PUSH_SUBSCRIPTION_PREFIX}${encodeURIComponent(endpoint)}`,
    ];

    await Promise.all(keys.map((key) => redis.del(key)));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Push unsubscribe error:', e);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
