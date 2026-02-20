# Arka Plan Bildirimleri – Ücretsiz Kurulum (Teslim Rehberi)

Bu rehberi sırayla uygulayarak **hiç ücret ödemeden** iOS (Ana Ekrana Ekle) ve Chrome’da arka planda Sahur/İftar hatırlatıcılarını açabilirsiniz.

**Gerekenler:** Vercel Hobby (ücretsiz), Upstash ücretsiz Redis, cron-job.org ücretsiz hesap.  
**Süre:** Yaklaşık 10 dakika.

---

## Checklist

- [ ] 1. Projede `npm run generate-vapid` çalıştırıp 3 değeri kopyaladım
- [ ] 2. Upstash’te ücretsiz Redis oluşturup URL ve Token aldım
- [ ] 3. Vercel’de 5 ortam değişkenini ekledim ve redeploy yaptım
- [ ] 4. cron-job.org’da dakikada bir tetikleyen cron job oluşturdum
- [ ] 5. iOS’ta siteyi Ana Ekrana Ekleyip bildirimleri açtım ve test ettim

---

## 1. VAPID ve CRON_SECRET üret

Proje klasöründe terminalde:

```bash
npm run generate-vapid
```

Çıktıda şuna benzer 3 satır olacak:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKBB-...
VAPID_PRIVATE_KEY=kbQq...
CRON_SECRET=f4d38366...
```

Bu **3 satırın tamamını** kopyala (ileride Vercel’e yapıştıracaksın). CRON_SECRET’ı da güvenli bir yerde sakla; 4. adımda cron-job.org’da kullanacaksın.

---

## 2. Upstash Redis (ücretsiz)

1. Tarayıcıda **https://console.upstash.com** aç.
2. Giriş yap veya ücretsiz hesap oluştur.
3. **Create Database** → İsim ver (örn. `ramadan-push`) → **Region** seç (örn. EU) → **Create**.
4. Oluşan veritabanına tıkla. **REST API** bölümünde:
   - **UPSTASH_REDIS_REST_URL** (örn. `https://xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (uzun token)

Bu **iki değeri** kopyala; 3. adımda Vercel’e ekleyeceksin.

---

## 3. Vercel ortam değişkenleri

1. **https://vercel.com** → Projeyi seç → **Settings** → **Environment Variables**.
2. Aşağıdaki **5 değişkeni** tek tek ekle. Her biri için **Key** ve **Value** doldur, **Production** (ve istersen Preview) işaretle, **Save**.

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 1. adımda kopyaladığın `NEXT_PUBLIC_VAPID_PUBLIC_KEY=` satırındaki değer (eşittir sonrası) |
| `VAPID_PRIVATE_KEY` | 1. adımda kopyaladığın `VAPID_PRIVATE_KEY=` satırındaki değer |
| `CRON_SECRET` | 1. adımda kopyaladığın `CRON_SECRET=` satırındaki değer |
| `UPSTASH_REDIS_REST_URL` | 2. adımda Upstash’ten kopyaladığın URL |
| `UPSTASH_REDIS_REST_TOKEN` | 2. adımda Upstash’ten kopyaladığın token |

3. **Deployments** sekmesine git → son deployment’ın yanındaki **⋯** → **Redeploy** ile bir kez yeniden deploy et (yeni env’lerin yüklenmesi için).

---

## 4. cron-job.org ile dakikada bir tetikleme (ücretsiz)

Vercel Hobby’de cron günde 1 kez çalıştığı için, dakikada bir tetiklemeyi **cron-job.org** ile yapıyoruz.

1. **https://cron-job.org** aç → ücretsiz hesap oluştur / giriş yap.
2. **Cronjobs** → **Create cronjob**.
3. Aşağıdaki gibi doldur:

   - **Title:** `Ramadan push reminders` (istersen başka isim)
   - **URL:**  
     `https://SITENIZ.vercel.app/api/cron/push-reminders`  
     (SITENIZ yerine kendi Vercel domain’inizi yazın, örn. `ramadan-2026-doha-xxx`.)
   - **Schedule:** **Every minute** (veya cron ifadesi `* * * * *`).
   - **Request Method:** **GET**.

4. **Request headers** ekle (Authorization için):
   - **Advanced** / **Request options** / **Headers** gibi bir bölüm ara.
   - Header ekle:
     - **Name:** `Authorization`
     - **Value:** `Bearer BURAYA_CRON_SECRET_YAPISTIR`  
       (1. adımda ürettiğin CRON_SECRET değerini buraya yapıştır; `Bearer ` ile arasında bir boşluk olmalı.)

5. **Create** / **Save** ile kaydet.

Bundan sonra cron-job.org bu URL’yi `Authorization: Bearer <CRON_SECRET>` ile çağıracak; API 15/10/5/0. dakika ve vakit anında bildirim gönderecek.

**Limitler:** cron-job.org ücretsiz planda saatte en fazla 60 istek (dakikada bir = günde 1440). Günlük üst limit yok; 30 gün Ramazan boyunca yeter. Daha az tetikleme istersen Schedule’ı **Every 5 minutes** yap; API aynı bildirimleri 5 dk pencerede bir kez gönderir (günde ~288 istek).

---

## 5. Kullanıcı tarafı (iOS / PWA)

- **iOS:** Safari’de siteyi aç → **Paylaş** → **Ana Ekrana Ekle** → Uygulama ikonundan aç (PWA). Sitede **Hatırlatıcıları Aç** de → bildirim izni ver. iOS 16.4+ ile arka planda da bildirim gelir.
- **Chrome/Android:** Sitede bildirimleri açmanız yeterli; arka planda çalışır.

