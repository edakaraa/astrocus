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

**Sonraki Adım (2026-05-18 itibarıyla kapanan kalemler aşağıdaki günlükte):**
* ~~`POST /ai/galactic-advice`~~ → tamamlandı.
* ~~Rozetlerin `user_badges` ile senkronu~~ → tamamlandı (kutlama + profil).

---

### 2026-05-18 — Backend & Frontend eksikler planı (önceki → şimdiki durum)

**Bağlam:** Monorepo genel durum taraması sonrası backend/frontend ayrı TODO listesi çıkarıldı ve uygulandı. Amaç: kırık LLM endpoint’i, yıldız ekonomisi tutarsızlığı, sahte OAuth, onboarding/auth boşlukları ve teslim öncesi kalite (test, CI, prod script) kalemlerini kapatmak.

#### Önceki durum (özet)

| Alan | Çalışan | Eksik / kırık |
|------|---------|----------------|
| **Backend** | Supabase şema + `complete_focus_session` / `unlock_star` RPC; Express: `/health`, `/analytics/summary`, `/stars/unlock`, `/account/delete`; `galacticAdvice.ts` servisi yazılmış | `ai.routes.ts` / `ai.controllers.ts` **boş**; `index.ts` AI mount yok → mobil `POST /ai/galactic-advice` **404**; `npm start` yok; test/CI yok; README endpoint listesi eksik |
| **Frontend** | Expo Router (onboarding, auth, 3 tab, legal); RPC seans; offline kuyruk; analytics API; kutlama modalı (stardust/XP/streak) | Google/Apple **demo hesap** (`google-demo@`); yıldız unlock yalnızca istemci eşiği (`getUnlockedStars`); `new_badges` UI’da yok; `onboardingSeen` ≠ `onboardingCompleted`; tab auth guard yok; kayıt alanları DB’ye gitmiyor; şifre sıfırlama / GitHub butonu ölü; `src/ui/` kopyaları kullanılmıyor |
| **Deploy / teslim** | `npm run dev` / `build` | Canlı API yok; demo video yok; CI workflow repoda yok |

#### Şimdiki durum (özet)

| Alan | Tamamlanan |
|------|------------|
| **Backend** | `POST /ai/galactic-advice` bağlı (Bearer + Zod + `{ advice }`); `helmet`, rate limit, gelişmiş `/health`, SIGTERM; `npm start`; Vitest; `backend/README.md` güncel; `.env.example` (`PORT`, `SUPABASE_JWT_SECRET` kaldırıldı) |
| **Frontend** | Supabase OAuth (`expo-web-browser`, `expo-auth-session`, `astrocus://` scheme); seans sonrası + Galaksi’de `POST /stars/unlock`; `user_badges` + kutlama rozetleri; `/(onboarding)/star-pick`; tab + auth redirect guard; kayıt profil alanları; şifre sıfırlama; prod’da zorunlu Supabase env; `eas.json` (isteğe bağlı) |
| **Ortak** | `.github/workflows/ci.yml`; `.env.staging.example`; `docs/DEMO_VIDEO.md` |

**Bilerek eklenmeyen / geri alınan:** Railway ve Render’a özel `railway.toml` / `render.yaml` kullanıcı onayı olmadan eklenmişti; **silindi**. Deploy platformu seçilmedi; yalnızca genel `npm run build` + `npm start` dokümante edildi.

---

#### Backend — yapılanlar

* **B1 — AI endpoint:** `backend/src/routes/ai.routes.ts`, `backend/src/controllers/ai.controllers.ts` implemente edildi; `backend/src/index.ts` içinde `app.use("/ai", aiLimiter, aiRoutes)`. `galacticAdvice.ts` → Gemini; hata kodları (`gemini_not_configured`, `gemini_error`); `GEMINI_TIMEOUT_MS` (varsayılan 12s).
* **B2 — README:** Tüm endpoint’ler (`/analytics/summary`, `/stars/unlock`, `/ai/galactic-advice`, …) ve env tablosu.
* **B5 — Üretim script:** `package.json` → `"start": "node dist/index.js"`, `"test": "vitest run"`, `"typecheck"`, `engines.node >= 20`.
* **B7 — LLM sınırları:** AI route’a ayrı rate limit (20/dk); timeout serviste.
* **B9–B10 — Güvenlik / health:** `helmet`, `express-rate-limit`; `/health` Supabase ping + `checks.gemini`.
* **B14 — Graceful shutdown:** `SIGTERM` / `SIGINT` → `server.close()`.
* **B8 / B11 — Test & CI:** `src/health.test.ts`, `src/services/galacticAdvice.test.ts`; `.github/workflows/ci.yml` (backend build+test, frontend typecheck).
* **B13 — Migration:** `backend/supabase/migrations/002_profile_extra_fields.sql` — `display_name`, `birthdate`, `favorite_planet`.
* **B4 — unlock_star hizası:** Backend proxy zaten vardı; frontend artık `frontend/src/services/starsApi.ts` ile `POST /stars/unlock` ve seans sonrası `syncEligibleStarUnlocks` kullanıyor (istemci eşiği tek kaynak değil).

