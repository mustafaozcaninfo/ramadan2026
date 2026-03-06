## Ramadan 2026 Doha – Özellikler ve Mimari Özeti

Bu doküman, **Ramadan 2026 Doha – İftar & Sahur** uygulamasının sunduğu tüm özellikleri ve altında yatan altyapıyı **A’dan Z’ye** özetler. Hem son kullanıcı deneyimini hem de teknik mimariyi (Next.js, PWA, Web Push, veri akışı vb.) tek bir yerde toplar.

---

## 1. Genel Bakış

- **Amaç**: Doha, Katar için resmi metoda (Aladhan Method 10 – Qatar Official) göre Ramazan 2026 boyunca sahur ve iftar vakitlerini, geri sayımı ve hatırlatıcıları sunan modern bir PWA.
- **Hedef Platformlar**: Mobil (iOS/Android tarayıcı + PWA), masaüstü modern tarayıcılar.
- **Modlar**:
  - Online kullanım (API + local JSON)
  - Offline kullanım (local JSON + cache)
  - Arka plan bildirimli kullanım (Web Push + cron)

---

## 2. Kullanıcıya Sunulan Özellikler

### 2.1. Ana Sayfa (Home)

Ana sayfa `app/[locale]/page.tsx`:

- **Bugünün tarihi ve Ramazan günü**:
  - Gregorien tarih, gün adı ve yıl; seçili dile göre (`tr` / `en`) formatlanır.
  - Hijri tarih, Aladhan API veya fallback hesaplama ile gösterilir.
  - Mevcut gün Ramazan içindeyse **“Ramazan X. Gün”** etiketi.
- **Namaz vakit kartı** (`PrayerTimeCard`):
  - Sahur (Fajr) ve İftar (Maghrib) saatleri.
  - Güneş doğuşu (Sunrise).
  - Bugün ve **bir sonraki günün** sahur/iftar saatleri.
  - Dinamik sıralama: Sıradaki vakit (sahur veya iftar) öne alınır.
  - Durum rozetleri:
    - **Sahur Öncesi / Before Suhoor**
    - **Oruçlu / Fasting**
    - **İftar Vakti / Iftar Time**
  - Gün içinde ne kadar süredir oruç tutulduğunu gösteren metin (saat/dakika bazlı).
- **Canlı geri sayım** (`Countdown`):
  - Sahur ve iftar için ayrı geri sayımlar.
  - Saniye bazında güncellenir, gereksiz re-render’lar azaltılmıştır (memoization).
  - 0’a indiğinde ekran okuyucuya uygun “Süre doldu!” / “Time is up!” anonsu.
- **Günün duası** (`DuaOfTheDay`):
  - Gün numarasına göre dua seçimi (lokal veri setinden).
  - Türkçe/İngilizce metin desteği.
- **Ezan butonu** (`AzanButton`):
  - `azan.mp3` ses dosyası üzerinden ezan sesi çalabilme.
- **Takvime git butonu**:
  - `Calendar` ikonlu buton ile `/calendar` sayfasına yönlendirme.
- **Aladhan kaynak bilgisi**:
  - Alt kısımda “Official Qatar Method” badge’i ve `aladhan.com` bağlantısı.
- **Navigasyon**:
  - Alt tarafta `Navigation` component’i ile ana sekmeler (Home, Calendar, Settings, About, Live vs.).
  - Üstte `MenuButton` ile açılan menü/drawer (örneğin canlı yayın, test sayfası, hakkında vb. linkler).

### 2.2. Ramazan Takvimi Sayfası

Takvim sayfası `app/[locale]/calendar/page.tsx` ve `CalendarPageClient`:

- **30 günlük Ramazan takvimi**:
  - 18 Şubat – 18 Mart 2026 tarihleri için:
    - Sahur (Fajr)
    - Güneş doğuşu (Sunrise)
    - Öğle (Dhuhr)
    - İkindi (Asr)
    - İftar (Maghrib)
    - Yatsı (Isha)
