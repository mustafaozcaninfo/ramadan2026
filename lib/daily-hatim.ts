/**
 * Daily Khatm (Hatim) for Ramadan: day 1–30 maps to Juz 1–30.
 * One Juz per day is a common 30-day Ramadan reading plan.
 */

export interface DailyHatimEntry {
  day: number;
  juz: number;
  labelTr: string;
  labelEn: string;
  labelAr: string;
}

export function getDailyHatim(ramadanDay: number): DailyHatimEntry | null {
  if (ramadanDay < 1 || ramadanDay > 30) return null;
  const juz = ramadanDay;
  return {
    day: ramadanDay,
    juz,
    labelTr: `Ramazan ${ramadanDay}. Gün – Cüz ${juz}`,
    labelEn: `Ramadan Day ${ramadanDay} – Juz ${juz}`,
    labelAr: `اليوم ${ramadanDay} من رمضان – الجزء ${juz}`,
  };
}
