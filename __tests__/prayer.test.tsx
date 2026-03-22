import { hijriRamadanDayFromResponse } from '@/lib/prayer';
import { gregorianDdMmYyyyToIso } from '@/lib/gregorianIso';

describe('prayer utilities', () => {
  it('hijriRamadanDayFromResponse returns day when month is Ramadan (9)', () => {
    expect(
      hijriRamadanDayFromResponse({
        date: '01-09-1447',
        format: 'DD-MM-YYYY',
        day: '15',
        weekday: { en: '', ar: '' },
        month: { number: 9, en: 'Ramadan', ar: 'رمضان' },
        year: '1447',
      })
    ).toBe(15);
  });

  it('hijriRamadanDayFromResponse returns null outside Ramadan', () => {
    expect(
      hijriRamadanDayFromResponse({
        date: '01-08-1447',
        format: 'DD-MM-YYYY',
        day: '10',
        weekday: { en: '', ar: '' },
        month: { number: 8, en: "Sha'ban", ar: '' },
        year: '1447',
      })
    ).toBeNull();
  });

  it('gregorianDdMmYyyyToIso converts Aladhan gregorian date', () => {
    expect(gregorianDdMmYyyyToIso('22-03-2025')).toBe('2025-03-22');
    expect(gregorianDdMmYyyyToIso('invalid')).toBeNull();
  });
});
