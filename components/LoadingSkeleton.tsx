'use client';

export function PrayerTimeSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-5 h-5 bg-slate-700 rounded"></div>
        <div className="h-5 w-24 bg-slate-700 rounded"></div>
      </div>
      <div className="h-8 w-20 bg-slate-700 rounded mb-2"></div>
      <div className="h-12 w-32 bg-slate-700 rounded mx-auto"></div>
    </div>
  );
}

export function CalendarCardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-16 bg-slate-700 rounded"></div>
        <div className="h-5 w-12 bg-slate-700 rounded"></div>
      </div>
      <div className="h-4 w-32 bg-slate-700 rounded mb-1"></div>
      <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 bg-slate-700 rounded"></div>
            <div className="h-4 w-16 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
