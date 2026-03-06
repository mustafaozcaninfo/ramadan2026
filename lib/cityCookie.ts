import type { CityConfig } from '@/lib/prayer';
import { SUPPORTED_CITIES } from '@/lib/prayer';

export const RAMADAN_CITY_COOKIE = 'ramadan-city';

/**
 * Parse cookie value "city:country" into CityConfig. Used by server.
 */
export function getCityConfigFromCookie(cookieValue: string | undefined): CityConfig {
  if (!cookieValue) return { city: 'Doha', country: 'Qatar' };
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
  return { city: 'Doha', country: 'Qatar' };
}
