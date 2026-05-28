## Astrocus — Progress Log

Bu dosya, projede şimdiye kadar yapılan işleri, **güncel bileşen envanterini**, tamamlanan / eksik kalemleri ve teslim öncesi riskleri tek yerde tutar.

> **Son güncelleme:** 2026-05-28  
> İlgili dokümanlar: `prodocs/PRD.md`, `tech-stack.md`, `Plan.md`, `DesignSystem.md`, `COMPLIANCE.md`  
> OAuth rehberi: `docs/oauth-expo-go.md` · Galaksi katalog planı: `docs/galaxy-catalog.md`

---

## Güncel özet (2026-05-28)

### MVP çekirdek döngü — kod durumu

| # | PRD özelliği | Kod | Uzak DB / deploy | Not |
|---|--------------|-----|------------------|-----|
| 01 | Odak zamanlayıcısı | ✅ | ✅ (001+) | 5–120 dk seçenekleri; pause 1×; arka plan 20 sn tolerans |
| 02 | Yıldız / Galaksi | ✅ | 🟡 003 gerekli | 13 takımyıldızı × 3 yıldız; manuel unlock |
| 03 | Yıldız tozu (2 ✦/dk) | ✅ | 🟡 003 gerekli | Ödül yalnızca `complete_focus_session` RPC |
| 04 | Gökyüzü haritası | ✅ | 🟡 003 | `GalaxyScreen` + `groupConstellationsForSky` (ayrı tab yok) |
| 05 | Kategori seçimi | ✅ | ✅ | 8 kategori; varsayılan `general` |
| 06 | Çıkış toleransı + uyarı | ✅ | ✅ | 10 sn yerel bildirim; 20 sn → seans `failed` |
| 07 | Günlük özet | ✅ | ✅ | `SessionScreen` + `ProfileScreen`; analytics API yedek |
| 08 | Streak | ✅ | ✅ | RPC + profil; analytics özeti |
| 09 | Hesap & profil | ✅ | ✅ | v1: e-posta + Google · v2: Apple (kod hazır) |
| 10 | Onboarding | ✅ | 🟡 003 | Slayt + takımyıldızı seçimi (`star-pick`) |
| 11 | Kutlama + LLM tavsiye | ✅ | 🟡 API + Gemini | `CelebrationModal` + `POST /ai/galactic-advice` |
| 12 | TR / EN | 🟡 | — | i18n altyapısı var; birçok ekranda sabit TR metin |

**Gösterge:** ✅ kodda tamam · 🟡 dış bağımlılık (migration, deploy, cihaz testi) · ❌ yapılmadı

### Yayın planı — v1 (ilk yükleme) vs v2 (ikinci güncelleme)

| | **v1 — Play / ilk mağaza sürümü** | **v2 — Sonraki güncelleme** |
|---|-----------------------------------|-----------------------------|
| **Platform** | Android (Google Play) öncelik; iOS mağazaya **henüz yok** | iOS App Store + gerekirse Play güncellemesi |
| **Giriş** | E-posta + şifre, **Google OAuth** | **Apple Sign In** (kod hazır; provider + mağaza build gerekir) |
| **Supabase** | Migration **002–006** (`db push` veya SQL Editor) | — |
| **Backend** | Express deploy + `EXPO_PUBLIC_API_URL` | Push bildirim worker (FCM) |
| **Apple kodu** | Repoda var; v1 build’de **zorunlu değil** (yalnızca iOS’ta buton görünür) | Supabase Apple provider + Apple Developer + EAS/TestFlight |

> Play’e ilk çıkışta Apple hesabı şart değil. iOS mağazaya çıkarken Apple Sign In ve native build (Expo Go değil) gerekir — **v2 kapsamı**.

### Teslim öncesi açık işler — v1 (öncelik)

1. [ ] Uzak Supabase’de migration **002–006** → aşağıdaki **db push** adımları
2. [ ] Google OAuth redirect doğrula (`docs/oauth-expo-go.md`)
3. [ ] Express API canlı deploy + `EXPO_PUBLIC_API_URL` (fiziksel cihaz / LAN)
4. [ ] E2E regresyon: seans → erken bitir → unlock → analytics → LLM
5. [ ] Google Play iç sürüm / kapalı test build (EAS)
6. [ ] Demo video
7. [ ] GitHub Actions ilk push’ta yeşil koşu doğrula