#### Frontend — yapılanlar

* **F1 — LLM uçtan uca:** `fetchGalacticAdvice` → artık 404 almaz (backend ayakta + `GEMINI_API_KEY` gerekir); `CelebrationModal` galaktik tavsiye kutusu.
* **F4 — Gerçek OAuth:** `frontend/src/lib/oauth.ts` — `signInWithOAuthProvider`; `api.continueWithProvider` demo hesapları kaldırdı.
* **F5 / F6 / F13 — Auth:** `resetPassword`; kayıtta `displayName`, `birthdate`, `favoritePlanet`; gizlilik politikası linki; GitHub için bilgilendirme alert’i.
* **F7 — Onboarding:** `app/(onboarding)/star-pick.tsx`; `app/index.tsx` ve `app/(auth)/index.tsx` → `!user.onboardingCompleted` ise yıldız seçimi; `completeOnboarding(targetStarId)`.
* **F8 — Yıldızlar:** `GalaxyScreen` manuel “Aç (N ✦)”; `profileMapper` yalnızca `user_stars` (fallback: `luna`).
* **F9 — Rozetler:** `fetchUserData` → `user_badges`; `CelebrationModal` `newBadgeIds`; `ProfileScreen` `BADGES` kataloğu + `earnedBadgeIds`.
* **F10 — Auth guard:** `app/(tabs)/_layout.tsx` → `!user` / `!onboardingCompleted` redirect.
* **F3 — Prod env:** `app.config.ts` production’da boş Supabase → throw.
* **F12 — Profil navigasyonu:** Takımyıldızım → galaxy tab; ayarlar → privacy policy.
* **F14 — Temizlik:** `frontend/src/ui/` silindi.
* **F16 / F17:** `app.json` — `scheme: astrocus`, `expo-notifications` plugin, `ios.bundleIdentifier`; `frontend/eas.json` (EAS isteğe bağlı).
* **Paketler:** `expo-web-browser`, `expo-auth-session` (`package.json`).

#### Ortak dokümantasyon

* `docs/DEMO_VIDEO.md` — demo kayıt akışı kontrol listesi.
* `.env.staging.example` — backend + frontend env şablonu (platform agnostik).
* Kök `README.md` kullanıcı tarafından ekran görüntüleri odaklı bırakıldı; kurulum detayı `backend/README.md` ve plan notlarında.

---

#### Güncel açık riskler (teslim öncesi)

* 🟡 **Canlı API deploy** — platform henüz seçilmedi (Railway/Render dosyaları repoda yok); host seçildikten sonra env + `EXPO_PUBLIC_API_URL` güncellenmeli.
* 🟡 **Fiziksel cihaz E2E** — LAN IP ile seans → RPC → analytics → galaktik tavsiye tam regresyon önerilir.
* 🟡 **OAuth prod** — Supabase Auth redirect: `astrocus://auth/callback`; Google/Apple provider’lar panelde açık olmalı.
* 🟡 **Demo video** — `docs/DEMO_VIDEO.md` akışına göre henüz çekilmedi.
* 🟡 **Migration 002** — `npx supabase db push` ile `002_profile_extra_fields` uygulanmalı (kayıt alanları).
* 🟢 **LLM, rozetler, yıldız unlock API, CI** — kod tarafında tamamlandı.

**Sonraki adım (öneri):**
1. Supabase migration push + staging `.env` doldurma.
2. Seçilen host’ta API deploy (`npm run build` / `npm start`).
3. Expo’da `EXPO_PUBLIC_API_URL` ile gerçek cihaz testi.
4. Demo video.

---

### 2026-05-15 — Backend Mimarisinin Supabase ve Node.js ile Kurulumu

[cite_start]**Bağlam:** MVP aşamasındaki dosya tabanlı geçici veritabanı tamamen çöpe atıldı ve bitirme projesi gereksinimleri doğrultusunda [cite: 4] [cite_start]Supabase destekli, LLM entegrasyonuna hazır [cite: 10] [cite_start]ayrık backend mimarisi [cite: 11] inşa edildi.

