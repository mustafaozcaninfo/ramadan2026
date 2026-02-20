# Ramadan 2026 Doha Mobile App - Complete Project Specification

## Project Overview

Create a mobile application for Ramadan 2026 prayer times in Doha, Qatar. This is a Progressive Web App (PWA) that displays accurate prayer times (Sahur/Suhoor and Iftar), daily duas (prayers), countdown timers, and push notifications. The app supports both Turkish and English languages and uses the official Qatar calculation method.

**Key Dates:**
- Ramadan 2026: February 18 - March 19, 2026 (30 days)
- Location: Doha, Qatar (UTC+3)
- Calculation Method: Qatar Official Method (Method 10)

## Technical Stack

### Frontend Framework
- **Next.js 15.2.0** (React 19.0.0)
- **TypeScript 5.7.0**
- **Tailwind CSS 4.0.0** (with custom theme)
- **Framer Motion 11.11.0** (animations)
- **next-intl 3.19.0** (internationalization)

### PWA & Service Worker
- **Serwist 9.5.6** (Service Worker management)
- **@serwist/next 8.0.0** (Next.js integration)
- Service Worker with offline support, caching strategies, and background notifications

### Push Notifications
- **web-push 3.6.7** (server-side)
- **VAPID** (Voluntary Application Server Identification)
- **Upstash Redis** (subscription storage)
- Support for iOS 16.4+ PWA push notifications, Chrome, and other browsers

### Data Sources
- **Local JSON data** (`lib/ramadan-2026-data.json`) - Official Qatar Ramadan 2026 prayer times from PDF
- **Aladhan API** (`https://api.aladhan.com/v1/timingsByCity/`) - Fallback for non-Ramadan dates and Hijri dates
- **30 daily duas** - Pre-defined duas for each day of Ramadan (Turkish and English)

### Backend/API
- **Next.js API Routes** (serverless functions)
- **Vercel** (hosting)
- **cron-job.org** (external cron service for push notifications)

### UI Components
- **Radix UI** (`@radix-ui/react-slot`)
- **Lucide React** (icons)
- **Sonner** (toast notifications)
- Custom card, button, and navigation components

## Core Features

### 1. Homepage (`app/[locale]/page.tsx`)

**Layout Structure:**
- Full-screen gradient background (`bg-qatar-gradient`) with decorative blur elements
- Header with app title, subtitle, and location badge
- Main content area with cards in vertical stack
- Fixed bottom navigation bar

**Components on Homepage:**

#### PrayerTimeCard Component
- **Purpose:** Displays today's Sahur (Fajr) and Iftar (Maghrib) times with live countdown
- **Features:**
  - Dynamic status badge: "Sahur Öncesi" (Before Suhoor) / "Oruçlu" (Fasting) / "İftar Vakti" (Iftar Time)
  - Two cards: Sahur card (blue theme) and Iftar card (gold theme)
  - Cards reorder dynamically based on which prayer time is next
  - Sunrise time displayed in Sahur card (bottom right on desktop, below countdown on mobile)
  - Countdown timer showing days/hours/minutes/seconds until next prayer
  - If prayer time has passed today, shows tomorrow's time with "Yarınki Sahura/İftara Kalan Süre" label
  - Gregorian and Hijri dates displayed in header
  - Ramadan day number badge (e.g., "1. Gün" / "Day 1")
  - Framer Motion animations (fade in, slide up)

**Status Logic:**
- **Sahur Öncesi:** Midnight (00:00) until Fajr time
- **Oruçlu:** After Fajr until Maghrib
- **İftar Vakti:** After Maghrib until midnight

**Visual Design:**
- Gradient cards: `from-slate-700/90 to-slate-800/90`
- Sahur card: Blue border (`border-blue-500/40`), blue icon, white text
- Iftar card: Gold border (`border-ramadan-gold/50`), gold icon, gold text with glow effect
- Responsive: `p-4 sm:p-5`, `text-2xl sm:text-3xl md:text-4xl`
- Sunrise info: `mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400 sm:absolute sm:bottom-4 sm:right-4`

