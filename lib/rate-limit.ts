/**
 * Rate limit helper using Upstash Redis when available.
 * If Redis or @upstash/ratelimit is not configured, limit is skipped (allow).
 */

export type RateLimitResult = { success: true } | { success: false; limit: number; remaining: number };

async function rateLimitWithUpstash(identifier: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return { success: true };

    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: 'prayer:api:',
    });
    const { success, limit: l, remaining } = await ratelimit.limit(identifier);
    return success ? { success: true } : { success: false, limit: l, remaining };
  } catch {
    return { success: true };
  }
}

export async function checkApiRateLimit(
  request: Request,
  keyPrefix: string,
  limit: number = 30,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = (forwarded?.split(',')[0]?.trim() || realIp || 'anonymous').slice(0, 64);
  const identifier = `${keyPrefix}:${ip}`;
  return rateLimitWithUpstash(identifier, limit, windowSeconds);
}
