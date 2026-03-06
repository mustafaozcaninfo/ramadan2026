import { getRamadanDay } from '@/lib/prayer';

describe('prayer utilities', () => {
  it('returns correct Ramadan day for first day of Ramadan 2026 (Doha)', () => {
    expect(getRamadanDay('2026-02-18')).toBe(1);
  });

  it('returns null for non-Ramadan date', () => {
    expect(getRamadanDay('2026-01-10')).toBeNull();
  });
});