#### DuaOfTheDay Component
- **Purpose:** Displays the Dua of the Day for current Ramadan day
- **Features:**
  - Title (Turkish/English)
  - Arabic text (right-aligned, large font, `font-arabic`)
  - Transliteration (italic, smaller)
  - Translation (regular text)
  - Framer Motion animation (delay 0.3s)
  - Card design matching other cards

**Data Source:**
- `lib/duas.ts` - Array of 30 duas, one for each Ramadan day
- Function: `getDuaOfTheDay(locale)` - Returns dua based on current Ramadan day

#### NotificationButton Component
- **Purpose:** Enable/disable push notifications
- **Features:**
  - Toggle button with Bell/BellOff icon
  - Requests notification permission on first click
  - Subscribes to Web Push (VAPID) after permission granted
  - Stores subscription in Upstash Redis via `/api/push-subscribe`
  - Shows iOS-specific note if Safari/iOS detected
  - Shows Safari note for non-iOS browsers
  - Toast notifications for success/error

**iOS Note:** "iOS: Add to Home Screen (PWA) and enable notifications; with iOS 16.4+, background reminders are sent via server. Without server (Vercel Cron + Redis), reminders only work when the app is open."

**Safari Note:** "Safari: Reminders only when app is open. Chrome/PWA: work in background too."

#### AzanButton Component
- **Purpose:** Play Azan (call to prayer) sound manually
- **Features:**
  - Button with Volume2/VolumeX icon
  - Plays `/azan.mp3` audio file
  - Toggle play/pause functionality
  - Full-width button

#### LanguageSwitcher Component
- **Purpose:** Switch between Turkish and English
- **Features:**
  - Globe icon button
  - Shows current language (TR/EN)
  - Updates URL and content immediately
  - Uses `next-intl` routing

#### Calendar Link Button
- **Purpose:** Navigate to calendar page
- **Features:**
  - Full-width outline button
  - Calendar icon
  - Localized text

**Footer:**
- Source attribution: "Official Qatar Method"
- Link to Aladhan API

### 2. Calendar Page (`app/[locale]/calendar/page.tsx`)

**Layout:**
- Same background as homepage
- Header with title and location badge
- Language switcher (top right)
- Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- 30 cards, one for each Ramadan day

**CalendarDayCard Component:**
- **Collapsed State:**
  - Day number (e.g., "1. Gün" / "Day 1")
  - "Bugün" / "Today" badge if current day
  - Gregorian date (e.g., "Wednesday, 18 February 2026")
  - Hijri date (e.g., "21 Jumādá al-ūlá 1438 AH")
  - Two compact boxes: Sahur time (blue) and Iftar time (gold)
  - ChevronDown icon (expandable indicator)

- **Expanded State (on click):**
  - All 6 prayer times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
  - Each prayer time in colored box with icon:
    - Fajr: Blue (Moon icon)
    - Sunrise: Amber (Sunrise icon)
    - Dhuhr: Yellow (Sun icon)
    - Asr: Orange (Clock icon)
    - Maghrib: Ramadan Gold (Sun icon)
    - Isha: Purple (Moon icon)
  - Dua of the Day section:
    - Title
    - Arabic text (right-aligned, large)
    - Transliteration
    - Translation
  - ChevronUp icon (collapsible indicator)
  - Framer Motion expand/collapse animation

**Visual Design:**
- Today's card: Green border (`border-2 border-ramadan-green`), green gradient background
- Other cards: Slate border, slate gradient background
- Hover effects on non-today cards
- Responsive padding: `p-4 sm:p-5`

### 3. Navigation (`components/Navigation.tsx`)

**Fixed Bottom Navigation Bar:**
- Two items: Home and Calendar
- Icons: Home, Calendar (Lucide React)
- Active state: Green color (`text-ramadan-green`), green gradient background
- Inactive state: Slate color (`text-slate-400`)
- Touch-friendly: `min-h-[44px] min-w-[44px]`
- Safe area inset for iOS notch
- Backdrop blur effect
- Shadow for depth

**Styling:**
- Background: `bg-gradient-to-t from-slate-900/98 via-slate-900/95 to-slate-900/90`
- Border: `border-t border-slate-700/50`
- Padding: `py-2 sm:py-3`
- Icon size: `w-5 h-5 sm:w-6 sm:h-6`
- Text size: `text-[10px] sm:text-xs`

### 4. Push Notifications System

