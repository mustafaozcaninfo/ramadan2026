# Ramadan 2026 Doha - Rork Mobile App Package

This folder contains all necessary files and documentation to create a mobile app version of the Ramadan 2026 Doha PWA using Rork.com.

## 📁 Folder Structure

```
rork/
├── RORK_PROMPT.md          # Complete project specification (use this as prompt)
├── README.md               # This file
├── .env.example            # Environment variables template
├── data/
│   ├── ramadan-2026-data.json  # Prayer times for all 30 days of Ramadan
│   ├── duas.ts            # TypeScript source for duas (reference)
│   └── duas.json          # 30 daily duas in JSON format
├── locales/
│   ├── tr.json            # Turkish translations
│   └── en.json            # English translations
└── assets/                # (Optional) Audio files, icons, etc.
```

## 🚀 Quick Start

1. **Read the Prompt**: Open `RORK_PROMPT.md` and copy its contents to Rork.com
2. **Upload Data Files**: Upload the JSON files from `data/` and `locales/` folders
3. **Configure Environment**: Use `.env.example` as reference for required environment variables

## 📄 Files Description

### RORK_PROMPT.md
Complete project specification with:
- Technical stack details
- All features and components
- API endpoints
- Data structures
- UI/UX specifications
- Mobile app conversion notes

### Data Files

#### ramadan-2026-data.json
Prayer times for all 30 days of Ramadan 2026 (Feb 18 - Mar 19, 2026).
Format:
```json
{
  "day": 1,
  "date": "2026-02-18",
  "fajr": "04:49",
  "sunrise": "06:07",
  "dhuhr": "11:49",
  "asr": "15:05",
  "maghrib": "17:32",
  "isha": "19:02"
}
```

#### duas.json
30 daily duas (prayers) for Ramadan, each with:
- Arabic text
- Transliteration
- Translation (Turkish and English)
- Title

Format:
```json
{
  "id": 1,
  "tr": {
    "title": "Ramazan Giriş Duası",
    "arabic": "...",
    "transliteration": "...",
    "translation": "..."
  },
  "en": {
    "title": "Ramadan Entry Dua",
    "arabic": "...",
    "transliteration": "...",
    "translation": "..."
  }
}
```

### Locale Files

#### tr.json / en.json
Complete translation files for Turkish and English. Contains:
- Common strings (app name, location, buttons, etc.)
- Homepage strings
- Calendar strings
- Notification strings

### Environment Variables (.env.example)

Required for push notifications:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key
- `VAPID_PRIVATE_KEY` - VAPID private key
- `UPSTASH_REDIS_REST_URL` - Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis token
- `CRON_SECRET` - Cron job authorization token

## 📱 Mobile App Conversion Notes

When converting to mobile app:

1. **Framework**: Use React Native or Flutter
2. **Navigation**: Native navigation (React Navigation / Flutter Navigator)
3. **Push Notifications**: Use FCM (Android) and APNs (iOS) instead of Web Push
4. **Storage**: Use AsyncStorage (RN) or SharedPreferences (Flutter) instead of localStorage/IndexedDB
5. **Styling**: Convert Tailwind classes to native StyleSheet/Widgets
6. **Animations**: Use native animation APIs
7. **Audio**: Use native audio players for Azan playback

## 🔑 Key Features to Implement

1. **Prayer Times Display**: Today's Sahur and Iftar with countdown
2. **Status Badge**: Shows current status (Before Suhoor / Fasting / Iftar Time)
3. **Calendar**: 30-day Ramadan calendar with expandable day cards
4. **Dua of the Day**: Daily dua display with Arabic, transliteration, and translation
5. **Push Notifications**: Reminders at 15/10/5/0 minutes before prayer times
6. **Language Switching**: Turkish/English toggle
7. **Azan Player**: Manual audio playback button
8. **Offline Support**: Cache prayer times and duas locally

## 📊 Data Usage

- **Prayer Times**: Use `ramadan-2026-data.json` for accurate Qatar Official Method times
- **Duas**: Use `duas.json` - get dua by day number (1-30)
- **Translations**: Use `tr.json` and `en.json` for all UI text

## 🎨 Design Specifications

See `RORK_PROMPT.md` section 20 for complete design specs:
- Colors: Ramadan green (#10b981), Gold (#fbbf24), Qatar maroon (#8B1538)
- Typography: Arabic font support required
- Spacing: Responsive (mobile-first)
- Animations: Smooth fade/slide transitions

## ✅ Testing Checklist

See `RORK_PROMPT.md` section 17 for complete testing checklist.

## 📞 Support

Refer to `RORK_PROMPT.md` for detailed implementation guidance. All technical details, API endpoints, component structures, and data flows are documented there.
