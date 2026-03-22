import { fromZonedTime } from 'date-fns-tz';

/** Aladhan often returns "HH:mm" or "HH:mm (GST)" — take wall clock HH:mm. */
export function normalizeAladhanTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '00:00';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

/** Absolute instant for a Gregorian calendar day + prayer clock in an IANA timezone. */
export function prayerInstantInZone(
  isoDate: string,
  aladhanTime: string,
  timeZone: string
): Date {
  const hm = normalizeAladhanTime(aladhanTime);
  return fromZonedTime(`${isoDate} ${hm}:00`, timeZone);
}