#### Client-Side (`lib/notifications.ts`)

**Functions:**
- `requestNotificationPermission()` - Request browser notification permission
- `subscribeToPush(locale)` - Subscribe to Web Push with VAPID key
- `enableNotifications(locale)` - Enable notifications, store in localStorage and IndexedDB
- `disableNotifications()` - Disable notifications
- `areNotificationsEnabled()` - Check if enabled (localStorage)
- `setNotificationLocale(locale)` - Set notification language (IndexedDB)

**Storage:**
- **localStorage:** `ramadan-notifications-enabled` (boolean string)
- **IndexedDB:** `ramadan-app` database
  - `settings` object store
  - Keys: `notificationsEnabled` (boolean), `notificationLocale` ('tr' | 'en')

#### Service Worker (`app/sw.ts`)

**Caching Strategies:**
- **Aladhan API:** NetworkFirst (cache for offline)
- **Google Fonts:** CacheFirst
- **Static assets (images, fonts, audio, video, JS, CSS):** StaleWhileRevalidate or CacheFirst
- **Next.js data:** StaleWhileRevalidate
- **Same-origin API:** NetworkFirst (10s timeout)

**Background Notifications:**
- Checks every minute for prayer time reminders
- Sends notifications at: 15 min before, 10 min before, 5 min before, and at prayer time
- Uses IndexedDB to check if notifications enabled
- Uses IndexedDB to get notification locale
- Fetches prayer times from `/api/timings?date=YYYY-MM-DD`
- Deduplication: Tracks sent notifications per day to avoid duplicates
- Cleans up old notification keys daily

**Web Push Handler:**
- Listens for `push` events
- Displays notification with title and body from server
- Icon: `/icon-192.png`
- Badge: `/icon-192.png`

**Message Handler:**
- Listens for `NOTIFICATION_SETTINGS_CHANGED` messages from client
- Updates cached notification settings
- Restarts notification checker

#### Server-Side (`app/api/push-subscribe/route.ts`)

**POST `/api/push-subscribe`**
- Receives: `{ subscription: PushSubscriptionJSON, locale?: 'tr' | 'en' }`
- Stores subscription in Upstash Redis
- Key format: `ramadan:push:{encoded-endpoint}`
- TTL: 180 days
- Returns: `{ ok: true }`

#### Cron Job (`app/api/cron/push-reminders/route.ts`)

**GET `/api/cron/push-reminders`**
- Called by external cron service (cron-job.org) every 1-5 minutes
- Authorization: Bearer token (`CRON_SECRET` env var)
- **Test Mode:** `?test=1` - Sends test notification to all subscribers immediately

**Normal Mode:**
1. Gets today's date in Doha timezone (`getDohaDateString()`)
2. Fetches prayer times for today (`getPrayerTimes()`)
3. Calculates reminder windows:
   - 15 min before Fajr/Maghrib
   - 10 min before Fajr/Maghrib
   - 5 min before Fajr/Maghrib
   - At Fajr/Maghrib time
4. Checks if current time is within any reminder window (5-minute window for cron flexibility)
5. Deduplication: Uses Redis key `ramadan:push:sent:{date}:{type}:{minutes}` with 10-minute TTL
6. Fetches all subscriptions from Redis
7. Sends push notification to each subscription with localized message
8. Removes invalid subscriptions (410/404 status)

**Notification Messages:**
- Turkish:
  - Fajr 15 min: "15 dakika kaldı" / "15 dakika sonra Sahur vakti"
  - Fajr 0 min: "Sahur Vakti!" / "Sahur vakti geldi"
  - Maghrib 15 min: "15 dakika kaldı" / "15 dakika sonra İftar vakti"
  - Maghrib 0 min: "İftar Vakti!" / "İftar vakti geldi"
- English:
  - Fajr 15 min: "15 min remaining" / "15 minutes until Suhoor"
  - Fajr 0 min: "Suhoor Time!" / "Suhoor time has started"
  - Maghrib 15 min: "15 min remaining" / "15 minutes until Iftar"
  - Maghrib 0 min: "Iftar Time!" / "Iftar time has started"

### 5. Prayer Times Data (`lib/prayer.ts`)

