## Astrocus — Progress Log

Bu dosya, projede şimdiye kadar yapılan işleri, seçilen yaklaşımı, tamamlanan adımları ve şu an üzerinde çalıştığımız problemi tek yerde özetlemek için tutulur.

> Ders teslimi için özet dokümanlar: `prodocs/` (`PRD.md`, `tech-stack.md`, `Plan.md`, `DesignSystem.md`, `COMPLIANCE.md`). Bu dosya **Progress** kaynağıdır; her işlem buraya eklenir.

---

### 2026-05-15 — Frontend–Backend Entegrasyonu (Anti-cheat + Express Analytics)

**Bağlam:** Mobil uygulamada seans sonu ödüllerinin cihaz içinde hesaplanması hem PRD anti-cheat ilkesine hem de üretim güvenine aykırıydı. Backend’de hazır olan `complete_focus_session` RPC ve Express analitik endpoint’i ile Expo istemcisi hizalandı.

**Yapılanlar:**
* **Seans tamamlama:** `frontend/src/shared/api.ts` üzerinden yalnızca Supabase RPC çağrısı; parametreler `p_pause_used`, `p_is_offline`, `p_timezone` ile veritabanı şemasına uyumlu. İstemci tarafında stardust/XP çarpan matematiği kaldırıldı (`context/session/stardust.ts` yalnızca günlük özet + yıldız eşiği yardımcıları).
* **Yanıt işleme:** RPC dönüşü (`xp_earned`, `stardust_earned`, `streak_count`, `new_badges`) kutlama modalına bağlandı; yıldız unlock farkı `user_stars` + `fetchUserData` ile önceki `unlockedStarIds` kümesine göre tespit ediliyor.
* **Offline kuyruk:** Ağ hatasında sahte ödül yerine `pendingSync` durumu ve dürüst kullanıcı mesajı. `syncSessions` döngüsünde her kayıt için aynı RPC, `p_is_offline: true`.
* **Profil / şema eşlemesi:** `profileMapper` — `streak_count` | `current_streak`, `total_xp`, `level`, session’da `pause_used` / `xp_earned`. `User` tipine `totalXp` ve `level` eklendi.
* **Analytics API:** `frontend/src/services/analyticsApi.ts` ile `GET /analytics/summary` (Bearer JWT); `SessionContext` içinde `analyticsSummary` + `refreshAnalytics`. `ProfileScreen` `useFocusEffect` ile sekme odağında yenileme; toplam odak, seri ve kategori dağılımı API’den besleniyor (yoksa yerel `sessions` yedeği).
* **Haftalık çubuklar:** `SessionScreen` önce `weekFocusMinutes` (backend ile tarih dilimi tutarlı), yoksa yerel session toplamı.
* **Konfigürasyon:** `EXPO_PUBLIC_API_URL` (`frontend/.env.example` — LAN / emülatör notları); `app.config.ts` `extra.apiUrl` ile uyumlu.

**Sonraki Adım:**
* Fiziksel cihazda `EXPO_PUBLIC_API_URL` ile uçtan uca regresyon testi (seans → RPC → profil grafikleri).
* İstenirse `POST /ai/galactic-advice` ve rozet listesinin `user_badges` ile tam senkronu.

---

### 2026-05-15 — Backend Mimarisinin Supabase ve Node.js ile Kurulumu

[cite_start]**Bağlam:** MVP aşamasındaki dosya tabanlı geçici veritabanı tamamen çöpe atıldı ve bitirme projesi gereksinimleri doğrultusunda [cite: 4] [cite_start]Supabase destekli, LLM entegrasyonuna hazır [cite: 10] [cite_start]ayrık backend mimarisi [cite: 11] inşa edildi.

