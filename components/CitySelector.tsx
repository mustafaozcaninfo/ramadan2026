'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { SUPPORTED_CITIES } from '@/lib/prayer';
import { RAMADAN_CITY_COOKIE, getCityConfigFromCookie } from '@/lib/cityCookie';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function setCityCookie(city: string, country: string) {
  if (typeof document === 'undefined') return;
  const value = `${encodeURIComponent(city)}:${encodeURIComponent(country)}`;
  document.cookie = `${RAMADAN_CITY_COOKIE}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

function getCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? m[1] : undefined;
}

export function CitySelector() {
  const t = useTranslations('settings');
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);

  useEffect(() => {
    const val = getCookieValue(RAMADAN_CITY_COOKIE);
    if (val) {
      const config = getCityConfigFromCookie(val);
      if (config.city !== city) setCity(config.city);
    }
  }, [city, setCity]);

  const currentConfig = SUPPORTED_CITIES.find((c) => c.city === city) ?? SUPPORTED_CITIES[0];
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const found = SUPPORTED_CITIES.find(
      (c) => `${c.city}:${c.country}` === value || c.city === value
    );
    if (found) {
      setCity(found.city);
      setCityCookie(found.city, found.country);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="city-select" className="text-sm font-medium text-slate-300 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-ramadan-green" aria-hidden />
        {t('language') ? 'City' : 'Şehir'}
      </label>
      <select
        id="city-select"
        value={`${currentConfig.city}:${currentConfig.country}`}
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-ramadan-green min-h-[44px]"
        aria-label={t('language') ? 'Select city for prayer times' : 'Namaz vakitleri için şehir seçin'}
      >
        {SUPPORTED_CITIES.map((c) => (
          <option key={`${c.city}-${c.country}`} value={`${c.city}:${c.country}`}>
            {c.city}, {c.country}
          </option>
        ))}
      </select>
    </div>
  );
}