**Data Source:**
- Primary: Local JSON file (`lib/ramadan-2026-data.json`)
  - Array of 30 objects, one per Ramadan day
  - Format: `{ day: number, date: "YYYY-MM-DD", fajr: "HH:mm", sunrise: "HH:mm", dhuhr: "HH:mm", asr: "HH:mm", maghrib: "HH:mm", isha: "HH:mm" }`
- Fallback: Aladhan API for non-Ramadan dates

**Functions:**
- `getPrayerTimes(date: string)` - Get prayer times for specific date
- `getTodayPrayerTimes()` - Get today's prayer times (Doha timezone)
- `getRamadanPrayerTimes()` - Get all 30 days of Ramadan prayer times
- `getRamadanDay(date?: string)` - Get current Ramadan day number (1-30) or null
- `getDohaDateString(date?: Date)` - Get date string in Doha timezone (YYYY-MM-DD)
- `parseTimeToDate(timeString: string)` - Parse HH:mm to Date (tomorrow if time passed)
- `getTimeRemaining(targetTime: Date)` - Calculate time remaining
- `isBeforeSahur(fajrTime: string)` - Check if before Sahur
- `isFastingTime(fajrTime, maghribTime)` - Check if fasting period
- `isIftarTime(maghribTime)` - Check if Iftar time or after

**Timezone Handling:**
- All dates/times use Doha timezone (`Asia/Doha`, UTC+3)
- `getDohaDateString()` converts any date to Doha date string
- Prayer times are stored as HH:mm strings (Doha local time)

### 6. Dua Data (`lib/duas.ts`)

**Structure:**
- Array of 30 `Dua` objects
- Each dua has `id`, `tr` (Turkish), and `en` (English) properties
- Each language has: `title`, `arabic`, `transliteration`, `translation`

**Functions:**
- `getDuaOfTheDay(locale: 'tr' | 'en')` - Get dua for current Ramadan day
- `getDuaByDay(dayNumber: number, locale: 'tr' | 'en')` - Get dua for specific day

### 7. Countdown Component (`components/Countdown.tsx`)

**Features:**
- Real-time countdown updating every second
- Shows days only if > 0, otherwise shows hours/minutes/seconds
- Two variants: `sahur` (blue theme) and `iftar` (gold theme)
- Each time unit in separate card with Framer Motion animation
- Tabular numbers for consistent width
- Responsive text sizes: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`
- Labels: "Gün" / "Saat" / "Dakika" / "Saniye" (Turkish) or "Days" / "Hours" / "Minutes" / "Seconds" (English)

**Optimization:**
- `useMemo` for target date calculation
- `useCallback` for update function
- Only updates state if values changed (prevents unnecessary re-renders)
- Cleans up interval on unmount

### 8. Styling & Theme

#### Tailwind Config (`tailwind.config.ts`)

**Custom Colors:**
- `ramadan-green`: `#10b981` (Emerald green)
- `ramadan-gold`: `#fbbf24` (Amber gold)
- `ramadan-dark`: `#0f172a` (Slate 950)
- `ramadan-darker`: `#020617` (Slate 950 darker)
- `qatar-maroon`: `#8B1538` (Qatar flag maroon)
- `qatar-maroonLight`: `#A01D42`
- `qatar-maroonDark`: `#6B0F2A`
- `qatar-white`: `#FFFFFF`

**Custom Shadows:**
- `qatar-glow`: `0 0 20px rgba(139, 21, 56, 0.3)`
- `ramadan-glow`: `0 0 20px rgba(16, 185, 129, 0.3)`
- `gold-glow`: `0 0 20px rgba(251, 191, 36, 0.3)`

#### Global Styles (`app/globals.css`)

**CSS Variables:**
- Dark theme colors (HSL format)
- Primary: Ramazan green
- Accent: Qatar maroon
- Border radius: `0.75rem`

**Custom Classes:**
- `.font-arabic` - Arabic font support (Amiri, Noto Sans Arabic)
- `.bg-qatar-gradient` - Qatar-themed gradient background
- `.bg-ramadan-gradient` - Ramadan-themed gradient
- `.bg-luxury-gradient` - Luxury-themed gradient
- `.shadow-ramadan-glow` - Green glow shadow
- `.shadow-qatar-glow` - Maroon glow shadow
- `.shadow-gold-glow` - Gold glow shadow
- `.safe-area-inset-bottom` - iOS safe area support
- `.touch-manipulation` - Touch optimization
- `.tabular-nums` - Tabular numbers for countdown