### v2 (Play sonrası / ikinci güncelleme)

1. [ ] Supabase Auth → Apple provider + Apple Developer Services ID
2. [ ] iOS production build (`eas build --platform ios`) + App Store Connect
3. [ ] Apple Sign In uçtan uca test (TestFlight)
4. [ ] Push bildirim gönderim servisi (FCM)

### Kapatılan kalemler (2026-05-28 düzeltme turu)

- [x] `SessionScreen` → **Seansı bitir** = `cancelSession()` (10 dk kuralı, RPC)
- [x] `api.unlockStar` → doğrudan Supabase `unlock_star` RPC (Express zorunlu değil)
- [x] `stars.controller` → tam RPC yanıtı (`constellationCompleted`, rozet, sıradaki takımyıldız)
- [x] Demo ekonomisi **2 ✦/dk** (`devDemo.ts`)
- [x] Offline seans **otomatik sync** (`@react-native-community/netinfo`)
- [x] **Apple Sign In** (iOS, `expo-apple-authentication`)
- [x] Onboarding `onboardingSeen` ↔ `onboardingCompleted` hizası
- [x] Seans süreleri PRD: `SESSION_DURATION_OPTIONS` [5, 15, 25, 45, 60, 90, 120]
- [x] CI: `.github/workflows/ci.yml`
- [x] `006_notification_logs_rls.sql`

---

## Uygulama mimarisi (çalışan hal)

```
app/ (Expo Router)
  index.tsx          → onboardingSeen / auth / star-pick / tabs yönlendirme
  (onboarding)/      → animasyonlu tanıtım + takımyıldızı seçimi
  (auth)/            → AuthScreen
  auth/callback.tsx  → OAuth deep link
  (tabs)/            → session | galaxy | profile (+ auth guard)
  legal/             → gizlilik, hesap silme

src/context/         → Auth + Session + UI (+ AppContext birleşik hook)
src/screens/         → tam ekran UI
src/components/      → yeniden kullanılabilir parçalar
src/services/        → API / mapper / katalog
src/lib/             → Supabase, OAuth, Apple, hatalar
src/shared/          → api, types, constants, i18n, theme, storage

backend/src/         → Express (LLM, analytics, unlock proxy, hesap silme)
backend/supabase/    → SQL migrations + RPC oyunlaştırma motoru
```

**Veri akışı (özet):** Kritik ödül / unlock / streak → **Supabase RPC**. Galaktik tavsiye ve analytics özeti → **Express** (JWT). İstemci ödül hesaplamaz (anti-cheat).

---

## Expo Router — rotalar

| Rota | Dosya | İşlev | Durum |
|------|--------|--------|--------|
| `/` | `app/index.tsx` | Bootstrap: `onboardingSeen` → auth → `star-pick` → tabs | ✅ |
| `/(onboarding)` | `app/(onboarding)/index.tsx` | 4 slaytlık `OnboardingScreen`; bitince `onboardingSeen` | ✅ |
| `/(onboarding)/star-pick` | `app/(onboarding)/star-pick.tsx` | İlk takımyıldızı; `start_constellation` RPC | ✅ (003 şart) |
| `/(auth)` | `app/(auth)/index.tsx` | Giriş / kayıt | ✅ |
| `/auth/callback` | `app/auth/callback.tsx` | Google OAuth dönüşü; profil retry | ✅ |
| `/(tabs)/session` | `app/(tabs)/session.tsx` | Odak seansı | ✅ |
| `/(tabs)/galaxy` | `app/(tabs)/galaxy.tsx` | Gökyüzü / takımyıldızı ilerlemesi | ✅ |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Profil ve ayarlar | ✅ |
| `/legal/privacy-policy` | `app/legal/privacy-policy.tsx` | KVKK metni | ✅ |
| `/legal/delete-account` | `app/legal/delete-account.tsx` | Hesap silme | ✅ |
| Tab guard | `app/(tabs)/_layout.tsx` | `!user` veya `!onboardingCompleted` → redirect | ✅ |

---

## Context katmanı

