/** Aladhan gregorian.date is usually DD-MM-YYYY */
export function gregorianDdMmYyyyToIso(gregorianDate: string): string | null {
  const parts = gregorianDate.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [d, m, y] = parts;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