- **Günlük kartlar** (`CalendarDayCard`):
  - Her gün için ayrı kart yapısı.
  - Bugünkü gün otomatik vurgulanır (background/çerçeve).
- **Scroll to Today** (`ScrollToToday`):
  - Liste uzun olduğunda otomatik olarak bugüne kaydırma.
- **Dil değiştirme**:
  - Sağ üstte `LanguageSwitcher`.
- **Hata durumu**:
  - Veri alınamazsa kullanıcı dostu hata mesajı ve "Yeniden Dene / Retry" butonu.
- **Kaynak bilgisi**:
  - Alt kısımda Aladhan API bağlantısı ve “Official Qatar Method” badge’i.

### 2.3. Canlı Yayın (Live TV)

Canlı yayın sayfası `app/[locale]/live/page.tsx` ve `LivePlayer`:

- **Katar TV kanalları**:
  - `qtv1` ve `qtv2` için HLS adresleri:
    - `https://qatartv.akamaized.net/hls/live/2026573/qtv1/master.m3u8`
    - `https://qatartv.akamaized.net/hls/live/2026574/qtv2/master.m3u8`
- **Kanal seçici**:
  - Her kanal için:
    - Lokalize isim (örn. “Qatar TV 1”) – `live.channel1` / `live.channel2`.
    - Arapça kanal adı.
  - Seçili kanal belirgin görsel durumla işaretlenir (gradient, border, pulsing nokta).
- **Video oynatıcı** (`LivePlayer`):
  - `hls.js` ile HLS stream oynatma.
  - İlgili kanal adı ve locale bilgisi.
- **Kaynak notu**:
  - `qtv.qa` linkiyle “source note”.
- **Navigasyon**:
  - Geri butonu ve alttaki global `Navigation` ile ana sayfaya dönüş.

### 2.4. Ayarlar Sayfası

`app/[locale]/settings/page.tsx` + `SettingsPageClient`:

- **Dil ayarı**:
  - `LanguageSwitcher` ile TR/EN arasında geçiş.
  - `next-intl` ile tam i18n desteği.
- **Bildirim ayarı**:
  - `NotificationButton` üzerinden:
    - Tarayıcı bildirim iznini yönetme.
    - Uygulama içi ve Web Push bildirimlerinin açılıp kapatılması.
- **Kart tabanlı UI**:
  - Her ayar bölümü için ayrı kartlar (ikon, başlık, açıklama).
  - Framer Motion ile animasyonlu girişler.

### 2.5. Hakkında Sayfası

`app/[locale]/about/page.tsx` + `AboutPageClient`:

- Uygulamanın amacı, kullanılan yöntem, veri kaynağı gibi açıklayıcı metinler.
- TR/EN lokalize içerik (`locales/*.json`).
- Aynı arka plan efektleri ve `Navigation` ile tutarlı tasarım.

### 2.6. Bildirimler ve Hatırlatıcılar

Kullanıcıya yönelik bildirim özellikleri:

- **Tarayıcı Bildirimleri**:
  - Sahur ve iftar için **15, 10, 5 dakika ve tam zamanda** uyarılar.
  - `NotificationButton` üzerinden açılıp kapatılabilir.
  - İzin durumu `Notification.permission` ve localStorage ile yönetilir.
- **Safari/iOS için canlı zamanlayıcı** (`NotificationManager`):
  - iOS ve Safari’nin Service Worker kısıtları nedeniyle:
    - Uygulama açıkken zamanlayıcılar `setTimeout` ile planlanır.
    - Günlük olarak `/api/timings` endpoint’i çağrılarak o günün Fajr/Maghrib saatleri alınır.
    - Her vakit için 15/10/5/0 dakikalık hatırlatıcılar lokal olarak planlanır.
