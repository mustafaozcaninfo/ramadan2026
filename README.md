# Ramadan 2026 Doha - İftar & Sahur App

Modern, PWA destekli Ramazan takvimi uygulaması. Doha, Qatar için özel olarak tasarlandı.

## 🚀 Teknolojiler

- **Next.js 15.2+** (App Router, React 19, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** + **shadcn/ui v2**
- **next-intl** (i18n - Türkçe/İngilizce)
- **@serwist/next** (PWA - Service Worker)
- **Aladhan API** (Qatar Official Method - Method 10)
- **date-fns** + **date-fns-tz** (tarih işlemleri)
- **Framer Motion** (animasyonlar)
- **Zustand** (state management)
- **Sonner** (toast notifications)

## ✨ Özellikler

- ✅ **Canlı Geri Sayım** - Sahur ve İftar için saniyelik geri sayım
- ✅ **Tam Ramazan Takvimi** - 18 Şubat - 18 Mart 2026 (30 gün)
- ✅ **Browser Bildirimleri** - Sahur/İftar öncesi 15, 10, 5 dakika ve tam zamanında hatırlatıcılar
- ✅ **PWA Desteği** - Offline çalışır, "Add to Home Screen" desteği
- ✅ **Çift Dil Desteği** - Türkçe ve İngilizce
- ✅ **Dark Mode** - Ramazan temalı (yeşil #10b981, altın #fbbf24)
- ✅ **Günün Duası** - Her gün farklı dua (10 farklı dua koleksiyonu)
- ✅ **Azan Butonu** - Ezan sesi çalma özelliği
- ✅ **Hijri Takvim** - Hem Gregoryen hem de Hicri tarih gösterimi
- ✅ **Responsive Tasarım** - Mobile-first, tablet ve desktop uyumlu

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Production sunucusunu başlat
npm start
```

## 🎨 Gerekli Asset'ler

Aşağıdaki dosyaları `/public` klasörüne eklemeniz gerekiyor:

1. **icon-192.png** - 192x192px PWA ikonu
2. **icon-512.png** - 512x512px PWA ikonu
3. **azan.mp3** - Ezan ses dosyası

Detaylar için `public/README-ASSETS.md` dosyasına bakın.

## 🌍 Dil Desteği

Uygulama varsayılan olarak Türkçe açılır. Sağ üstteki dil değiştirme butonu ile İngilizce'ye geçebilirsiniz.

## 📱 PWA Kurulumu

1. Tarayıcıda uygulamayı açın
2. "Add to Home Screen" veya "Install App" seçeneğini seçin
3. Uygulama ana ekranınıza eklenecektir

## 🔔 Bildirimler

İlk kullanımda bildirim izni istenecektir. Bildirimleri açtıktan sonra:
- Sahur öncesi 15, 10, 5 dakika ve tam zamanında hatırlatıcı alırsınız
- İftar öncesi 15, 10, 5 dakika ve tam zamanında hatırlatıcı alırsınız

### Arka plan bildirimleri (iOS / Web Push – ücretsiz)

iPhone’da “Ana Ekrana Ekle” ile PWA kullanıyorsanız veya Chrome’da arka planda hatırlatıcı almak istiyorsanız, sunucu tarafında Web Push kurulumu gerekir. **Ücretsiz** (Vercel Hobby + Upstash Redis + cron-job.org) tam kurulum adımları:

👉 **[docs/PUSH_SETUP.md](docs/PUSH_SETUP.md)** – Adım adım teslim rehberi (kopyala-yapıştır, checklist, sorun giderme)

## 📅 Ramazan Takvimi

Takvim sayfasında:
- 30 günlük tam Ramazan takvimi
- Her gün için Sahur, İftar, Güneş Doğuşu ve İmsak saatleri
- Bugünkü gün otomatik olarak vurgulanır
- Hem Gregoryen hem de Hicri tarih gösterimi

## 🎯 API Kullanımı

Uygulama Aladhan API'sini kullanır:
- **Method**: 10 (Qatar Official Method)
- **City**: Doha
- **Country**: Qatar
- **Endpoint**: `https://api.aladhan.com/v1/timingsByCity`

API route: `/api/timings?date=YYYY-MM-DD`

## 🚀 Deployment

### Vercel

1. GitHub'a push edin
2. Vercel'e import edin
3. Otomatik deploy olacaktır

Veya:

```bash
vercel deploy
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Kaynaklar

- **Aladhan API**: https://aladhan.com
- **Next.js**: https://nextjs.org
- **shadcn/ui**: https://ui.shadcn.com
- **Serwist**: https://serwist.pages.dev

## 📞 Destek

Sorularınız için issue açabilirsiniz.

---

**Ramadan Mubarak! 🌙**
