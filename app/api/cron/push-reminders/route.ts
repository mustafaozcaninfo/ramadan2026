import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { Redis } from '@upstash/redis';
import { getPrayerTimes, getDohaDateString } from '@/lib/prayer';

const REDIS_PREFIX = 'ramadan:push:';
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

const PAYLOADS = {
  tr: {
    fajr: (m: number) => ({
      title: m === 0 ? 'Sahur Vakti!' : `${m} dakika kaldı`,
      body: m === 0 ? 'Sahur vakti geldi' : `${m} dakika sonra Sahur vakti`,
    }),
    maghrib: (m: number) => ({
      title: m === 0 ? 'İftar Vakti!' : `${m} dakika kaldı`,
      body: m === 0 ? 'İftar vakti geldi' : `${m} dakika sonra İftar vakti`,
    }),
  },
  en: {
    fajr: (m: number) => ({
      title: m === 0 ? 'Suhoor Time!' : `${m} min remaining`,
      body: m === 0 ? 'Suhoor time has started' : `${m} minutes until Suhoor`,
    }),
    maghrib: (m: number) => ({
      title: m === 0 ? 'Iftar Time!' : `${m} min remaining`,
      body: m === 0 ? 'Iftar time has started' : `${m} minutes until Iftar`,
    }),
  },
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Build Date for a Doha time string (HH:mm) on given date (YYYY-MM-DD). Qatar UTC+3. */
function dohaTimeToUtc(dateStr: string, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+03:00`);
}

/**
 * GET /api/cron/push-reminders
 * Called by Vercel Cron every minute. Sends Web Push for 15/10/5/0 min before Fajr/Maghrib.
 */
export async function GET(request: NextRequest) {
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
    webPush.setVapidDetails(
      'mailto:ramadan@example.com',
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );

    // ?test=1 → Tüm abonelere anında test bildirimi gönder (saat beklemeye gerek yok)
    const isTest = request.nextUrl.searchParams.get('test') === '1';
    if (isTest) {
      const keys = await redis.keys(`${REDIS_PREFIX}*`);
      let sent = 0;
      const testPayload = (locale: string) =>
        locale === 'en'
          ? { title: 'Test – Notifications working', body: 'Ramadan 2026 Doha' }
          : { title: 'Test – Bildirimler çalışıyor', body: 'Ramadan 2026 Doha' };
      for (const key of keys) {
        if (key.startsWith(`${REDIS_PREFIX}sent:`)) continue;
        try {
          const raw = await redis.get<string>(key);
          if (!raw) continue;
          const { subscription, locale } = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const { title, body } = testPayload(locale === 'en' ? 'en' : 'tr');
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

    const dohaDate = getDohaDateString();
    const data = await getPrayerTimes(dohaDate);
    const Fajr = data?.data?.timings?.Fajr;
    const Maghrib = data?.data?.timings?.Maghrib;
    if (!Fajr || !Maghrib) {
      return NextResponse.json({ ok: true, sent: 0, reason: 'no timings' });
    }

    const now = Date.now();
    const fajrUtc = dohaTimeToUtc(dohaDate, Fajr).getTime();
    const maghribUtc = dohaTimeToUtc(dohaDate, Maghrib).getTime();
    const oneMin = 60 * 1000;
    // Pencere süresi: cron 5 dk'da bir çalışıyorsa 5*oneMin, dakikada bir ise oneMin kullanın
    const windowMs = 5 * oneMin;

    type Reminder = { type: 'fajr' | 'maghrib'; minutes: number };
    let reminder: Reminder | null = null;

    for (const minutes of [15, 10, 5, 0]) {
      const fajrReminder = fajrUtc - minutes * oneMin;
      if (now >= fajrReminder && now < fajrReminder + windowMs) {
        reminder = { type: 'fajr', minutes };
        break;
      }
      const maghribReminder = maghribUtc - minutes * oneMin;
      if (now >= maghribReminder && now < maghribReminder + windowMs) {
        reminder = { type: 'maghrib', minutes };
        break;
      }
    }

    if (!reminder) {
      return NextResponse.json({ ok: true, sent: 0, reason: 'no window' });
    }

    // Aynı slot (gün + vakit + dakika) için 5 dk pencerede sadece bir kez gönder (cron dakikada bir veya 5 dk'da bir çalışsa da)
    const sentKey = `${REDIS_PREFIX}sent:${dohaDate}:${reminder.type}:${reminder.minutes}`;
    if (await redis.get(sentKey)) {
      return NextResponse.json({ ok: true, sent: 0, reason: 'already sent this slot' });
    }
    await redis.set(sentKey, '1', { ex: 600 }); // 10 dk TTL

    const keys = await redis.keys(`${REDIS_PREFIX}*`);
    let sent = 0;

    for (const key of keys) {
      if (key.startsWith(`${REDIS_PREFIX}sent:`)) continue; // dedupe key'leri abonelik değil
      try {
        const raw = await redis.get<string>(key);
        if (!raw) continue;
        const { subscription, locale } = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const loc = locale === 'en' ? 'en' : 'tr';
        const { title, body } = reminder.type === 'fajr'
          ? PAYLOADS[loc].fajr(reminder.minutes)
          : PAYLOADS[loc].maghrib(reminder.minutes);
        const sub = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        };
        await webPush.sendNotification(sub, JSON.stringify({ title, body }), {
          TTL: 60,
        });
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          await redis.del(key);
        }
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    console.error('Cron push error:', e);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
