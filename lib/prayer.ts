/**
 * Prayer times utilities
 * Uses local Ramadan 2026 data from PDF (Qatar Official Method) for Doha; Aladhan API for other cities.
 */

import ramadanData from './ramadan-2026-data.json';

export interface CityConfig {
  city: string;
  country: string;
  timezone?: string;
  method?: string;
}

export const SUPPORTED_CITIES: CityConfig[] = [
  { city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar', method: '10' }, // Qatar
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', method: '13' }, // Diyanet
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', method: '3' }, // MWL
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', method: '8' }, // Gulf Region
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', method: '4' }, // Umm Al-Qura
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', method: '5' }, // Egyptian
];

const DEFAULT_CITY: CityConfig = {
  city: 'Doha',
  country: 'Qatar',
  timezone: 'Asia/Qatar',
  method: '10',
};
const RAMADAN_START = '2026-02-18';
const RAMADAN_END = '2026-03-19';

function isDoha(config?: CityConfig): boolean {
  if (!config) return true;
  return config.city === 'Doha' && config.country === 'Qatar';
}

function isDateInRamadanRange(date: string): boolean {
  return date >= RAMADAN_START && date <= RAMADAN_END;
}

function toAladhanDate(isoDate: string): string {
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const [, year, month, day] = m;
  return `${day}-${month}-${year}`;
}

function buildAladhanUrl(date: string, config: CityConfig): string {
  const aladhanDate = toAladhanDate(date);
  const params = new URLSearchParams({
    city: config.city,
    country: config.country,
    method: config.method ?? DEFAULT_CITY.method ?? '10',
  });
  return `https://api.aladhan.com/v1/timingsByCity/${aladhanDate}?${params.toString()}`;
}

function getCityDateString(config: CityConfig, d: Date = new Date()): string {
  try {
    return d.toLocaleDateString('en-CA', {
      timeZone: config.timezone ?? DEFAULT_CITY.timezone,
    });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

export interface PrayerTimes {
  Fajr: string; // Sahur/İmsak
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string; // İftar
  Isha: string;
}

interface RamadanDayData {
  day: number;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
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

/**
 * Get prayer times for a specific date.
 * Uses local Ramadan 2026 data only for Doha when date is in range; otherwise Aladhan API.
 * @param date - Date string in format YYYY-MM-DD
 * @param cityConfig - Optional city/country; default Doha, Qatar
 */
export async function getPrayerTimes(
  date: string,
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse> {
  const useLocal =
    isDoha(cityConfig) && isDateInRamadanRange(date);
  const dayData = useLocal
    ? (ramadanData as RamadanDayData[]).find((day) => day.date === date)
    : null;

  if (!dayData) {
    const response = await fetch(buildAladhanUrl(date, cityConfig), {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    return response.json();
  }

  // Convert local data to AladhanResponse format
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  // Get Hijri date from API for this specific date (cached)
  // Calculate approximate Hijri date if API fails
  let hijriData = {
    date: '',
    format: 'DD-MM-YYYY',
    day: '',
    weekday: { en: '', ar: '' },
    month: { number: 0, en: '', ar: '' },
    year: '',
  };

  try {
    const hijriResponse = await fetch(buildAladhanUrl(date, DEFAULT_CITY), {
      next: { revalidate: 60 * 60 * 24 * 365 },
      signal: AbortSignal.timeout(5000),
    });
    if (hijriResponse.ok) {
      const hijriResult = await hijriResponse.json();
      hijriData = hijriResult.data.date.hijri;
    }
  } catch (error) {
    // Calculate approximate Hijri date (Ramadan 1447 AH starts around Feb 18, 2026)
    const ramadanStart = new Date('2026-02-18');
    const currentDate = new Date(date);
    const daysDiff = Math.floor((currentDate.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24));
    const hijriDay = 1 + daysDiff; // Approximate day in Ramadan
    
    if (hijriDay >= 1 && hijriDay <= 30) {
      hijriData = {
        date: `${hijriDay.toString().padStart(2, '0')}-09-1447`,
        format: 'DD-MM-YYYY',
        day: hijriDay.toString(),
        weekday: { en: '', ar: '' },
        month: { number: 9, en: 'Ramadan', ar: 'رمضان' },
        year: '1447',
      };
    }
  }
  
  return {
    code: 200,
    status: 'OK',
    data: {
      timings: {
        Fajr: dayData.fajr,
        Sunrise: dayData.sunrise,
        Dhuhr: dayData.dhuhr,
        Asr: dayData.asr,
        Maghrib: dayData.maghrib,
        Isha: dayData.isha,
      },
      date: {
        readable: dateObj.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        timestamp: Math.floor(dateObj.getTime() / 1000).toString(),
        gregorian: {
          date: `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`,
          format: 'DD-MM-YYYY',
          day: day.toString(),
          weekday: {
            en: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
            ar: '',
          },
          month: {
            number: month,
            en: dateObj.toLocaleDateString('en-US', { month: 'long' }),
          },
          year: year.toString(),
        },
        hijri: hijriData,
      },
    },
  };
}

/**
 * Get prayer times for today (Doha date).
 * If today is not in Ramadan, shows tomorrow's times when using Doha.
 * Uses local data for Doha when in range; otherwise Aladhan API.
 */
export async function getTodayPrayerTimes(
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse> {
  const today = getCityDateString(cityConfig);

  if (!isDoha(cityConfig)) {
    const response = await fetch(buildAladhanUrl(today, cityConfig), {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    return response.json();
  }

  let dayData = (ramadanData as RamadanDayData[]).find(
    (day) => day.date === today
  );

  if (!dayData) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getDohaDateString(tomorrow);
    dayData = (ramadanData as RamadanDayData[]).find(
      (day) => day.date === tomorrowStr
    );
    if (dayData) return getPrayerTimes(tomorrowStr, cityConfig);
  }

  if (dayData) return getPrayerTimes(dayData.date, cityConfig);

  const response = await fetch(buildAladhanUrl(today, cityConfig), {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) throw new Error('Failed to fetch prayer times');
  return response.json();
}

/**
 * Get prayer times for the entire Ramadan month (18 Feb - 19 Mar 2026).
 * Uses local data for Doha; otherwise fetches from API per day.
 */
export async function getRamadanPrayerTimes(
  cityConfig: CityConfig = DEFAULT_CITY
): Promise<AladhanResponse[]> {
  const days = ramadanData as RamadanDayData[];
  return Promise.all(
    days.map((dayData) => getPrayerTimes(dayData.date, cityConfig))
  );
}

/**
 * Parse time string (HH:mm) to Date object
 * If the time has passed today, returns tomorrow's date
 */
export function parseTimeToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, use tomorrow
  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  return target;
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

/**
 * Check if current time is before Sahur (Fajr)
 */
export function isBeforeSahur(fajrTime: string): boolean {
  const now = new Date();
  const fajr = parseTimeToDate(fajrTime);
  return now < fajr;
}

/**
 * Check if current time is after Sahur and before Iftar
 */
export function isFastingTime(fajrTime: string, maghribTime: string): boolean {
  const now = new Date();
  const fajr = parseTimeToDate(fajrTime);
  const maghrib = parseTimeToDate(maghribTime);
  return now >= fajr && now < maghrib;
}

/**
 * Check if current time is Iftar time or after
 */
export function isIftarTime(maghribTime: string): boolean {
  const now = new Date();
  const maghrib = parseTimeToDate(maghribTime);
  return now >= maghrib;
}

/** Doha timezone for "today" (API, client, consistency) */
const DOHA_TZ = 'Asia/Doha';

/**
 * Get today's date string (YYYY-MM-DD) in Doha timezone
 */
export function getDohaDateString(d: Date = new Date()): string {
  try {
    return d.toLocaleDateString('en-CA', { timeZone: DOHA_TZ });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/**
 * Get current Ramadan day number (1-30)
 * Returns null if current date is not during Ramadan
 */
export function getRamadanDay(date?: string): number | null {
  const targetDate = date || getDohaDateString();
  const dayData = (ramadanData as RamadanDayData[]).find(
    (day) => day.date === targetDate
  );
  return dayData ? dayData.day : null;
}