**Yapılanlar:**
* **Veritabanı Şeması (Migration):** Supabase CLI ile `profiles`, `categories`, `sessions`, `stardust_ledger`, `stars`, `user_stars`, `badges` ve `user_badges` tabloları oluşturuldu ve `ON DELETE CASCADE` ilişkileri kuruldu.
* **RPC ve Oyunlaştırma (Gamification) Motoru:** Hileleri engellemek ve atomik işlemler yapmak için Supabase SQL Editor üzerinden `complete_focus_session` RPC fonksiyonu yazıldı. XP, yıldız tozu ve streak hesaplamaları veritabanı seviyesine çekildi.
* **Express API Kurulumu:** `/backend` klasörü altında Node.js + Express iskeleti oluşturuldu. `cors`, `dotenv`, `@supabase/supabase-js`, `@google/generative-ai` ve `zod` paketleri kurularak TypeScript konfigürasyonu tamamlandı.
* **Güvenlik Katmanı:** Çekirdek özellikleri destekleyecek API anahtarları (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) sadece `backend/.env` dosyasında izole edildi. [cite_start]Repoya `backend/.env.example` şablonu eklendi[cite: 28]. RLS (Row Level Security) kuralları Supabase panelinden aktif edildi.

**Sonraki Adım (2026-05-18 güncellemesi):** Yukarıdaki 2026-05-18 günlüğüne bakınız. AI endpoint ve hata sınırları kodda tamamlandı; staging/deploy kullanıcı platform seçimine bağlı.

---

### 2026-05-15 — Future Talent Modernizasyonu ve Klasör Yapılandırması

[cite_start]**Bağlam:** 8 haftalık proje gereksinimleri (etkileşimli uygulama, LLM API, ayrı FE/BE, canlı deploy, GitHub yapısı, zorunlu dokümanlar, demo video) [cite: 4, 10, 11, 12, 14, 25, 36] referans alınarak repo düzenlendi.

**Yapılanlar:**
* Monorepo mimarisine geçildi. [cite_start]Tüm Expo kodu `/frontend` klasörüne, veritabanı/API kodları `/backend` klasörüne taşındı[cite: 16, 17].
* Gereksiz dosyalar (eski `server/` klasörü, Prisma, `docker-compose.yml`) tamamen silinerek yapı sadeleştirildi.
* [cite_start]`prodocs/` klasörü altındaki zorunlu dokümanlar (`PRD.md`, `tech-stack.md`, `Plan.md`, vb.) mimariye uygun olarak revize edildi[cite: 19, 29, 30].
* CI/CD (GitHub Actions) iş akışları sadece frontend ve backend typecheck işlemlerini yapacak şekilde güncellendi.

**Açık Riskler (Teslim Öncesi — 2026-05-18 güncellemesi):**
* ~~🟡 LLM entegrasyonu kod bazında henüz tamamlanmadı~~ → **tamamlandı** (`POST /ai/galactic-advice`).
* 🟡 Mobil ↔ Supabase RPC + Express analytics + LLM birlikte gerçek cihaz / LAN üzerinde tam regresyon önerilir.
* 🟡 Canlı deploy (API yayını) yapılmadı; deploy platformu henüz seçilmedi.
* 🟡 Demo video henüz çekilmedi (`docs/DEMO_VIDEO.md` rehberi eklendi).
* 🟡 GitHub Actions CI repoya eklendi; ilk push’ta yeşil koşu doğrulanmalı.

---

### Yaklaşım (Approach)

* **Önce PRD/MVP’yi teknik olarak tutarlı hale getir, sonra MVP’yi “çalışan iskelet” olarak ayağa kaldır.**
* **MVP’de vendor/kütüphane kilidi yerine ürün davranışını sabitle, teknik detayları sade tut.**
* **Yapay Zeka Odaklılık:** LLM servisi (Gemini) uygulamanın çekirdek motivasyon mekaniğine API üzerinden entegre edilecek. Prompt injection koruması için anahtarlar backend'de izole kalacak.
* **Expo Go ile Hızlı İterasyon:** Mobil geliştirme sürecinde Expo SDK 54 ve dosya tabanlı routing için Expo Router kullanılarak ilerlenmektedir.
* **Veri Tutarlılığı:** Tüm kritik oyunlaştırma hesaplamaları (streak, XP, ödül) sunucu tarafında atomik RPC fonksiyonları ile doğrulanmaktadır.