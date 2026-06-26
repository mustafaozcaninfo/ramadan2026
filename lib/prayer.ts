/**
 * Prayer times utilities — Aladhan API.
 * Uses fixed lat/long per city (timings endpoint) for deterministic results;
 * falls back to city/country geocoding (timingsByCity) only if coords missing.
 */

import { formatInTimeZone, toDate } from 'date-fns-tz';

export interface CityConfig {
  city: string;
  country: string;
  timezone?: string;
  method?: string;
  latitude?: number;
  longitude?: number;
}

export const SUPPORTED_CITIES: CityConfig[] = [
  { city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar', method: '10', latitude: 25.323, longitude: 51.5303 },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', method: '13', latitude: 41.0082, longitude: 28.9784 },
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', method: '3', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', method: '8', latitude: 25.2048, longitude: 55.2708 },
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', method: '4', latitude: 24.7136, longitude: 46.6753 },
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', method: '5', latitude: 30.0444, longitude: 31.2357 },
];

const DEFAULT_CITY: CityConfig = {
  city: 'Doha',
  country: 'Qatar',
  timezone: 'Asia/Qatar',
  method: '10',
  latitude: 25.323,
  longitude: 51.5303,
};

function toAladhanDate(isoDate: string): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const [, year, month, day] = m;
  return `${day}-${month}-${year}`;
}

function buildAladhanUrl(date: string, config: CityConfig): string {
  const aladhanDate = toAladhanDate(date);
  const method = config.method ?? DEFAULT_CITY.method ?? '10';

  if (typeof config.latitude === 'number' && typeof config.longitude === 'number') {
    const params = new URLSearchParams({
      latitude: String(config.latitude),
      longitude: String(config.longitude),
      method,
    });
    if (config.timezone) params.set('timezonestring', config.timezone);
    return `https://api.aladhan.com/v1/timings/${aladhanDate}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    city: config.city,
    country: config.country,
    method,
  });
  return `https://api.aladhan.com/v1/timingsByCity/${aladhanDate}?${params.toString()}`;
}

/** Gregorian YYYY-MM-DD for the given instant in the city's timezone. */
export function getCityDateString(config: CityConfig, d: Date = new Date()): string {
  try {
    return d.toLocaleDateString('en-CA', {
      timeZone: config.timezone ?? DEFAULT_CITY.timezone,
    });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

export function getYearMonthInCityTimezone(
  config: CityConfig,
  d: Date = new Date()
): { year: number; month: number } {
  const tz = config.timezone ?? DEFAULT_CITY.timezone ?? 'UTC';
  return {
    year: Number(formatInTimeZone(d, tz, 'yyyy')),
    month: Number(formatInTimeZone(d, tz, 'M')),
  };
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
    };
  };
}

export type HijriDateInfo = AladhanResponse['data']['date']['hijri'];

/**
 * Prayer times for a Gregorian date (YYYY-MM-DD) via Aladhan.
 */
export async function getPrayerTimes(
  date: string,
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse> {
  const response = await fetch(buildAladhanUrl(date, cityConfig), {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) throw new Error('Failed to fetch prayer times');
  return response.json();
}

/**
 * Prayer times for "today" in the city's timezone.
 */
export async function getTodayPrayerTimes(
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse> {
  const today = getCityDateString(cityConfig);
  return getPrayerTimes(today, cityConfig);
}

/**
 * All days in a Gregorian month (month 1–12) for the given city.
 */
export async function getMonthPrayerTimes(
  year: number,
  month: number,
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse[]> {
  const lastDay = new Date(year, month, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= lastDay; d++) {
    dates.push(
      `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }
  return Promise.all(dates.map((date) => getPrayerTimes(date, cityConfig)));
}

/**
 * Calculate time remaining until target time
 */
export function getTimeRemaining(targetTime: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(
  hours: number,
  minutes: number,
  seconds: number
): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Wall-clock prayer time (YYYY-MM-DD + HH:mm from Aladhan) → UTC `Date`. */
export function localPrayerTimeToUtc(
  dateStr: string,
  timeHHmm: string,
  timeZone: string
): Date {
  const [h, m] = timeHHmm.split(':').map(Number);
  const wall = `${dateStr}T${String(h ?? 0).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}:00`;
  return toDate(wall, { timeZone });
}

/** Doha timezone — push/ops that still key off Qatar calendar day. */
const DOHA_TZ = 'Asia/Doha';

export function getDohaDateString(d: Date = new Date()): string {
  try {
    return d.toLocaleDateString('en-CA', { timeZone: DOHA_TZ });
  } catch {
    return d.toISOString().split('T')[0];
  }
}