| Modül | Dosya | İşlev | Durum |
|-------|--------|--------|--------|
| **AppContext** | `context/AppContext.tsx` | `useAppContext()` — auth + session + UI tek yüzey | ✅ |
| **AuthContext** | `context/AuthContext.tsx` | Oturum, kayıt, Google/Apple, onboarding, unlock, silme | ✅ |
| **SessionContext** | `context/SessionContext.tsx` | Timer, seans RPC, offline kuyruk, analytics yenileme, NetInfo sync | ✅ |
| **UIContext** | `context/UIContext.tsx` | Dil, kutlama modal state | ✅ |
| **devDemo** | `context/auth/devDemo.ts` | `demo` / `demo@astrocus.dev` — 2 ✦/dk simülasyon | ✅ |
| **stardust** | `context/session/stardust.ts` | Günlük özet (yerel aggregation; ödül hesabı yok) | ✅ |
| **dateKey** | `context/session/dateKey.ts` | Tarih anahtarı (streak / günlük) | ✅ |

### AuthContext — public API

| Metod | Açıklama |
|--------|----------|
| `login` / `register` | Supabase e-posta; demo credentials (__DEV__) |
| `continueWithGoogle` | `lib/oauth.ts` → `loadAuthPayloadFromSession` |
| `continueWithApple` | `lib/appleAuth.ts` → `signInWithIdToken` (iOS) |
| `completeOnboarding(constellationId)` | `start_constellation` RPC + `onboardingSeen` |
| `unlockStar(starId)` | `api.unlockStar` → RPC; tamamlama kutlaması |
| `updateProfile` / `refreshUser` / `logout` / `deleteAccount` | Profil ve hesap yaşam döngüsü |

### SessionContext — public API

| Metod / state | Açıklama |
|---------------|----------|
| `sessionState` | `idle` \| `running` \| `paused` \| `completed` \| `failed` |
| `startSession` / `pauseSession` / `resumeSession` | Timer + 1 pause limiti |
| `cancelSession` | Erken bitir; `cancel_focus_session` (≥10 dk kısmi ödül) |
| `resetSession` | Yerel sıfırlama (başarısız seans kartı vb.) |
| `finalizeSession` | Tamamlanınca `complete_focus_session` + kutlama + LLM |
| `syncOfflineQueue` | `pendingSessions` → RPC `p_is_offline: true` |
| NetInfo effect | Online olunca otomatik `syncOfflineQueue` |
| `analyticsSummary` | Express `/analytics/summary` (demo’da null) |

---

## Ekranlar (`src/screens/`)

| Ekran | Dosya | İşlev | Durum | Eksik / not |
|-------|--------|--------|--------|-------------|
| **OnboardingScreen** | `OnboardingScreen.tsx` | SVG animasyonlu 4 slayt | ✅ | DB onboarding değil; `onboardingSeen` |
| **AuthScreen** | `AuthScreen.tsx` | Login, kayıt, Google, Apple (iOS), şifre sıfırlama | ✅ | `birthdate` / `favoritePlanet` formda yok |
| **SessionScreen** | `SessionScreen.tsx` | Süre/kategori, timer, haftalık çubuklar, kutlama | ✅ | Bazı metinler sabit TR |
| **GalaxyScreen** | `GalaxyScreen.tsx` | Takımyıldızı kartları, sıralı unlock, toast, haptics | ✅ | Katalog statik `constants.ts` |
| **ProfileScreen** | `ProfileScreen.tsx` | Özet, rozetler, avatar, dil, offline sync butonu | ✅ | Analytics API yoksa yerel yedek |
| **PrivacyPolicyScreen** | `PrivacyPolicyScreen.tsx` | Yasal metin | ✅ | — |
| **DeleteAccountScreen** | `DeleteAccountScreen.tsx` | `DELETE` account API + çıkış | ✅ | — |

### SessionScreen — davranış detayı

- Süre: `SESSION_DURATION_OPTIONS` = 5, 15, 25, 45, 60, 90, 120 dk
- Aktif seans: duraklat / devam; **Seansı bitir** → onay → `cancelSession()`
- Arka plan > 20 sn → `failed` + kullanıcı mesajı
- Tamamlanınca → otomatik `complete_focus_session` + `CelebrationModal`
- Üst bant: `StardustPill`; ipucu: `stardustPerMinute` (2 ✦/dk)

### GalaxyScreen — davranış detayı

- Sıralama: `constellationCatalog.ts` (tamamlanan → aktif → sıradaki → kilitli)
- Yalnızca **aktif** takımyıldızında sıradaki yıldıza tap ile unlock
- Maliyet: `getStarCostInfo` (100 / 350 / 800 ✦) — RPC `compute_star_cost` ile uyumlu
- Tamamlanınca: toast + haptics; RPC sonrası profil yenilenir

