'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CountdownProps {
  targetTime: string;
  targetDateTime?: Date;
  label: string;
  locale?: 'tr' | 'en' | 'ar';
  /** `next` = sıradaki namaz (varsayılan); eski sahur/iftar stilleri geriye dönük. */
  variant?: 'sahur' | 'iftar' | 'next';
}

interface CountdownCardProps {
  value: number;
  label: string;
  index: number;
  variant?: 'sahur' | 'iftar' | 'next';
}

function CountdownCard({ value, label, index, variant = 'next' }: CountdownCardProps) {
  const reduceMotion = useReducedMotion();
  const gradientClass =
    variant === 'sahur'
      ? 'bg-gradient-to-br from-blue-500/40 via-blue-600/50 to-blue-700/60 dark:from-blue-600/50 dark:via-blue-700/60 dark:to-blue-800/70'
      : variant === 'iftar'
        ? 'bg-gradient-to-br from-ramadan-gold/40 via-ramadan-gold/50 to-ramadan-gold/60 dark:from-ramadan-gold/50 dark:via-ramadan-gold/60 dark:to-ramadan-gold/70'
        : 'bg-gradient-to-br from-emerald-500/35 via-slate-600/45 to-slate-700/55 dark:from-emerald-600/40 dark:via-slate-700/55 dark:to-slate-800/65';

  const borderClass =
    variant === 'sahur'
      ? 'border-blue-400/50 dark:border-blue-500/50'
      : variant === 'iftar'
        ? 'border-ramadan-gold/50 dark:border-ramadan-gold/60'
        : 'border-emerald-400/45 dark:border-emerald-500/40';

  const textColor =
    variant === 'sahur' ? 'text-blue-100' : variant === 'iftar' ? 'text-ramadan-gold' : 'text-emerald-100';

  const isLowTime =
    (label.toLowerCase().includes('minute') ||
      label.toLowerCase().includes('dakika') ||
      label.includes('دقيقة')) &&
    value < 5;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.24, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center ${gradientClass} ${borderClass} rounded-2xl p-4 sm:p-5 md:p-6 flex-1 max-w-[100px] sm:max-w-[120px] border-2 shadow-lg shadow-black/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 ${isLowTime ? 'ring-2 ring-red-400/50 ring-opacity-75' : ''}`}
      role="timer"
      aria-label={`${value} ${label}`}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        key={value}
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 1.08, opacity: 0.74 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${textColor} font-mono tabular-nums mb-1 sm:mb-2 drop-shadow-lg`}
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <p className="text-xs sm:text-sm font-semibold text-slate-200 dark:text-slate-100 uppercase tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}

export function Countdown({
  targetTime,
  targetDateTime,
  label,
  locale = 'tr',
  variant = 'next',
}: CountdownProps) {
  const reduceMotion = useReducedMotion();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const targetDate = useMemo(() => {
    if (targetDateTime instanceof Date) {
      return targetDateTime;
    }
    const [hours, minutes] = targetTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours ?? 0, minutes ?? 0, 0, 0);
    if (target.getTime() < now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }, [targetTime, targetDateTime]);

  const updateCountdown = useCallback(() => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setTimeRemaining((prev) => {
      if (
        prev.days !== days ||
        prev.hours !== hours ||
        prev.minutes !== minutes ||
        prev.seconds !== seconds
      ) {
        return { days, hours, minutes, seconds };
      }
      return prev;
    });
  }, [targetDate]);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  const labels =
    locale === 'tr'
      ? ['Gün', 'Saat', 'Dakika', 'Saniye']
      : locale === 'ar'
        ? ['يوم', 'ساعة', 'دقيقة', 'ثانية']
        : ['Days', 'Hours', 'Minutes', 'Seconds'];

  const showDays = timeRemaining.days > 0;
  const countdownItems = showDays
    ? [
        { value: timeRemaining.days, label: labels[0] },
        { value: timeRemaining.hours, label: labels[1] },
        { value: timeRemaining.minutes, label: labels[2] },
        { value: timeRemaining.seconds, label: labels[3] },
      ]
    : [
        { value: timeRemaining.hours, label: labels[1] },
        { value: timeRemaining.minutes, label: labels[2] },
        { value: timeRemaining.seconds, label: labels[3] },
      ];

  const isZero =
    timeRemaining.days === 0 &&
    timeRemaining.hours === 0 &&
    timeRemaining.minutes === 0 &&
    timeRemaining.seconds === 0;

  useEffect(() => {
    if (isZero && typeof window !== 'undefined') {
      const announcement =
        locale === 'tr' ? 'Süre doldu!' : locale === 'ar' ? 'انتهى الوقت!' : 'Time is up!';
      const announcementEl = document.createElement('div');
      announcementEl.setAttribute('role', 'status');
      announcementEl.setAttribute('aria-live', 'polite');
      announcementEl.setAttribute('aria-atomic', 'true');
      announcementEl.className = 'sr-only';
      announcementEl.textContent = announcement;
      document.body.appendChild(announcementEl);
      setTimeout(() => {
        document.body.removeChild(announcementEl);
      }, reduceMotion ? 100 : 1000);
    }
  }, [isZero, locale, reduceMotion]);

  return (
    <div className="w-full" role="timer" aria-live="polite" aria-atomic="false" aria-label={label || undefined}>
      {label && (
        <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 mb-3 sm:mb-4 text-center font-medium">
          {label}
        </p>
      )}
      <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
        {countdownItems.map((item, index) => (
          <CountdownCard
            key={`${item.label}-${index}`}
            value={item.value}
            label={item.label}
            index={index}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