- **Arka plan Web Push bildirimleri**:
  - PWA + destekleyen tarayıcılar için:
    - `subscribeToPush` ile `PushSubscription` alınıp `/api/push-subscribe` endpoint’ine gönderilir.
    - Sunucu tarafında Upstash Redis’e (`ramadan:push:*`) kayıt edilir.
    - Vercel Cron işleyicisi `/api/cron/push-reminders` route’unu periyodik olarak tetikler.
    - Belirli pencere (15/10/5/0 dk) içinde doğru vakit bulunduğunda Web Push mesajları gönderilir.

### 2.7. Dil ve Yerelleştirme

- Desteklenen diller: **Türkçe (`tr`)** ve **İngilizce (`en`)**.
- Locale mantığı:
  - Varsayılan locale `tr`.
  - `as-needed` prefix stratejisi:
    - `tr` için `/` gibi çıplak path’ler.
    - `en` için `/en/...` gibi prefix’li path’ler.
- `LanguageSwitcher`:
  - Kullanıcıya diller arasında hızlı geçiş sunar.
  - URL’yi ve içerik dilini senkronize şekilde günceller.

### 2.8. PWA ve Tema

- **PWA özellikleri**:
  - `manifest.json` + `manifest.ts` tanımı.
  - `@serwist/next` ile Service Worker entegrasyonu.
  - `sw.ts` ve `sw-register` ile offline ve önbellekleme.
- **Tema / UI**:
  - Tailwind CSS v4 ve shadcn/ui bileşenleri.
  - Ramazan temalı gradient’ler:
    - **Yeşil** (`#10b981`) ve **altın** (`#fbbf24`) ana renk paleti.
  - Mobil-first tasarım, safe area desteği, dokunmatik alan optimizasyonu.

### 2.9. Erişilebilirlik ve UX

- Semantic HTML ve ARIA:
  - Countdown ve timer bileşenlerinde `role="timer"` kullanımı.
  - Erişilebilir metinler, küçük ekranlarda dahi okunabilir tipografi.
- Klavye ile gezilebilir navigasyon.
- Kontrastlı tema ve okunabilir font boyutları.

---

## 3. Altyapı ve Mimari

### 3.1. Teknoloji Yığını

- **Frontend & SSR**: Next.js **15.2+** (App Router, React 19, Turbopack).
- **Dil**: TypeScript (strict).
- **Stil**: Tailwind CSS v4 + shadcn/ui v2.
- **Uluslararasılaştırma**: `next-intl` + custom routing.
- **State Yönetimi**: `zustand` (ör. ayarlar, bildirim durumu gibi client state’ler için).
- **Animasyonlar**: `framer-motion`.
- **Tarih/Zaman**: `date-fns`, `date-fns-tz`.
- **PWA & SW**: `@serwist/next`, `serwist`.
- **Bildirim ve Queue**:
  - Web Push: `web-push`.
  - Queue/Depolama: `@upstash/redis`.
- **Form & Validation**:
  - `react-hook-form`, `zod`, `@hookform/resolvers`.

### 3.2. Uygulama Yapısı (App Router)

- Ana dizinler:
  - `app/[locale]/...` – tüm sayfalar locale segmenti altında.
  - `app/api/...` – API route’ları (JSON response).
  - `components/...` – UI ve mantık bileşenleri.
  - `lib/...` – iş mantığı, veri katmanı, yardımcı fonksiyonlar.
  - `locales/en.json` ve `locales/tr.json` – i18n string’leri.
- Örnek sayfalar:
  - `/[locale]/` → Ana sayfa.
  - `/[locale]/calendar` → Takvim.
  - `/[locale]/settings` → Ayarlar.
  - `/[locale]/about` → Hakkında.
  - `/[locale]/live` → Canlı yayın.

### 3.3. Namaz Vakitleri Veri Akışı

`lib/prayer.ts` etrafında kurgulanan veri akışı:

- **Ana veri kaynağı (Ramazan için)**:
  - `lib/ramadan-2026-data.json`:
    - PDF’ten çıkarılmış 30 günlük resmi Doha takvimi.
    - Her gün için `day`, `date` (`YYYY-MM-DD`), `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`.
- **Fonksiyonlar**:
  - `getPrayerTimes(date: string)`:
    - Önce local JSON’da eşleşen tarihi arar.
    - Bulursa bu veriyi **AladhanResponse** formatına dönüştürür.
    - Bulamazsa Aladhan API’ye istek atar (revalidate ayarlı, cache’li).
    - Hijri tarihi almak için ek bir API isteği yapar; başarısız olursa **Ramazan 1447** için yaklaşık bir Hijri tarih hesaplar.
  - `getTodayPrayerTimes()`:
    - Doha timezone’unda bugünün tarihini (`getDohaDateString`) alır.
    - Önce local Ramadan verisinde bugünü, yoksa yarını arar.
    - Bulunursa local veriyi, aksi halde Aladhan API’yi kullanır.
  - `getRamadanPrayerTimes()`:
    - 30 günün tamamı için local JSON verisinden `getPrayerTimes` çağrıları.
  - Yardımcılar:
    - `parseTimeToDate`, `getTimeRemaining`, `formatTimeRemaining`.
    - `isBeforeSahur`, `isFastingTime`, `isIftarTime`.
    - `getDohaDateString` (Asia/Doha time zone).
    - `getRamadanDay` (Ramazan günü [1–30] veya `null`).

### 3.4. Bildirim Altyapısı (Derinlemesine)

#### 3.4.1. Tarayıcı Tarafı

- `lib/notifications.ts`:
  - `requestNotificationPermission` – Notification API iznini yönetir.
  - `showNotification` – Permission `granted` ise bildirim açar.
  - `scheduleNotification` – Belirli bir hedef zamandan 15/10/5/0 dakika öncesi için local `setTimeout`’lar kurar.
  - `areNotificationsEnabled` – localStorage flag’i.
  - `enableNotifications` / `disableNotifications`:
    - localStorage güncellemesi.
    - IndexedDB’de `settings` store’una yazma (SW ile senkron).
    - Service Worker’a `postMessage` ile haber gönderir.
  - `setNotificationLocale`:
    - Bildirim dili (`tr` / `en`) IndexedDB’ye yazılır.
    - SW’ye locale değişikliği mesajı gönderilir.
  - `subscribeToPush`:
    - Service Worker üzerinden `PushManager.subscribe`.
    - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ile VAPID anahtarı.
    - `/api/push-subscribe` endpoint’ine subscription + locale gönderimi.

- `NotificationManager` component’i:
  - Sadece **Safari/iOS ve standalone PWA** gibi durumları tespit eder (`isSafariOrIOS`).
  - Uygulama açıkken günde birden fazla defa `/api/timings` çağırır.
  - Aynı gün için Fajr/Maghrib için 15/10/5/0 dakika önceli hatırlatıcıları lokal `setTimeout`’lar ile oluşturur.
  - Interval ve timeout temizliği ile memory leak’leri engeller.

#### 3.4.2. Backend (Web Push + Cron)

- `/api/push-subscribe`:
  - Body: `{ subscription: PushSubscriptionJSON, locale?: 'tr' | 'en' }`.
  - Upstash Redis’e `ramadan:push:<endpoint>` key’i ile (180 gün TTL) kayıt yapar.
- `/api/cron/push-reminders`:
  - Vercel Cron ya da dış cron servisinden çağrılır.
  - `CRON_SECRET` header kontrolü (opsiyonel) ile basit yetkilendirme.
  - VAPID public/private anahtarları ile `web-push` konfigürasyonu.
  - `isTest` parametresi (`?test=1`) ile tüm abonelere anında test bildirimi gönderebilme.
  - Günün Fajr ve Maghrib saatlerini `getPrayerTimes(dohaDate)` ile alır.
  - Şu anki UTC zamanını Fajr/Maghrib’e göre 15/10/5/0 dk penceresi içinde kontrol eder (`dohaTimeToUtc`).
  - Aynı slot (gün + vakit + dakika) için `ramadan:push:sent:<date>:<type>:<minutes>` key’i ile deduplikasyon (10 dk TTL).
  - Tüm aboneleri gezerek ilgili locale’de `PAYLOADS` içeriği ile push gönderir.
  - 410/404 dönen subscription’ları Redis’ten temizler.