---

## Bileşenler (`src/components/`)

| Bileşen | İşlev | Kullanıldığı yer | Durum |
|---------|--------|------------------|--------|
| `CelebrationModal` | Seans sonu ✦, XP, streak, rozet, LLM kutusu, `pendingSync` | SessionScreen | ✅ |
| `StardustPill` | Header stardust bakiyesi | Session, Galaxy, Profile | ✅ |
| `GlassToast` | Galaksi unlock / hata mesajları | GalaxyScreen | ✅ |
| `ProgressRing` | Aktif seans dairesel ilerleme | SessionScreen | ✅ |
| `CelestialVisual` | Yıldız / gezegen / galaksi görseli | Session, Galaxy | ✅ |
| `StarfieldBackground` | Parallax yıldız alanı | Çoğu ekran | ✅ |
| `SpaceScene` | Auth hero uzay sahnesi | AuthScreen | ✅ |
| `SurfaceCard` | Cam kart yüzeyi | Session, Galaxy, Profile | ✅ |
| `GradientButton` | Birincil CTA | Auth, onboarding, profile | ✅ |
| `TextField` | Form girişi | AuthScreen | ✅ |
| `AstroAlertModal` | OAuth / uyarı diyalogu | AuthScreen | ✅ |

---

## Servisler & lib

| Modül | Dosya | İşlev | Durum |
|-------|--------|--------|--------|
| **api** | `shared/api.ts` | Supabase auth, RPC seans/unlock/onboarding, `fetchUserData`, demo | ✅ |
| **config** | `shared/config.ts` | `getApiUrl()` — Metro LAN / ngrok | ✅ |
| **profileMapper** | `services/profileMapper.ts` | DB satır → `User`, `SessionRecord`, `AuthPayload` | ✅ |
| **constellationCatalog** | `services/constellationCatalog.ts` | İlerleme listesi, gökyüzü grupları, sıralama | ✅ |
| **analyticsApi** | `services/analyticsApi.ts` | `GET /analytics/summary` | ✅ (API gerekli) |
| **galacticAdvice** | `services/galacticAdvice.ts` | `POST /ai/galactic-advice` | ✅ (API + Gemini) |
| **starsApi** | `services/starsApi.ts` | Express unlock proxy (opsiyonel; mobil RPC kullanır) | ✅ |
| **accountApi** | `services/accountApi.ts` | Hesap silme | ✅ |
| **oauth** | `lib/oauth.ts` | Google `signInWithOAuth` + deep link tamamlama | ✅ |
| **appleAuth** | `lib/appleAuth.ts` | iOS Apple → Supabase `signInWithIdToken` | ✅ (native build) |
| **authErrors** | `lib/authErrors.ts` | Supabase + OAuth hata eşlemesi | ✅ |
| **supabase** | `lib/supabase.ts` | İstemci | ✅ |
| **notifications** | `shared/notifications.ts` | Arka plan 10 sn uyarı (yerel) | ✅ |
| **storage** | `shared/storage.ts` | SecureStore + AsyncStorage | ✅ |
| **analytics** | `shared/analytics.ts` | Olay kuyruğu (yerel) | ✅ |
| **i18n** | `shared/i18n.ts` | TR/EN anahtarlar | 🟡 kısmi kullanım |
| **constants** | `shared/constants.ts` | Kategoriler, takımyıldızları, legacy + 39 yıldız | ✅ |
| **types** | `shared/types.ts` | Domain tipleri | ✅ |
| **theme** | `shared/theme.ts` | Renk, tipografi, spacing | ✅ |

---

## Backend Express (`backend/src/`)

| Endpoint / modül | İşlev | Durum | Mobil bağımlılık |
|------------------|--------|--------|------------------|
| `GET /health` | Supabase ping + Gemini env | ✅ | — |
| `GET /analytics/summary` | Haftalık dk, kategori, streak | ✅ | Session / Profile |
| `POST /stars/unlock` | JWT ile `unlock_star` proxy (tam yanıt) | ✅ | Mobil doğrudan RPC kullanır |
| `POST /ai/galactic-advice` | Gemini motivasyon metni | ✅ | Kutlama modalı |
| `DELETE /account` | Soft delete akışı | ✅ | DeleteAccountScreen |
| `galacticAdvice.ts` | Prompt + timeout | ✅ | — |
| `accountDeletion.ts` | Silme mantığı | ✅ | Vitest |
| Rate limit / helmet / SIGTERM | Üretim sertleştirme | ✅ | — |