---

## Test

- Vercel deploy’dan sonra tarayıcıda:  
  `https://SITENIZ.vercel.app/api/cron/push-reminders`  
  açarsanız **401 Unauthorized** görmelisiniz (header olmadan çağrı reddedilir). Bu, endpoint’in ayakta olduğu anlamına gelir.
- cron-job.org’da job’ı kaydettikten sonra **Execute now** ile bir kez manuel tetikleyebilirsiniz. Log’da 200 ve `{"ok":true,"sent":0}` veya `"sent":1` gibi bir yanıt görürseniz cron tarafı çalışıyor demektir.
- **Anında test:** URL'ye `?test=1` ekleyip CRON_SECRET header ile istek atarsanız tüm abonelere test bildirimi gider (vakit beklemeden). Test bitince `?test=1` kaldırın. Normal çalışmada bildirimler 15/10/5/0. dakika ve vakit anında gider.

---

## Sorun giderme

| Belirti | Olası neden | Yapılacak |
|--------|--------------|-----------|
| 401 Unauthorized | CRON_SECRET yanlış/eksik | cron-job.org’daki header’da `Bearer CRON_SECRET` doğru mu kontrol et; Vercel env’deki CRON_SECRET ile aynı mı bak. |
| 503 Push not configured | Redis veya VAPID eksik | Vercel’de 5 env değişkeninin hepsi tanımlı mı kontrol et; redeploy et. |
| iOS’ta bildirim yok | PWA değil veya izin yok | Siteyi **Ana Ekrana Ekle** ile PWA yap; uygulama ikonundan aç; bildirim iznini ver. |
| Hiç bildirim gelmiyor | Abonelik yok veya vakit dışı | Sitede bildirimleri açıp bir kez sayfayı kullan; bildirimler sadece 15/10/5/0 dk ve vakit anında gider. |

---

## API ne yapıyor? (`/api/cron/push-reminders`)

Bu endpoint **dışarıdan** (cron-job.org) dakikada bir **GET** ile çağrılıyor. İçeride yapılanlar:

1. **Yetki:** `Authorization: Bearer CRON_SECRET` yoksa 401 döner; sadece senin cron job’ın çağırabilir.
2. **Test modu:** URL’de `?test=1` varsa tüm Redis’teki abonelere tek seferlik “Test – Bildirimler çalışıyor” push’u gönderir, biter.
3. **Normal mod:**
   - Bugünün Doha tarihini alır, namaz vakitleri API’sinden (Aladhan) **Fajr** ve **Maghrib** saatlerini çeker.
   - Şu anki UTC zamanının, **Sahur’a 15 / 10 / 5 / 0 dakika kala** veya **İftar’a 15 / 10 / 5 / 0 dakika kala** penceresinde olup olmadığına bakar.
   - Bu pencerede değilse `{ ok: true, sent: 0 }` döner (bildirim gönderilmez).
   - Bu penceredeyse: Redis’te “bu slot için daha önce gönderildi” var mı diye bakar (aynı bildirimi iki kez göndermemek için). Gönderildiyse yine `sent: 0` döner.
   - Gönderilmediyse Redis’teki **tüm push aboneliklerini** (endpoint + keys) alır; her biri için **Web Push** (VAPID ile) ile bildirim gönderir: “15 dakika kaldı”, “İftar Vakti!” vb. Dil (TR/EN) abonelikte kayıtlı locale’e göre seçilir.
   - Gönderim sonrası bu slot için Redis’e “gönderildi” işaretini koyar (10 dk TTL). Cevap `{ ok: true, sent: N }` döner.

Yani: **Tetikleyen sen değilsin;** cron-job.org her dakika bu URL’yi çağırıyor. API sadece “şu an 15/10/5/0 dakika penceresinde mi?” diye bakıyor; evetse bir kez push atıp kaydediyor, hayırsa hiçbir şey yapmıyor. Bildirimi **tarayıcı / işletim sistemi** gösteriyor (Web Push protokolü).

---

## Ücretsiz kalacak mı? Limitler

Hepsi **ücretsiz** ve bu kullanımda limitlere takılmazsın:

| Servis | Ücretsiz limit | Bizim kullanım |
|--------|----------------|----------------|
| **Vercel Hobby** | Ayda 1.000.000 serverless invocation | Dakikada 1 istek ≈ ayda ~43.200; çok altında. |
| **cron-job.org** | Saatte 60 istek (dakikada bir uygun) | Dakikada 1 GET; limit içinde. |
| **Upstash Redis** | Free tier (günlük istek limiti) | Sadece cron + abonelik kaydı; düşük kullanım. |
| **Web Push (VAPID)** | Ücretsiz; tarayıcı/OS push servisi kullanır | Ek ücret yok. |

Vercel tarafında bu endpoint bir **Serverless Function**; her cron çağrısı 1 invocation sayılır. Dakikada bir çağrı = günde 1440, 30 günde ~43.200. 1 milyon limitin çok altında kalırsın; ek ücret oluşmaz.

---

## Özet

- **Ücretsiz:** VAPID (script), Upstash Redis free tier, Vercel Hobby, cron-job.org.
- **Yapılanlar:** 1) `npm run generate-vapid` → 3 değer, 2) Upstash Redis → URL + Token, 3) Vercel’e 5 env + redeploy, 4) cron-job.org’da dakikada bir GET + Authorization header, 5) iOS’ta Ana Ekrana Ekle + bildirim aç.
- Bu adımlar tamamlandığında arka plan bildirimleri teslim edilmiş sayılır.