**Responsive Breakpoints:**
- Mobile: Default (no prefix)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+), `lg:` (1024px+)

### 9. Internationalization (`next-intl`)

**Supported Locales:**
- Turkish (`tr`) - Default
- English (`en`)

**Routing:**
- Turkish: `/` (no prefix)
- English: `/en`
- Locale prefix strategy: `as-needed` (only show prefix for non-default)

**Translation Files:**
- `locales/tr.json` - Turkish translations
- `locales/en.json` - English translations

**Translation Keys:**
- `common.*` - Common strings (appName, location, sahur, iftar, today, calendar, etc.)
- `home.*` - Homepage strings
- `calendar.*` - Calendar page strings
- `notifications.*` - Notification-related strings

**Usage:**
- Server Components: `getTranslations('namespace')`
- Client Components: `useTranslations('namespace')`
- Navigation: `Link`, `useRouter`, `usePathname` from `@/lib/i18n/routing`

### 10. API Routes

#### `/api/timings` (GET)
- Query param: `date` (YYYY-MM-DD, optional, defaults to today)
- Returns: `AladhanResponse` JSON
- Uses `getPrayerTimes()` function
- Cached: 24 hours

#### `/api/push-subscribe` (POST)
- Body: `{ subscription: PushSubscriptionJSON, locale?: 'tr' | 'en' }`
- Stores in Upstash Redis
- Returns: `{ ok: true }` or error

#### `/api/cron/push-reminders` (GET)
- Authorization: Bearer token (`CRON_SECRET`)
- Query param: `?test=1` for test mode
- Sends push notifications to all subscribers
- Returns: `{ ok: true, sent: number }` or error

### 11. PWA Configuration

#### Manifest (`public/manifest.webmanifest`)
- Name: "Ramadan 2026 Doha"
- Short name: "Ramadan 2026"
- Description: "Ramadan 2026 prayer times for Doha, Qatar"
- Start URL: `/`
- Display: `standalone`
- Theme color: `#10b981` (Ramadan green)
- Background color: `#0f172a` (Dark slate)
- Icons: 192x192, 512x512 PNG files

#### Service Worker Registration
- Registered in `app/layout.tsx`
- Uses Serwist for precaching and runtime caching
- Updates automatically on new deployment
- Skip waiting and claim clients immediately

### 12. Environment Variables

**Required:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key for Web Push
- `VAPID_PRIVATE_KEY` - VAPID private key (server-only)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token
- `CRON_SECRET` - Secret token for cron job authorization

**Optional:**
- None

### 13. Build & Deployment

**Build Command:**
```bash
npm run build
```

**Output:**
- Static pages for all routes (SSG)
- Serverless functions for API routes
- Service Worker (`public/sw.js`)
- Optimized assets

**Deployment:**
- Platform: Vercel
- Region: `dub1` (Dubai)
- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`

**Cron Setup:**
- External service: cron-job.org
- URL: `https://your-domain.com/api/cron/push-reminders`
- Schedule: Every 1-5 minutes
- Authorization: Bearer token in header
- Test URL: `https://your-domain.com/api/cron/push-reminders?test=1`

### 14. Component Architecture

**Server Components:**
- `app/[locale]/page.tsx` - Homepage
- `app/[locale]/calendar/page.tsx` - Calendar page
- `app/layout.tsx` - Root layout

**Client Components:**
- `components/PrayerTimeCard.tsx` - Prayer times card
- `components/Countdown.tsx` - Countdown timer
- `components/DuaOfTheDay.tsx` - Dua card
- `components/NotificationButton.tsx` - Notification toggle
- `components/AzanButton.tsx` - Azan player
- `components/CalendarDayCard.tsx` - Calendar day card
- `components/Navigation.tsx` - Bottom navigation
- `components/LanguageSwitcher.tsx` - Language toggle
- `components/ErrorBoundary.tsx` - Error boundary
- `components/ui/card.tsx` - Card component
- `components/ui/button.tsx` - Button component