### 3.5. PWA, Service Worker ve Cache

- `@serwist/next` ve `serwist` ile:
  - App Router destekli Service Worker entegrasyonu.
  - Static asset, HTML ve API responses için cache stratejileri.
- `app/sw.ts` ve `app/[locale]/sw-register.tsx`:
  - Service Worker kaydı ve güncellemelerinin yönetimi.
- `app/manifest.json` / `app/manifest.ts`:
  - Uygulama adı, kısa adı, tema rengi, ikon seti.
- `public/` içeriği:
  - `icon.svg`, `icon-192.png`, `icon-512.png` (PWA ikonları).
  - Test sayfaları: `quick-test.html`, `test-notification.html`.

### 3.6. Uluslararasılaştırma (i18n) Altyapısı

- `lib/i18n/routing.ts`:
  - `defineRouting` ile locales: `['tr', 'en']`, `defaultLocale: 'tr'`.
  - `localePrefix: 'as-needed'`.
  - `Link`, `redirect`, `usePathname`, `useRouter` sarmalayıcıları.
- `i18n.ts`:
  - `getRequestConfig` ile request’e göre locale seçimi.
  - `./locales/${locale}.json` dosyalarından çeviri mesajlarını yükler.
- `middleware.ts`:
  - `createMiddleware(routing)` ile i18n-aware middleware.
  - `matcher` ile:
    - `/`, `/calendar`, `/settings`, `/about`, `/test`, `/live`.
    - `/(tr|en)/:path*` pattern’leri.

### 3.7. Güvenlik ve Konfigürasyon

- **Environment Değişkenleri**:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` – client tarafı VAPID public key.
  - `VAPID_PRIVATE_KEY` – server tarafı private key (Web Push).
  - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` – Redis erişimi.
  - `CRON_SECRET` – cron endpoint’i için basit Bearer auth.
- **API Validasyon ve Hata Yönetimi**:
  - `/api/timings`:
    - `YYYY-MM-DD` regex ile tarih validasyonu.
    - Hatalı formatta 400 döner.
    - İç hata durumunda 500 + log.
  - Push endpoint’lerinde subscription shape kontrolü (`endpoint`, `keys.p256dh`, `keys.auth`).
- **CORS / Güvenlik Notları**:
  - Uygulama tipik olarak Vercel üzerinde host edilir, harici domain’ler sadece Aladhan API ve QTV HLS endpoint’leridir.

### 3.8. Deployment ve Çalışma Ortamı

- **Scripts** (`package.json`):
  - `npm run dev` – Next dev (Turbopack).
  - `npm run build` – Production build.
  - `npm start` – Production server.
  - `npm run lint` – ESLint.
  - `npm run generate-vapid` – Web Push için VAPID anahtar üretimi (`scripts/generate-vapid.js`).
- **Önerilen hosting**:
  - Vercel (Next.js için).
  - Web Push cron’u için:
    - Vercel Cron Jobs veya harici bir cron servisi (örn. cron-job.org) ile `/api/cron/push-reminders` endpoint’inin periyodik tetiklenmesi.
- **Ücretsiz mimari**:
  - Vercel Hobby + Upstash Redis free tier + harici ücretsiz cron ile tamamen ücretsiz arka plan bildirim yapısı.

---

## 4. Önemli Kullanım Akışları (User Flows)

### 4.1. Günlük Normal Kullanım