**Scriptler:** `npm run dev` · `build` · `start` · `test` · `typecheck`

---

## Supabase `db push` — adım adım (Windows)

Migration dosyaları: `backend/supabase/migrations/` (001 → 006 sırayla uygulanır).

### Ön koşul

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen → **Settings → General** → **Reference ID** (`abcdefghijklmnop` gibi) not al.
2. Supabase CLI (bir kez):

```powershell
npm install -g supabase
```

### Bağlan ve gönder

Proje kökünden **backend** klasörüne gir (içinde `supabase/` klasörü olmalı):

```powershell
cd c:\Users\lleda\astrocus\backend
supabase login
supabase link --project-ref BURAYA_REFERENCE_ID
supabase db push
```

- `link` sırasında veritabanı şifresi istenir → Dashboard **Settings → Database** → password.
- `db push`, henüz uzakta uygulanmamış migration’ları sırayla çalıştırır.

### Doğrulama

Dashboard → **Table Editor**: `constellations`, `user_constellations` görünmeli.  
**SQL** → fonksiyonlar: `start_constellation`, `unlock_star`, `cancel_focus_session` listelenmeli.

Uygulamada: yeni kullanıcı → onboarding takımyıldızı seçimi → hata yoksa **003** başarılı.

### `db push` çalışmazsa (alternatif)

Dashboard → **SQL Editor** → her dosyayı **sırayla** yapıştırıp çalıştır:

1. `001_initial_schema.sql` *(uzak DB zaten doluysa atla)*
2. `002_profile_extra_fields.sql`
3. `003_constellation_gamification.sql` **← kritik**
4. `004_handle_new_user_resilient.sql`
5. `005_notification_logs.sql`
6. `006_notification_logs_rls.sql`

> Uzak DB’de eski `complete_focus_session` (10 ✦/dk) varsa **003** mutlaka çalışmalı; yoksa ekonomi ve Galaksi kırılır.

### Sık hatalar

| Hata | Çözüm |
|------|--------|
| `project not linked` | `supabase link --project-ref ...` tekrar |
| `schema cache` / `start_constellation` yok | 003 uygulanmamış → `db push` veya SQL Editor |
| Migration çakışması | Dashboard → migration geçmişi; gerekirse destek / tek dosya SQL ile ilerle |

---

## Supabase — migrations & RPC

| Dosya | İçerik | Uzakta uygulandı mı? |
|-------|--------|---------------------|
| `001_initial_schema.sql` | Temel tablolar, RLS, `complete_focus_session` (10 ✦/dk eski) | 🟡 kullanıcı ortamına bağlı |
| `002_profile_extra_fields.sql` | `display_name`, `birthdate`, `favorite_planet` | 🟡 |
| `003_constellation_gamification.sql` | 13 takımyıldızı, 39 yıldız, 2 ✦/dk, `cancel_focus_session`, `unlock_star` | 🟡 **kritik** |
| `004_handle_new_user_resilient.sql` | Profil trigger `ON CONFLICT` | 🟡 |
| `005_notification_logs.sql` | `notification_logs` tablosu | 🟡 |
| `006_notification_logs_rls.sql` | RLS select own | 🟡 |

### RPC özeti (authenticated)

| RPC | İşlev |
|-----|--------|
| `complete_focus_session` | Seans kaydı, XP, stardust (2 ✦/dk + bonus), streak, rozetler |
| `cancel_focus_session` | Erken bitir; ≥10 dk odak → kısmi stardust |
| `unlock_star` | Manuel yıldız açma, dinamik maliyet, takımyıldızı tamamlama |
| `start_constellation` | Onboarding; `active_constellation_id` + `onboarding_completed` |
| `compute_star_cost` / `get_completed_constellation_count` | Dinamik fiyatlandırma |

**Manuel script:** `backend/supabase/scripts/apply-onboarding-minimal.sql`

---

## Kimlik doğrulama matrisi

