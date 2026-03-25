import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { Redis } from '@upstash/redis';
import {
  getCityDateString,
  getPrayerTimes,
  localPrayerTimeToUtc,
  type CityConfig,
  type PrayerTimes,
} from '@/lib/prayer';
import { getValidatedCityConfig } from '@/lib/api-validation';
import {
  PUSH_SUBSCRIPTION_PREFIX,
  fetchAllPushRedisKeys,
  filterPushSubscriptionKeys,
} from '@/lib/pushRedis';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';

const PRAYER_ORDER: (keyof PrayerTimes)[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

const PRAYER_LABELS: Record<'tr' | 'en' | 'ar', Record<keyof PrayerTimes, string>> = {
  tr: {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı',
  },
  en: {
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
  },
  ar: {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  },
};

function buildPayload(
  loc: 'tr' | 'en' | 'ar',
  prayerKey: keyof PrayerTimes,
  minutes: number
): { title: string; body: string } {
  const name = PRAYER_LABELS[loc][prayerKey];
  if (loc === 'tr') {
    return minutes === 0
      ? { title: `${name} vakti`, body: `${name} vakti girdi` }
      : { title: `${minutes} dakika kaldı`, body: `${minutes} dakika sonra ${name}` };
  }
  if (loc === 'ar') {
    return minutes === 0
      ? { title: `وَقت ${name}`, body: `دخل وَقت ${name}` }
      : { title: `متبقي ${minutes} دقيقة`, body: `متبقي ${minutes} دقيقة على ${name}` };
  }
  return minutes === 0
    ? { title: `${name} time`, body: `${name} time has started` }
    : { title: `${minutes} min left`, body: `${minutes} minutes until ${name}` };
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * GET /api/cron/push-reminders
 * Vercel / harici cron (ör. dakikada veya 5 dk'da bir) çağırır.
 * Tüm namaz vakitleri için 15/10/5/0 dk önce Web Push gönderir.
 */
export async function GET(request: NextRequest) {
  if (IS_PROD && !CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is required in production' }, { status: 503 });
  }

  if (CRON_SECRET && request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ error: 'VAPID not configured' }, { status: 503 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
  }

  try {
    webPush.setVapidDetails('mailto:ops@example.com', VAPID_PUBLIC, VAPID_PRIVATE);

    const isTest = request.nextUrl.searchParams.get('test') === '1';
    if (isTest) {
      const keys = filterPushSubscriptionKeys(await fetchAllPushRedisKeys(redis));
      let sent = 0;
      const testPayload = (locale: string) =>
        locale === 'en'
          ? { title: 'Test – Prayer notifications', body: 'All prayer times pipeline active' }
          : locale === 'ar'
            ? { title: 'اختبار – إشعارات الأوقات', body: 'مسار جميع الأوقات يعمل' }
            : { title: 'Test – Namaz bildirimleri', body: 'Tüm vakitler için hatırlatıcı aktif' };
      for (const key of keys) {
        try {
          const raw = await redis.get<string>(key);
          if (!raw) continue;
          const { subscription, locale } = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const normalizedLocale = locale === 'en' ? 'en' : locale === 'ar' ? 'ar' : 'tr';
          const { title, body } = testPayload(normalizedLocale);
          await webPush.sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            JSON.stringify({ title, body }),
            { TTL: 60 }
          );
          sent++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 410 || status === 404) await redis.del(key);
        }
      }
      return NextResponse.json({ ok: true, sent, test: true });
    }

    const now = Date.now();
    const oneMin = 60 * 1000;
    const windowMs = 5 * oneMin;

    type SubRow = {
      redisKey: string;
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
      locale?: string;
      reminderIntervals?: number[];
      city?: string;
      country?: string;
    };

    const subKeys = filterPushSubscriptionKeys(await fetchAllPushRedisKeys(redis));

    const byCity = new Map<string, { config: CityConfig; subs: SubRow[] }>();

    for (const key of subKeys) {
      const raw = await redis.get<string>(key);
      if (!raw) continue;
      let row: Omit<SubRow, 'redisKey'>;
      try {
        row = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        continue;
      }
      if (!row.subscription?.endpoint) continue;

      const cfg = getValidatedCityConfig(row.city, row.country);
      const scope = `${cfg.city}|${cfg.country}`;
      const full: SubRow = { redisKey: key, ...row };
      const existing = byCity.get(scope);
      if (existing) {
        existing.subs.push(full);
      } else {
        byCity.set(scope, { config: cfg, subs: [full] });
      }
    }

    if (byCity.size === 0) {
      return NextResponse.json({ ok: true, sent: 0, reason: 'no subscribers' });
    }

    let totalSent = 0;

    for (const { config, subs } of byCity.values()) {
      const tz = config.timezone ?? 'UTC';
      const dateStr = getCityDateString(config);
      let timings: PrayerTimes | undefined;
      try {
        const data = await getPrayerTimes(dateStr, config);
        timings = data?.data?.timings;
      } catch {
        continue;
      }
      if (!timings) continue;

      let reminder: { prayerKey: keyof PrayerTimes; minutes: number } | null = null;

      outer: for (const prayerKey of PRAYER_ORDER) {
        const timeStr = timings[prayerKey];
        if (!timeStr) continue;
        for (const minutes of [15, 10, 5, 0]) {
          const tUtc = localPrayerTimeToUtc(dateStr, timeStr, tz).getTime() - minutes * oneMin;
          if (now >= tUtc && now < tUtc + windowMs) {
            reminder = { prayerKey, minutes };
            break outer;
          }
        }
      }

      if (!reminder) continue;

      const sentKey = `${PUSH_SUBSCRIPTION_PREFIX}sent:${encodeURIComponent(config.city)}:${encodeURIComponent(config.country)}:${dateStr}:${reminder.prayerKey}:${reminder.minutes}`;
      if (await redis.get(sentKey)) continue;
      await redis.set(sentKey, '1', { ex: 600 });

      const defaultIntervals = [15, 10, 5, 0];

      for (const row of subs) {
        const intervals = Array.isArray(row.reminderIntervals) && row.reminderIntervals.length
          ? row.reminderIntervals
          : defaultIntervals;
        if (!intervals.includes(reminder.minutes)) continue;

        const loc = row.locale === 'en' ? 'en' : row.locale === 'ar' ? 'ar' : 'tr';
        const { title, body } = buildPayload(loc, reminder.prayerKey, reminder.minutes);
        try {
          await webPush.sendNotification(
            { endpoint: row.subscription.endpoint, keys: row.subscription.keys },
            JSON.stringify({ title, body }),
            { TTL: 60 }
          );
          totalSent++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 410 || status === 404) {
            await redis.del(row.redisKey);
          }
        }
      }
    }

    return NextResponse.json({ ok: true, sent: totalSent });
  } catch (e) {
    console.error('Cron push error:', e);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