1. Kullanıcı uygulamayı açar (tarayıcı veya PWA).
2. `getTodayPrayerTimes` ile bugünün (ve gerekiyorsa yarının) vakitleri okunur.
3. Ana sayfada:
   - Günün tarihi, Ramazan günü, Hijri tarih gösterilir.
   - Sahur/iftar kartları ve geri sayımlar çalışır.
   - Durum rozetleri (oruçlu/iftar/sahur öncesi) doğru şekilde görünür.
4. Kullanıcı isterse:
   - Günün duasını okur.
   - Ezan butonuyla ezan sesini dinler.
   - Takvim veya canlı yayın sayfalarına geçer.

### 4.2. Offline Kullanım

1. Kullanıcı önceden siteyi açmıştır; dosyalar Service Worker tarafından cache’lenmiştir.
2. İnternet bağlantısı olmasa bile:
   - UI ve stylesheet’ler cache’den gelir.
   - Ramazan içindeyse local JSON’dan vakitler gösterilir.
   - Countdown client-side saat bilgisini kullanarak çalışır.
3. Web Push cron ve push-subscribe gibi özellikler internet olmadan çalışmaz; fakat mevcut bildirim izin durumu ve ayarlar localStorage/IndexedDB’den okunur.

### 4.3. Arka Plan Web Push Bildirimleri

1. Kullanıcı bildirimleri açar (Settings → Notifications).
2. Tarayıcı izin verir, SW kaydolur, `subscribeToPush` çağrılır.
3. Subscription bilgisi `/api/push-subscribe` üzerinden Redis’e kaydedilir.
4. Vercel Cron belirli aralıklarla `/api/cron/push-reminders` endpoint’ini çağırır.
5. Endpoint:
   - Bugünün Fajr ve Maghrib saatlerini alır.
   - Şu anın hangi zaman penceresinde olduğunu hesaplar (15/10/5/0 dk).
   - İlgili locale için başlık/gövde metinlerini üretir.
   - Tüm abonelere push gönderir; bozuk subscription’ları temizler.

### 4.4. Safari / iOS Bildirim Akışı (Uygulama Açıkken)

1. Kullanıcı PWA’yı ana ekrana ekler ve açar.
2. Bildirim izni verilip Notification Manager aktif ise:
   - Uygulama açıkken `/api/timings` çağrısıyla o günün vakitleri alınır.
   - Fajr ve Maghrib için 15/10/5/0 dakikalık local timeouts kurulur.
3. Uygulama açık kaldığı sürece zamanlayıcılar tetiklenir ve bildirimler gösterilir.

---

## 5. Gelecek İyileştirmeler için Başlangıç Notları

Bu bölüm, ileride üzerinde çalışılabilecek geliştirme fikirleri için bir taslaktır; detaylandırma ve önceliklendirme daha sonra yapılabilir.

- **Ek şehir/ülke desteği**:
  - Sadece Doha yerine kullanıcıya şehir seçimi sunmak.
  - Local JSON yerine dinamik Aladhan API veya ayrı veri setleri.
- **Gelişmiş takvim görünümü**:
  - Haftalık/aylık filtreler, favori günler, not ekleme vb.
- **Kişiselleştirme**:
  - Kullanıcıya özel hatırlatıcı aralıkları (sadece 10 dk, sadece 0 dk vb.).
  - Tema ayarları (daha koyu/açık varyantlar).
- **Ek içerikler**:
  - Günlük hatimler, tesbihat listeleri, Ramazan rehberi.
- **Gelişmiş analitik ve gözlem**:
  - Hangi bildirimlerin daha çok kullanıldığı.
  - Hangi sayfanın daha çok ziyaret edildiği (anonim analytics ile).

Bu doküman, mevcut durumu ve altyapıyı tam fotoğraf olarak vermek üzere yazıldı; sonraki adımda bu başlıklar üzerinden tek tek iyileştirme ve yeni özellik tasarımlarına geçebiliriz.

