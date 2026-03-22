import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { SUPPORTED_CITIES, getDohaDateString, getPrayerTimes, getTodayPrayerTimes } from '@/lib/prayer';
import { OPS_AUTH_COOKIE, isOpsAuthenticatedFromCookie } from '@/lib/opsAuth';

const REDIS_PREFIX = 'ramadan:push:';

type OpsSubscription = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  locale?: 'tr' | 'en' | 'ar';
  reminderIntervals?: number[];
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function providerFromEndpoint(endpoint: string): string {
  if (endpoint.includes('push.apple.com')) return 'apple';
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  if (endpoint.includes('mozilla.com') || endpoint.includes('updates.push.services.mozilla.com')) return 'mozilla';
  if (endpoint.includes('windows.com')) return 'windows';
  return 'other';
}

function parseOpsSub(raw: unknown): OpsSubscription | null {
  try {
    const val = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!val || typeof val !== 'object') return null;
    return val as OpsSubscription;
  } catch {
    return null;
  }
}

function dohaTimeToUtc(dateStr: string, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:00`);
}

async function getNextReminderSlot() {
  try {
    const dohaDate = getDohaDateString();
    const data = await getPrayerTimes(dohaDate);
    const fajr = data?.data?.timings?.Fajr;
    const maghrib = data?.data?.timings?.Maghrib;
    if (!fajr || !maghrib) return null;

    const now = Date.now();
    const oneMin = 60 * 1000;
    const fajrUtc = dohaTimeToUtc(dohaDate, fajr).getTime();
    const maghribUtc = dohaTimeToUtc(dohaDate, maghrib).getTime();
    const intervals = [15, 10, 5, 0];
    const candidates: Array<{ type: 'fajr' | 'maghrib'; minutes: number; runAt: number }> = [];

    for (const minutes of intervals) {
      candidates.push({ type: 'fajr', minutes, runAt: fajrUtc - minutes * oneMin });
      candidates.push({ type: 'maghrib', minutes, runAt: maghribUtc - minutes * oneMin });
    }

    const next = candidates
      .filter((c) => c.runAt > now)
      .sort((a, b) => a.runAt - b.runAt)[0];

    if (!next) return null;
    return {
      ...next,
      runAtIso: new Date(next.runAt).toISOString(),
      dohaDate,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const isAuthorized = isOpsAuthenticatedFromCookie(request.cookies.get(OPS_AUTH_COOKIE)?.value);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const redis = getRedis();

  const cityChecks = await Promise.all(
    SUPPORTED_CITIES.map(async (cityConfig) => {
      const checkStarted = Date.now();
      try {
        const data = await getTodayPrayerTimes(cityConfig);
        return {
          city: cityConfig.city,
          country: cityConfig.country,
          timezone: cityConfig.timezone ?? null,
          method: cityConfig.method ?? null,
          ok: true,
          durationMs: Date.now() - checkStarted,
          date: data?.data?.date?.gregorian?.date ?? null,
          fajr: data?.data?.timings?.Fajr ?? null,
          maghrib: data?.data?.timings?.Maghrib ?? null,
        };
      } catch (error) {
        return {
          city: cityConfig.city,
          country: cityConfig.country,
          timezone: cityConfig.timezone ?? null,
          method: cityConfig.method ?? null,
          ok: false,
          durationMs: Date.now() - checkStarted,
          error: error instanceof Error ? error.message : 'unknown_error',
        };
      }
    })
  );

  let subscriptionCount = 0;
  let sentSlotCount = 0;
  let localeCounts: Record<string, number> = { tr: 0, en: 0, ar: 0 };
  let providerCounts: Record<string, number> = {};
  let intervalCounts: Record<string, number> = {};
  let recentSentSlots: string[] = [];
  let sampledSubscriptions = 0;

  if (redis) {
    try {
      const keys = await redis.keys(`${REDIS_PREFIX}*`);
      const sentKeys = keys.filter((k) => k.startsWith(`${REDIS_PREFIX}sent:`));
      const subKeys = keys.filter((k) => !k.startsWith(`${REDIS_PREFIX}sent:`));
      sentSlotCount = sentKeys.length;
      recentSentSlots = sentKeys
        .map((k) => k.replace(`${REDIS_PREFIX}sent:`, ''))
        .sort()
        .reverse()
        .slice(0, 12);

      subscriptionCount = subKeys.length;
      const sample = subKeys.slice(0, 500);
      sampledSubscriptions = sample.length;

      for (const key of sample) {
        const raw = await redis.get<unknown>(key);
        const sub = parseOpsSub(raw);
        if (!sub?.subscription?.endpoint) continue;

        const locale = sub.locale === 'en' ? 'en' : sub.locale === 'ar' ? 'ar' : 'tr';
        localeCounts[locale] = (localeCounts[locale] ?? 0) + 1;

        const provider = providerFromEndpoint(sub.subscription.endpoint);
        providerCounts[provider] = (providerCounts[provider] ?? 0) + 1;

        const intervals = Array.isArray(sub.reminderIntervals) && sub.reminderIntervals.length
          ? sub.reminderIntervals
          : [15, 10, 5, 0];
        for (const i of intervals) {
          const keyName = String(i);
          intervalCounts[keyName] = (intervalCounts[keyName] ?? 0) + 1;
        }
      }
    } catch {
      // keep zeros on redis read failure
    }
  }

  const nextReminder = await getNextReminderSlot();
  const cityOkCount = cityChecks.filter((c) => c.ok).length;
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    warnings.push('VAPID keys are missing');
  }
  if (!redis) {
    warnings.push('Upstash Redis is not configured');
  }
  if (cityOkCount !== cityChecks.length) {
    warnings.push('Some city timing checks failed');
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    env: {
      redisConfigured: !!redis,
      vapidConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY,
      cronSecretConfigured: !!process.env.CRON_SECRET,
    },
    summary: {
      cityChecksTotal: cityChecks.length,
      cityChecksOk: cityOkCount,
      subscriptionsTotal: subscriptionCount,
      subscriptionsSampled: sampledSubscriptions,
      sentSlotsTotal: sentSlotCount,
    },
    push: {
      localeCounts,
      providerCounts,
      intervalCounts,
      recentSentSlots,
    },
    nextReminder,
    cityChecks,
    warnings,
  });
}
