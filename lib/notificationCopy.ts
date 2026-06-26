export type NotificationLocale = 'tr' | 'en' | 'ar';

export type PrayerNotificationKey =
  | 'Fajr'
  | 'Sunrise'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Isha';

export const DEFAULT_REMINDER_INTERVALS = [15, 10, 5, 0] as const;

export const PRAYER_NOTIFICATION_ORDER: PrayerNotificationKey[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

const PRAYER_LABELS: Record<NotificationLocale, Record<PrayerNotificationKey, string>> = {
  tr: {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı',
  },
  en: {
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
  },
  ar: {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  },
};

export const PUSH_FALLBACK_COPY: Record<NotificationLocale, { title: string; body: string }> = {
  tr: { title: 'Namaz Vakitleri', body: 'Hatırlatıcı' },
  en: { title: 'Prayer Times', body: 'Reminder' },
  ar: { title: 'مواقيت الصلاة', body: 'تذكير' },
};

export function buildPrayerNotificationPayload(
  locale: NotificationLocale,
  prayerKey: PrayerNotificationKey,
  minutes: number
): { title: string; body: string } {
  const name = PRAYER_LABELS[locale][prayerKey];
  if (locale === 'tr') {
    return minutes === 0
      ? { title: `${name} vakti`, body: `${name} vakti girdi` }
      : { title: `${minutes} dakika kaldı`, body: `${minutes} dakika sonra ${name}` };
  }
  if (locale === 'ar') {
    return minutes === 0
      ? { title: `وَقت ${name}`, body: `دخل وَقت ${name}` }
      : { title: `متبقي ${minutes} دقيقة`, body: `متبقي ${minutes} دقيقة على ${name}` };
  }
  return minutes === 0
    ? { title: `${name} time`, body: `${name} time has started` }
    : { title: `${minutes} min left`, body: `${minutes} minutes until ${name}` };
}
