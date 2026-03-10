'use client';

export function PrayerTimeSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/60 rounded-xl p-4 border border-slate-600/60 animate-pulse shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 bg-slate-600 rounded"></div>
        <div className="h-5 w-32 bg-slate-600 rounded"></div>
      </div>
      <div className="h-7 w-24 bg-slate-600 rounded mb-3"></div>
      <div className="h-11 w-36 bg-slate-600 rounded mx-auto"></div>
    </div>
  );
}

export function CalendarCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/60 border border-slate-600/60 rounded-xl p-4 animate-pulse shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-2">
        <div className="h-5 w-16 bg-slate-600 rounded"></div>
        <div className="h-5 w-12 bg-slate-600 rounded"></div>
      </div>
      <div className="h-4 w-32 bg-slate-600 rounded mb-1"></div>
      <div className="h-4 w-24 bg-slate-600 rounded mb-4"></div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 bg-slate-600 rounded"></div>
            <div className="h-4 w-16 bg-slate-600 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
