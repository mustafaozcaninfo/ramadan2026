import { gregorianDdMmYyyyToIso } from '@/lib/gregorianIso';

describe('prayer utilities', () => {
  it('gregorianDdMmYyyyToIso converts Aladhan gregorian date', () => {
    expect(gregorianDdMmYyyyToIso('22-03-2025')).toBe('2025-03-22');
    expect(gregorianDdMmYyyyToIso('invalid')).toBeNull();
  });
});
