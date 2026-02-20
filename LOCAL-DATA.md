# 📅 Local Ramadan 2026 Data

## ✅ PDF'den Çıkarılan Veriler

Ramazan 2026 takvimi PDF'den OCR ile çıkarıldı ve `lib/ramadan-2026-data.json` dosyasına kaydedildi.

### Veri Yapısı

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

### Özellikler

- ✅ **30 gün** tam Ramazan takvimi
- ✅ **18 Şubat 2026 - 19 Mart 2026**
- ✅ **Qatar Official Method** saatleri
- ✅ **PDF kaynağından** doğrudan alındı
- ✅ **API'ye bağımlılık yok** (Ramazan tarihleri için)

### Kullanım

- Ramazan tarihleri için: Local JSON kullanılıyor
- Ramazan dışı tarihler için: API fallback (Aladhan)
- Hijri tarihler: API'den çekiliyor (cache'leniyor)

### Avantajlar

1. **%100 Doğru**: PDF'den direkt alındı
2. **Hızlı**: API çağrısı yok
3. **Offline**: Internet olmadan çalışır
4. **Güvenilir**: API değişikliklerinden etkilenmez

---

**Kaynak**: Peninsula Qatar - Ramadan Calendar 2026 PDF
