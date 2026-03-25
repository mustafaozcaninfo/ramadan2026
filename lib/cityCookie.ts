import type { CityConfig } from '@/lib/prayer';
import { SUPPORTED_CITIES } from '@/lib/prayer';

export const PRAYER_CITY_COOKIE = 'prayer-city';

/** Legacy name — still read so existing users keep their city. */
export const LEGACY_PRAYER_CITY_COOKIE = 'ramadan-city';

/**
 * Parse cookie value "city:country" into CityConfig. Used by server.
 */
export function getCityConfigFromCookie(cookieValue: string | undefined): CityConfig {
  if (!cookieValue) return SUPPORTED_CITIES[0];
  try {
    const decoded = decodeURIComponent(cookieValue.trim());
    const [city, country] = decoded.split(':');
    if (city && country) {
      const found = SUPPORTED_CITIES.find(
        (c) => c.city === city && c.country === country
      );
      if (found) return found;
      return { city, country };
    }
  } catch {
    // ignore
  }
  return SUPPORTED_CITIES[0];
}

/** Read city from Next.js cookies() (prefers new cookie, falls back to legacy). */
export function getCityConfigFromNextCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}): CityConfig {
  const raw =
    cookieStore.get(PRAYER_CITY_COOKIE)?.value ??
    cookieStore.get(LEGACY_PRAYER_CITY_COOKIE)?.value;
  return getCityConfigFromCookie(raw);
}