**Utilities:**
- `lib/prayer.ts` - Prayer times functions
- `lib/duas.ts` - Dua data and functions
- `lib/notifications.ts` - Notification utilities
- `lib/i18n/routing.ts` - i18n routing
- `lib/utils.ts` - Utility functions (cn, etc.)

### 15. Data Flow

**Prayer Times:**
1. User opens app → Server Component fetches `getTodayPrayerTimes()`
2. Function checks local JSON data first
3. If not in Ramadan, falls back to Aladhan API
4. Returns `AladhanResponse` with timings and dates
5. Client Component receives props and displays

**Notifications:**
1. User clicks "Enable Notifications" → Requests permission
2. Permission granted → Subscribes to Web Push (VAPID)
3. Subscription sent to `/api/push-subscribe` → Stored in Redis
4. Cron job runs every 1-5 minutes → Checks reminder windows
5. If window matches → Sends push to all subscribers
6. Service Worker receives push → Displays notification

**Countdown:**
1. `PrayerTimeCard` passes target time to `Countdown` component
2. `Countdown` calculates time remaining every second
3. Updates display with days/hours/minutes/seconds
4. If time passed, shows tomorrow's time

### 16. Mobile App Considerations

**For Rork.com Mobile App Conversion:**

1. **Framework:** Convert Next.js to React Native or Flutter
2. **Navigation:** Use React Navigation (React Native) or Flutter Navigator
3. **State Management:** Consider Zustand or Redux for global state
4. **Push Notifications:** Use native push notification services (FCM for Android, APNs for iOS)
5. **Storage:** Use AsyncStorage (React Native) or SharedPreferences (Flutter) instead of localStorage/IndexedDB
6. **API Calls:** Keep same API structure, use fetch or axios
7. **Styling:** Convert Tailwind classes to StyleSheet (React Native) or Flutter widgets
8. **Animations:** Use React Native Animated API or Flutter animations instead of Framer Motion
9. **PWA Features:** Remove Service Worker, use native background tasks
10. **Icons:** Use react-native-vector-icons or Flutter icon packages
11. **Audio:** Use react-native-sound or Flutter audio packages for Azan playback
12. **Date/Time:** Use date-fns or moment.js (same as web)
13. **Internationalization:** Use react-i18next (React Native) or flutter_localizations (Flutter)

**Key Differences:**
- No Service Worker → Use native background tasks
- No Web Push → Use FCM/APNs
- No localStorage/IndexedDB → Use native storage
- No PWA manifest → Use app.json/app.config.js
- Navigation structure changes → Native navigation patterns
- Styling system changes → Native styling approaches

### 17. Testing Checklist

**Functionality:**
- [ ] Prayer times display correctly for all 30 days
- [ ] Countdown updates every second
- [ ] Status badge changes at correct times
- [ ] Calendar expands/collapses correctly
- [ ] Dua of the day changes daily
- [ ] Language switching works
- [ ] Notifications enable/disable works
- [ ] Push notifications received at correct times
- [ ] Azan audio plays correctly
- [ ] Navigation works between pages
- [ ] Offline mode works (cached data)

**UI/UX:**
- [ ] Responsive on mobile (320px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)
- [ ] Touch targets are at least 44x44px
- [ ] Animations are smooth
- [ ] Colors match theme
- [ ] Text is readable
- [ ] Icons are clear
- [ ] Loading states handled
- [ ] Error states handled

**Performance:**
- [ ] First load < 3 seconds
- [ ] Images optimized
- [ ] Code split properly
- [ ] Service Worker caches correctly
- [ ] No memory leaks
- [ ] Smooth 60fps animations

**Accessibility:**
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images
- [ ] ARIA labels where needed

### 18. File Structure