| Yöntem | Kod | Yapılandırma |
|--------|-----|--------------|
| E-posta + şifre | ✅ | Supabase Auth |
| Google OAuth | ✅ | Supabase + Google Cloud + `docs/oauth-expo-go.md` |
| Apple Sign In | ✅ kod (iOS) | **v2** — Supabase + Apple Developer + mağaza build |
| Demo (`demo` / `demo1234`) | ✅ __DEV__ | Offline; RPC yok |

---

## Bildirimler

| Katman | Durum |
|--------|--------|
| Yerel uyarı (10 sn arka plan) | ✅ `expo-notifications` |
| `profiles.fcm_token` / `notifications_enabled` | 🟡 manuel Supabase |
| `notification_logs` tablosu + RLS | ✅ migration 005–006 |
| FCM kayıt UI + push gönderim worker | ❌ yapılmadı |

---

## CI / kalite

| Kontrol | Durum |
|---------|--------|
| `.github/workflows/ci.yml` | ✅ backend test+build, frontend typecheck |
| `frontend` `npm run typecheck` | ✅ |
| `backend` `npm test` | ✅ (galacticAdvice, accountDeletion) |
| Fiziksel cihaz E2E checklist | 🟡 manuel |
| Demo video | 🟡 |

---

## Tarihçe (özet günlükler)

### 2026-05-28 — Çekirdek eksikler kapatma + envanter

**Bağlam:** Kod tabanı denetimi sonrası P0/P1 maddeler tek turda kapatıldı; Progress dosyası tam bileşen envanteri ile güncellendi.

**Kod değişiklikleri:**
* `SessionScreen`: Seansı bitir → `cancelSession()`; süreler 5–120; 2 ✦/dk ipucu
* `api.unlockStar`: doğrudan Supabase RPC; anlamlı hata mesajları
* `stars.controller` + `types/api.ts`: tam unlock yanıtı
* `devDemo.ts`: 2 ✦/dk
* `SessionContext`: NetInfo ile otomatik offline sync
* `appleAuth.ts`, `AuthScreen`, `AuthContext`: Apple Sign In
* `app/index.tsx` + `completeOnboarding`: onboarding bayrak hizası
* `006_notification_logs_rls.sql`
* `.github/workflows/ci.yml`
* Paketler: `expo-apple-authentication`, `@react-native-community/netinfo`

---

### 2026-05-28 — Bildirim log tablosu

* `005_notification_logs.sql` — `notification_logs` (id, user_id, message, sent_at, type)
* Kullanıcı `fcm_token` / `notifications_enabled` alanlarını panelde eklemişti

---

### 2026-05-21 — Takımyıldızı gamification, Google OAuth, sadeleştirme

* Migration **003**: 13 takımyıldızı, 39 yıldız, 2 ✦/dk, `cancel_focus_session`, `unlock_star`
* `GalaxyScreen`, `star-pick`, `constellationCatalog`, `GlassToast`, `StardustPill`
* Google OAuth Expo Go redirect düzeltmeleri; `authErrors.ts` tek dosya
* Kaldırılanlar: `syncEligibleStarUnlocks`, `oauthErrors.ts`, gereksiz OAuth proxy katmanları

---

### 2026-05-18 — Backend & frontend eksikler planı

* `POST /ai/galactic-advice`, rozetler, auth guard, `star-pick`, şifre sıfırlama, Vitest, README
* ~~CI~~ → 2026-05-28’de workflow eklendi

---

### 2026-05-15 — Supabase + Express kurulumu · FE–BE entegrasyonu · Monorepo

* İlk şema + `complete_focus_session` RPC
* Seans ödüllerinin RPC’ye taşınması; analytics API; offline kuyruk
* `/frontend` + `/backend` monorepo; eski Prisma/server kaldırıldı

---

## Yaklaşım (Approach)

* **Önce PRD/MVP’yi teknik olarak tutarlı hale getir, sonra çalışan iskelet.**
* **Anti-cheat:** Stardust, XP, streak, unlock → Supabase RPC; istemci yalnızca sunar.
* **LLM:** Anahtarlar backend’de; mobil `galacticAdvice` servisi.
* **Expo SDK 54 + Expo Router** — hızlı iterasyon; Apple için native build gerekir.
* **Manuel yıldız unlock** — otomatik unlock kaldırıldı (ürün kuralı).
* **İleride:** Yıldız kataloğunu DB’den çekme (`docs/galaxy-catalog.md`).

---

*Astrocus Progress — son kod envanteri 2026-05-28*
