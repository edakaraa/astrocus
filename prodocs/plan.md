# Astrocus — Geliştirme Planı (Plan.md)

> **Versiyon:** MVP v2.0
> **Hazırlayan:** Eda Kara
> **Son Güncelleme:** Stack & tasarım revizyonu sonrası
> **Hedef:** App Store + Google Play yayına çıkış

---

## İçindekiler

1. [Mevcut Durum Özeti](#1-mevcut-durum-özeti)
2. [Açık Maddeler & Öncelik Sırası](#2-açık-maddeler--öncelik-sırası)
3. [Sprint Planı](#3-sprint-planı)
4. [Teknik Görev Detayları](#4-teknik-görev-detayları)
5. [Test Planı](#5-test-planı)
6. [Yayın Kontrol Listesi](#6-yayın-kontrol-listesi)
7. [Post-MVP Yol Haritası](#7-post-mvp-yol-haritası)

---

## 1. Mevcut Durum Özeti

### ✅ Tamamlanan (Demo / MVP Seviyesinde)

| Alan                     | Detay                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| **Expo İskelet**         | Expo SDK 54, Expo Router, TypeScript yapılandırması hazır          |
| **Navigasyon**           | Tab bar (Odak / Gökyüzü / Profil), Stack navigasyon                |
| **Auth Akışı**           | E-posta + şifre kayıt ve giriş (Supabase Auth — temel)             |
| **Onboarding**           | 4 ekran akışı (animasyonlar kısmen tamamlandı)                     |
| **Timer Motoru**         | AppState + timestamp tabanlı; pause, background tolerans mantığı   |
| **Gamification Formülü** | XP ve yıldız tozu hesaplama (istemci taraflı, doğrulama henüz yok) |
| **Yıldız Kataloğu**      | Statik yıldız listesi, kilit/açık UI                               |
| **Streak Takibi**        | Temel streak sayacı (lokal)                                        |
| **Offline Kuyruk**       | `AsyncStorage` kuyruğu + sync endpoint iskeleti                    |
| **TR/EN Lokalizasyon**   | i18n anahtar yapısı, cihaz dil tespiti                             |
| **Express API**          | Node.js/Express; JSON dosya tabanlı storage (geçici)               |

---

### ❌ Kritik Açık Maddeler (Yayın Öncesi Zorunlu)

| #   | Görev                                                               | Öncelik |
| --- | ------------------------------------------------------------------- | ------- |
| C1  | Supabase tam entegrasyonu (dosya tabanlı storage kaldır)            | 🔴 P0   |
| C2  | `complete_focus_session` atomik RPC yazımı                          | 🔴 P0   |
| C3  | Google OAuth native entegrasyonu                                    | 🔴 P0   |
| C4  | Apple Sign In native entegrasyonu (iOS App Store zorunluluğu)       | 🔴 P0   |
| C5  | OpenRouter API `/ai/galactic-advice` endpoint + frontend bağlantısı | 🔴 P0   |
| C6  | Rozet sistemi backend doğrulaması                                   | 🔴 P0   |
| C7  | XP seviye sistemi `profiles` tablosuna eklenmesi                    | 🔴 P0   |
| C8  | Tüm tablolar için RLS politikaları + test                           | 🔴 P0   |
| C9  | Gerçek cihaz iOS / Android smoke test                               | 🔴 P0   |

---

## 2. Açık Maddeler & Öncelik Sırası

### P0 — Yayın Bloklayıcı

```
[ ] C1  Supabase entegrasyonu
[ ] C2  complete_focus_session RPC
[ ] C3  Google OAuth
[ ] C4  Apple Sign In
[ ] C5  OpenRouter AI endpoint
[ ] C6  Rozet backend doğrulaması
[ ] C7  XP/Seviye profil entegrasyonu
[ ] C8  RLS politikaları
[ ] C9  Cihaz smoke testi
```

### P1 — Yayın Öncesi Güçlü Tercih

```
[ ] Sentry entegrasyonu (crash raporlama)
[ ] Uygulama ikonları (iOS + Android, tüm çözünürlükler)
[ ] Splash screen
[ ] App Store / Play Store meta verileri (başlık, açıklama, ekran görüntüleri)
[ ] KVKK / GDPR uyum metni (onboarding'e eklenmesi)
[ ] Hesap silme flow testi (30 gün soft delete → kalıcı silme)
[ ] Push bildirim altyapısı (expo-notifications, temel izin akışı)
[ ] Performans: düşük cihaz animasyon fallback
```

### P2 — Post-MVP (Sonraki Sürüm)

```
[ ] Global Odalar & Body Doubling
[ ] Uzay Ambiyansı / Ambient Sesler
[ ] Haptic Feedback & Ses Efektleri
[ ] Engagement Push Bildirimleri
[ ] Gökyüzü Paylaşımı
[ ] Karanlık / Aydınlık Tema Toggle
[ ] Premium Abonelik
[ ] Liderlik Tablosu
[ ] PostHog / Mixpanel Analitik
```

---

## 3. Sprint Planı

> Tahmini süre: 6 sprint × 1 hafta = ~6 hafta (2 geliştirici varsayımı)

### Sprint 1 — Supabase & Auth Temeli

**Hedef:** Gerçek veritabanı ve auth çalışıyor, dosya tabanlı storage kaldırıldı.

| Görev                                          | Sorumlu  | Süre    |
| ---------------------------------------------- | -------- | ------- |
| Supabase projesi oluştur, env yapılandır       | Backend  | 0.5 gün |
| SQL şeması migration'ları yaz (tüm tablolar)   | Backend  | 1 gün   |
| RLS politikalarını yaz ve test et              | Backend  | 1 gün   |
| `@supabase/supabase-js` frontend entegrasyonu  | Frontend | 1 gün   |
| E-posta auth gerçek Supabase'e bağla           | Frontend | 0.5 gün |
| JSON dosya storage'ı kaldır, Express'i temizle | Backend  | 0.5 gün |
| Google OAuth native (Expo AuthSession)         | Frontend | 1 gün   |
| Apple Sign In native                           | Frontend | 1 gün   |

**Sprint Sonu Kriteri:** Kullanıcı kaydolup giriş yapabiliyor; veriler Supabase'de görünüyor.

---

### Sprint 2 — Seans Motoru & RPC

**Hedef:** Seans tamamlama → atomik RPC → doğrulanmış ödül akışı çalışıyor.

| Görev                                                | Sorumlu  | Süre    |
| ---------------------------------------------------- | -------- | ------- |
| `complete_focus_session` RPC yazımı (PostgreSQL)     | Backend  | 2 gün   |
| Streak güncelleme mantığı (RPC içinde)               | Backend  | 0.5 gün |
| Rozet kontrol mantığı (RPC içinde)                   | Backend  | 1 gün   |
| Frontend → RPC entegrasyonu (seans sonu akışı)       | Frontend | 1 gün   |
| Offline kuyruk → Supabase sync testi                 | Frontend | 1 gün   |
| XP / Seviye hesaplama `profiles` tablosuna eklenmesi | Backend  | 0.5 gün |

**Sprint Sonu Kriteri:** Seans tamamlayınca XP, stardust, streak ve rozetler Supabase'e doğru yazılıyor.

---

### Sprint 3 — AI Galaktik Tavsiyeler

**Hedef:** OpenRouter entegrasyonu tamamlandı; seans sonrası AI tavsiyesi görünüyor.

| Görev                                                                         | Sorumlu  | Süre    |
| ----------------------------------------------------------------------------- | -------- | ------- |
| OpenRouter API hesabı, API key, .env yapılandırması                           | Backend  | 0.5 gün |
| `/ai/galactic-advice` Express endpoint yazımı                                 | Backend  | 1 gün   |
| Sistem ve kullanıcı prompt şablonları (TR + EN)                               | Backend  | 0.5 gün |
| Supabase JWT doğrulama middleware (endpoint koruması)                         | Backend  | 0.5 gün |
| Prompt injection koruması (whitelist + sanitizasyon)                          | Backend  | 0.5 gün |
| Timeout (5s) + fallback metin havuzu implementasyonu                          | Backend  | 0.5 gün |
| Frontend → endpoint bağlantısı + skeleton yükleyici                           | Frontend | 1 gün   |
| Model seçimi testi: `google/gemma-2-9b-it` vs `mistralai/mistral-7b-instruct` | Backend  | 0.5 gün |

**Sprint Sonu Kriteri:** Seans bitti ekranında AI tavsiyesi görünüyor; API hatasında fallback devreye giriyor.

---

### Sprint 4 — UI Polish & Animasyonlar

**Hedef:** Tüm ekranlar tasarıma uygun; animasyonlar çalışıyor.

| Görev                                                   | Sorumlu  | Süre    |
| ------------------------------------------------------- | -------- | ------- |
| Onboarding animasyonları (4 ekran, tam)                 | Frontend | 1.5 gün |
| Timer gezegen animasyonu (Reanimated)                   | Frontend | 1 gün   |
| Seans sonu kutlama animasyonları (XP sayaç, rozet)      | Frontend | 1 gün   |
| Yıldız açılış efekti (parlama + konfeti)                | Frontend | 1 gün   |
| Tüm ekran tasarım token uyumu (renk, tipografi, boşluk) | Frontend | 1 gün   |
| Düşük cihaz animasyon fallback                          | Frontend | 0.5 gün |

**Sprint Sonu Kriteri:** Tasarım dosyasıyla görsel karşılaştırmada %90+ uyum.

---

### Sprint 5 — Test & Hata Düzeltme

**Hedef:** Kritik buglar giderildi; cihaz testleri tamamlandı.

| Görev                                            | Sorumlu   | Süre    |
| ------------------------------------------------ | --------- | ------- |
| iOS gerçek cihaz smoke testi (tüm P0 özellikler) | Frontend  | 1 gün   |
| Android gerçek cihaz smoke testi                 | Frontend  | 1 gün   |
| RLS politika güvenlik testi                      | Backend   | 1 gün   |
| Offline → online seans sync edge case testi      | Frontend  | 0.5 gün |
| Hata düzeltme (test çıktısı)                     | Her ikisi | 2.5 gün |

**Sprint Sonu Kriteri:** Cihaz testlerinde P0 özellikler hatasız çalışıyor.

---

### Sprint 6 — Yayın Hazırlığı

**Hedef:** App Store ve Play Store'a gönderim hazır.

| Görev                                                  | Sorumlu   | Süre    |
| ------------------------------------------------------ | --------- | ------- |
| Uygulama ikonu (tüm boyutlar)                          | Tasarım   | 0.5 gün |
| Splash screen                                          | Tasarım   | 0.5 gün |
| App Store meta (başlık, açıklama, ekran görüntüleri)   | Ürün      | 1 gün   |
| Play Store meta                                        | Ürün      | 0.5 gün |
| KVKK uyum metni onboarding'e eklenmesi                 | Frontend  | 0.5 gün |
| Sentry kurulumu                                        | Backend   | 0.5 gün |
| EAS Build yapılandırması (production profile)          | Frontend  | 0.5 gün |
| TestFlight (iOS) + Internal Testing (Android) dağıtımı | Her ikisi | 1 gün   |
| Beta kullanıcı geri bildirimi                          | Ürün      | devam   |

**Sprint Sonu Kriteri:** TestFlight ve Play Console'da yüklenmiş build var; ilk 20 beta kullanıcı davet edildi.

---

## 4. Teknik Görev Detayları

### 4.1 `complete_focus_session` RPC Şeması

```sql
CREATE OR REPLACE FUNCTION complete_focus_session(
  p_user_id          UUID,
  p_session_id       UUID,         -- client'dan gelen UUID (idempotent)
  p_category_id      UUID,
  p_duration_minutes INTEGER,
  p_started_at       TIMESTAMPTZ,
  p_completed_at     TIMESTAMPTZ,
  p_pause_used       BOOLEAN,
  p_background_hit   BOOLEAN,
  p_is_offline       BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_stardust      INTEGER;
  v_xp            INTEGER;
  v_streak        INTEGER;
  v_new_badges    UUID[];
  v_actual_mins   INTEGER;
BEGIN
  -- 1. Süre doğrulama (anti-cheat)
  v_actual_mins := EXTRACT(EPOCH FROM (p_completed_at - p_started_at)) / 60;
  IF v_actual_mins < p_duration_minutes * 0.8 THEN
    RAISE EXCEPTION 'invalid_duration';
  END IF;

  -- 2. Yıldız tozu ve XP hesaplama (formül PRD §4.3)
  -- [formül implementasyonu]

  -- 3. sessions tablosuna kayıt (idempotent upsert)
  INSERT INTO sessions (...) VALUES (...)
    ON CONFLICT (id) DO NOTHING;

  -- 4. stardust_ledger güncelleme
  -- 5. profiles güncelleme (stardust, xp, streak, seviye)
  -- 6. Rozet kontrolü → user_badges
  -- 7. Yıldız açılış kontrolü → user_stars

  RETURN jsonb_build_object(
    'stardust_earned', v_stardust,
    'xp_earned', v_xp,
    'streak_count', v_streak,
    'new_badges', v_new_badges
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 OpenRouter Endpoint Yapısı

```javascript
// backend/routes/ai.js

router.post("/galactic-advice", verifySupabaseJWT, async (req, res) => {
  const { duration_minutes, category_slug, streak_count, xp_earned, language } =
    req.body;

  // Whitelist doğrulaması
  const VALID_CATEGORIES = [
    "deep_focus",
    "study",
    "reading",
    "project",
    "creativity",
    "sport",
    "meditation",
    "coding",
    "other",
  ];
  if (!VALID_CATEGORIES.includes(category_slug)) {
    return res.status(400).json({ error: "invalid_category" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://astrocus.app",
          "X-Title": "Astrocus",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemma-2-9b-it:free",
          max_tokens: 80,
          temperature: 0.85,
          messages: [
            { role: "system", content: buildSystemPrompt(language) },
            {
              role: "user",
              content: buildUserPrompt({
                duration_minutes,
                category_slug,
                streak_count,
                xp_earned,
              }),
            },
          ],
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);
    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content?.trim();

    if (!advice) throw new Error("empty_response");
    res.json({ advice });
  } catch (err) {
    clearTimeout(timeout);
    // Fallback metin havuzundan rastgele seç
    const fallback = getFallbackMessage(language);
    res.json({ advice: fallback, fallback: true });
  }
});
```

### 4.3 Önerilen OpenRouter Model Listesi

| Model               | Slug                                    | Dil Kalitesi | Ücretsiz |
| ------------------- | --------------------------------------- | ------------ | -------- |
| Google Gemma 2 9B   | `google/gemma-2-9b-it:free`             | TR ✅ EN ✅  | ✅       |
| Mistral 7B Instruct | `mistralai/mistral-7b-instruct:free`    | TR ✅ EN ✅  | ✅       |
| Meta Llama 3.1 8B   | `meta-llama/llama-3.1-8b-instruct:free` | TR ⚠️ EN ✅  | ✅       |
| Qwen 2.5 7B         | `qwen/qwen-2.5-7b-instruct:free`        | TR ✅ EN ✅  | ✅       |

> **Not:** Model, `OPENROUTER_MODEL` env değişkeniyle kod değişikliği yapmadan değiştirilebilir.

### 4.4 Offline Seans Sync Mantığı

```javascript
// Seans tamamlandığında
async function completeSession(sessionData) {
  if (isOnline) {
    await callRPC("complete_focus_session", sessionData);
  } else {
    // Kuyruğa ekle
    const queue = (await AsyncStorage.getItem("session_queue")) || "[]";
    const parsed = JSON.parse(queue);
    parsed.push({ ...sessionData, is_offline: true });
    await AsyncStorage.setItem("session_queue", JSON.stringify(parsed));
  }
}

// Bağlantı geldiğinde
async function flushSessionQueue() {
  const queue = JSON.parse(
    (await AsyncStorage.getItem("session_queue")) || "[]",
  );
  for (const session of queue) {
    try {
      await callRPC("complete_focus_session", session);
    } catch (e) {
      break; // Hata durumunda sırayı koru, tekrar dene
    }
  }
  await AsyncStorage.removeItem("session_queue");
}
```

---

## 5. Test Planı

### 5.1 Unit Test Kapsamı

| Modül                     | Test Edilecek                         | Öncelik |
| ------------------------- | ------------------------------------- | ------- |
| Yıldız tozu formülü       | Streak, kategori, tam seans bonusları | P0      |
| XP hesaplama              | Tüm seans tipleri                     | P0      |
| Streak güncelleme mantığı | Bugün / dün / eski senaryo            | P0      |
| Rozet açılış koşulları    | Her rozet için edge case              | P0      |
| Timer arka plan toleransı | ≤20s / >20s senaryoları               | P0      |
| Offline kuyruk            | Ekleme, flush, çakışma                | P1      |
| i18n                      | Eksik key fallback                    | P1      |

### 5.2 Entegrasyon Test Senaryoları

```
Senaryo 1: Tam seans akışı
  → Seans başlat → tamamla → RPC çağrısı → UI güncelleme

Senaryo 2: Seans arka planda kayıp
  → 25. saniyede geri dön → seans iptal → diyalog göster

Senaryo 3: AI tavsiyesi hata
  → OpenRouter timeout → fallback metin göster → uygulama çökmez

Senaryo 4: Offline seans
  → Offline tamamla → kuyruğa ekle → online ol → sync → veriler DB'de

Senaryo 5: Streak kırılması
  → 1 gün atla → streak sıfırla → "Yeni başlangıç" mesajı göster

Senaryo 6: Rozet kazanımı
  → Koşul tamamla → RPC'de tespit → user_badges'e yaz → UI kutla

Senaryo 7: RLS güvenlik testi
  → A kullanıcısı B kullanıcısının seansını okumaya çalışır → reddedilir
```

### 5.3 Cihaz Test Matrisi

| Cihaz                            | OS         | Öncelik |
| -------------------------------- | ---------- | ------- |
| iPhone 15 (veya 14)              | iOS 17     | 🔴 P0   |
| iPhone SE 3. nesil (küçük ekran) | iOS 16     | 🔴 P0   |
| Samsung Galaxy S23               | Android 13 | 🔴 P0   |
| Düşük segment Android (2GB RAM)  | Android 11 | 🟡 P1   |
| iPad (tablet layout)             | iPadOS 17  | 🟢 P2   |

---

## 6. Yayın Kontrol Listesi

### Teknik

- [ ] Tüm P0 kritik maddeler kapalı (`C1`–`C9`)
- [ ] `complete_focus_session` RPC üretimde test edildi
- [ ] RLS politikaları tüm tablolarda aktif ve test edildi
- [ ] OpenRouter API key backend `.env`'de; frontend bundle'da YOK
- [ ] OPENROUTER_MODEL env değişkeni ayarlı
- [ ] Timeout ve fallback senaryoları test edildi
- [ ] Offline sync senaryoları test edildi
- [ ] Sentry entegrasyonu aktif (production DSN)
- [ ] EAS Build production profile yapılandırıldı
- [ ] iOS: Apple Developer hesabı + provisioning profile
- [ ] Android: Play Console hesabı + keystore

### Ürün

- [ ] Uygulama ikonu (iOS: 1024px, Android: tüm mDPI–xxxHDPI)
- [ ] Splash screen (iOS + Android)
- [ ] App Store açıklaması (TR + EN)
- [ ] Play Store açıklaması (TR + EN)
- [ ] Ekran görüntüleri (iPhone 6.7", 5.5"; Android)
- [ ] Gizlilik politikası URL'si
- [ ] Kullanım şartları URL'si
- [ ] KVKK / GDPR uyum metni onboarding'de

### Kalite

- [ ] TestFlight ile ≥5 beta kullanıcı testi tamamlandı
- [ ] Kritik bug: 0
- [ ] P0 akışlar cihazda eksiksiz çalışıyor
- [ ] App Store review kılavuzuna uyum kontrol edildi
- [ ] Apple Sign In sorunsuz çalışıyor (iOS review zorunluluğu)

---

## 7. Post-MVP Yol Haritası

### v2.1 — Sosyal & Ambiyans (Tahmini: +6 hafta)

| Özellik                        | Açıklama                                                 |
| ------------------------------ | -------------------------------------------------------- |
| **Global Odalar**              | Gerçek zamanlı body-doubling odaları (Supabase Realtime) |
| **Aktif Kullanıcı Göstergesi** | Odada kaç kişi çalışıyor                                 |
| **Uzay Ambiyansı**             | 5–8 ambient ses seçeneği (lofi, uzay, yağmur)            |
| **Haptic Feedback**            | Seans başlangıç / bitiş / rozet kazanımı                 |
| **Engagement Bildirimleri**    | "Bugün henüz odaklanmadın 🌟" gibi hatırlatıcılar        |

### v2.2 — Premium & Monetizasyon (Tahmini: +8 hafta)

| Özellik                      | Açıklama                                                    |
| ---------------------------- | ----------------------------------------------------------- |
| **Premium Abonelik**         | RevenueCat entegrasyonu; aylık / yıllık plan                |
| **Premium İçerikler**        | Ekstra yıldız seti, özel gezegen temaları, ambiyans sesleri |
| **Gökyüzü Paylaşımı**        | Galaksini sosyal medyada paylaş                             |
| **Karanlık / Aydınlık Tema** | Kullanıcı seçimi                                            |

### v2.3 — Sosyal Rekabet (Tahmini: +10 hafta)

| Özellik                     | Açıklama                                     |
| --------------------------- | -------------------------------------------- |
| **Liderlik Tablosu**        | Haftalık XP sıralaması (arkadaşlar / global) |
| **Arkadaş Sistemi**         | Kullanıcı adıyla arkadaş ekleme              |
| **Profil: 12 Aylık Geçmiş** | Tema bazlı aylık odak haritası               |
| **PostHog Analitik**        | Kullanıcı davranış funnel analizi            |

---

_Astrocus Plan.md — MVP v2.0 · Dahili kullanım içindir._