```
/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx (Homepage)
│   │   └── calendar/
│   │       └── page.tsx (Calendar page)
│   ├── api/
│   │   ├── cron/
│   │   │   └── push-reminders/
│   │   │       └── route.ts
│   │   ├── push-subscribe/
│   │   │   └── route.ts
│   │   └── timings/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── sw.ts (Service Worker)
├── components/
│   ├── ui/
│   │   ├── card.tsx
│   │   └── button.tsx
│   ├── PrayerTimeCard.tsx
│   ├── Countdown.tsx
│   ├── DuaOfTheDay.tsx
│   ├── NotificationButton.tsx
│   ├── AzanButton.tsx
│   ├── CalendarDayCard.tsx
│   ├── Navigation.tsx
│   ├── LanguageSwitcher.tsx
│   └── ErrorBoundary.tsx
├── lib/
│   ├── prayer.ts
│   ├── duas.ts
│   ├── notifications.ts
│   ├── i18n/
│   │   └── routing.ts
│   └── utils.ts
├── locales/
│   ├── tr.json
│   └── en.json
├── public/
│   ├── manifest.webmanifest
│   ├── icon-192.png
│   ├── icon-512.png
│   └── azan.mp3
├── i18n.ts
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── vercel.json
```

### 19. Critical Implementation Details

**Timezone Handling:**
- Always use Doha timezone (`Asia/Doha`, UTC+3) for date calculations
- Use `getDohaDateString()` to get "today" in Doha timezone
- Convert prayer times (HH:mm strings) to Date objects using Doha timezone

**Countdown Logic:**
- If target time has passed today, use tomorrow's time
- Calculate time remaining: `targetDate.getTime() - now.getTime()`
- Show days only if > 0, otherwise show hours/minutes/seconds
- Update every second with `setInterval`

**Status Badge Logic:**
- Compare current time with today's Fajr and Maghrib times
- Use Doha timezone for all comparisons
- "Sahur Öncesi": Before Fajr (midnight to Fajr)
- "Oruçlu": Between Fajr and Maghrib
- "İftar Vakti": After Maghrib (until midnight)

**Notification Timing:**
- Cron job runs every 1-5 minutes
- Check if current time is within 5-minute window of reminder time
- Deduplication: Use Redis key with 10-minute TTL
- Send to all subscribers stored in Redis

**Caching Strategy:**
- Prayer times: Cache for 24 hours (Aladhan API)
- Static assets: Cache forever (with versioning)
- API responses: NetworkFirst (fallback to cache)
- Service Worker: Precaches all pages and assets

**Error Handling:**
- API failures: Fallback to cached data or default values
- Notification permission denied: Show error toast
- Service Worker errors: Log to console, continue gracefully
- Component errors: ErrorBoundary catches and shows fallback UI

### 20. Design Specifications

**Color Palette:**
- Primary Green: `#10b981` (Ramadan green)
- Primary Gold: `#fbbf24` (Ramadan gold)
- Primary Maroon: `#8B1538` (Qatar maroon)
- Background Dark: `#0f172a` (Slate 950)
- Text Light: `#f1f5f9` (Slate 100)
- Text Muted: `#94a3b8` (Slate 400)

**Typography:**
- Headings: Bold, gradient text (green to gold)
- Body: Regular weight, light color
- Arabic: Amiri or Noto Sans Arabic font
- Numbers: Tabular nums for countdown

**Spacing:**
- Mobile: `p-3 sm:p-4`, `gap-2 sm:gap-3`
- Cards: `p-4 sm:p-5`
- Sections: `space-y-3 sm:space-y-4`

**Border Radius:**
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Small elements: `rounded-md` (6px)

**Shadows:**
- Cards: `shadow-xl shadow-black/30`
- Buttons: `shadow-md`
- Glow effects: Custom shadow utilities

**Animations:**
- Fade in: `opacity: 0 → 1`
- Slide up: `y: 20 → 0`
- Scale: `scale: 0.9 → 1`
- Duration: `0.2s - 0.3s`
- Easing: `easeInOut` or `ease`

---

## Summary

This is a complete Progressive Web App for Ramadan 2026 prayer times in Doha, Qatar. It features accurate prayer times, daily duas, live countdown timers, push notifications, bilingual support (Turkish/English), and a beautiful, responsive UI with Qatar-themed design.

The app uses Next.js 15 with React 19, TypeScript, Tailwind CSS, and Framer Motion. It includes a Service Worker for offline support, Web Push notifications via VAPID, and integrates with Upstash Redis for subscription storage and cron-job.org for scheduled notifications.

For mobile app conversion, adapt the web components to native mobile components, replace Service Worker with native background tasks, use FCM/APNs for push notifications, and convert Tailwind classes to native styling systems.
