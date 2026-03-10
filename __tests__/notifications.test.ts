import { normalizeNotificationLocale } from '@/lib/notifications';

describe('notification locale normalization', () => {
  it('keeps English locale as en', () => {
    expect(normalizeNotificationLocale('en')).toBe('en');
  });

  it('keeps Arabic locale as ar', () => {
    expect(normalizeNotificationLocale('ar')).toBe('ar');
  });

  it('falls back to Turkish for unknown/undefined locales', () => {
    expect(normalizeNotificationLocale(undefined)).toBe('tr');
    expect(normalizeNotificationLocale('fr')).toBe('tr');
  });
});