**Yapılanlar:**
* **Veritabanı Şeması (Migration):** Supabase CLI ile `profiles`, `categories`, `sessions`, `stardust_ledger`, `stars`, `user_stars`, `badges` ve `user_badges` tabloları oluşturuldu ve `ON DELETE CASCADE` ilişkileri kuruldu.
* **RPC ve Oyunlaştırma (Gamification) Motoru:** Hileleri engellemek ve atomik işlemler yapmak için Supabase SQL Editor üzerinden `complete_focus_session` RPC fonksiyonu yazıldı. XP, yıldız tozu ve streak hesaplamaları veritabanı seviyesine çekildi.
* **Express API Kurulumu:** `/backend` klasörü altında Node.js + Express iskeleti oluşturuldu. `cors`, `dotenv`, `@supabase/supabase-js`, `@google/generative-ai` ve `zod` paketleri kurularak TypeScript konfigürasyonu tamamlandı.
* **Güvenlik Katmanı:** Çekirdek özellikleri destekleyecek API anahtarları (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sadece `backend/.env` dosyasında izole edildi. [cite_start]Repoya `backend/.env.example` şablonu eklendi[cite: 28]. RLS (Row Level Security) kuralları Supabase panelinden aktif edildi.

**Sonraki Adım (güncel):**
* `POST /ai/galactic-advice` üretim kalitesinde sabitleme ve hata sınırları.
* `backend` .env / `frontend` `EXPO_PUBLIC_*` ile staging veya canlı deploy denemesi.

---

### 2026-05-15 — Future Talent Modernizasyonu ve Klasör Yapılandırması

[cite_start]**Bağlam:** 8 haftalık proje gereksinimleri (etkileşimli uygulama, LLM API, ayrı FE/BE, canlı deploy, GitHub yapısı, zorunlu dokümanlar, demo video) [cite: 4, 10, 11, 12, 14, 25, 36] referans alınarak repo düzenlendi.

**Yapılanlar:**
* Monorepo mimarisine geçildi. [cite_start]Tüm Expo kodu `/frontend` klasörüne, veritabanı/API kodları `/backend` klasörüne taşındı[cite: 16, 17].
* Gereksiz dosyalar (eski `server/` klasörü, Prisma, `docker-compose.yml`) tamamen silinerek yapı sadeleştirildi.
* [cite_start]`prodocs/` klasörü altındaki zorunlu dokümanlar (`PRD.md`, `tech-stack.md`, `Plan.md`, vb.) mimariye uygun olarak revize edildi[cite: 19, 29, 30].
* CI/CD (GitHub Actions) iş akışları sadece frontend ve backend typecheck işlemlerini yapacak şekilde güncellendi.

**Açık Riskler (Teslim Öncesi):**
* [cite_start]🟡 LLM entegrasyonu kod bazında henüz tamamlanmadı (ders zorunluluğu)[cite: 10].
* 🟡 Mobil ↔ Supabase RPC + Express analytics birlikte gerçek cihaz / LAN üzerinde sınırlı test edildi; prod ağ ve store build doğrulanmalı.
* [cite_start]🟡 Canlı deploy (API yayını) yapılmadı[cite: 12].
* [cite_start]🟡 Demo video henüz çekilmedi[cite: 36].

---

### Yaklaşım (Approach)

* **Önce PRD/MVP’yi teknik olarak tutarlı hale getir, sonra MVP’yi “çalışan iskelet” olarak ayağa kaldır.**
* **MVP’de vendor/kütüphane kilidi yerine ürün davranışını sabitle, teknik detayları sade tut.**
* **Yapay Zeka Odaklılık:** LLM servisi (Gemini) uygulamanın çekirdek motivasyon mekaniğine API üzerinden entegre edilecek. Prompt injection koruması için anahtarlar backend'de izole kalacak.
* **Expo Go ile Hızlı İterasyon:** Mobil geliştirme sürecinde Expo SDK 54 ve dosya tabanlı routing için Expo Router kullanılarak ilerlenmektedir.
* **Veri Tutarlılığı:** Tüm kritik oyunlaştırma hesaplamaları (streak, XP, ödül) sunucu tarafında atomik RPC fonksiyonları ile doğrulanmaktadır.