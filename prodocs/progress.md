## Astrocus — Progress Log

Bu dosya, projede şimdiye kadar yapılan işleri, **güncel bileşen envanterini**, tamamlanan / eksik kalemleri ve teslim öncesi riskleri tek yerde tutar.

> **Son güncelleme:** 2026-06-05 (ürün kararları + yayın bloklayıcıları)  
> İlgili dokümanlar: `prodocs/PRD.md`, `tech-stack.md`, `plan.md`, `DesignSystem.md`  
> OAuth rehberi: `docs/oauth-expo-go.md` · Galaksi katalog planı: `docs/galaxy-catalog.md`

---

## Güncel özet (2026-06-05)

### MVP çekirdek döngü — kod durumu

| # | PRD özelliği | Kod | Uzak DB / deploy | Not |
|---|--------------|-----|------------------|-----|
| 01 | Odak zamanlayıcısı | ✅ | ✅ | Quick preset + özel süre; **duraklatma 5 dk iptali yapılmayacak** (karar) |
| 02 | Yıldız / Galaksi | ✅ | ✅ | **Takımyıldızı kartları** (PRD gökyüzü haritası yerine — tasarım kararı) |
| 03 | Yıldız tozu (2 ✦/dk) | ✅ | ✅ | **Manuel unlock**; saat dilimi bonusu v1.1 |
| 04 | Gökyüzü / galaksi UI | ✅ | ✅ | `GalaxyScreen` + 67 yıldız DB katalog |
| 05 | Kategori seçimi | ✅ | ✅ | 8 kategori |
| 06 | Çıkış toleransı + uyarı | ✅ | ✅ | 10 sn yerel bildirim; 20 sn → seans `failed` |
| 07 | Günlük özet | ✅ | ✅ | `DailyGoalCard` + RPC; geçmiş sekmesi v1.1 |
| 08 | Streak | ✅ | ✅ | RPC + profil; longest streak UI v1.1 |
| 09 | Hesap & profil | ✅ | ✅ | v1: e-posta + Google · v2: Apple (kod hazır) |
| 10 | Onboarding | ✅ | ✅ | **4 slayt** + `star-pick`; skip/varsayılan yıldız yok (karar) |
| 11 | Kutlama + LLM tavsiye | ✅ | 🟡 deploy | `CelebrationHost` + Express `/ai/galactic-advice` |
| 12 | TR / EN | ✅ | — | Ana ekranlar i18n |
| 13 | Haftalık AI rapor | ✅ | 🟡 cron | Edge Function **deployed**; haftalık cron secret doğrulanmalı |
| 14 | Günlük hedef + ödül | ✅ | ✅ | RPC'ler production'da |
| 15 | Rozetler ekranı | ✅ | ✅ | `/badges` — `BadgesScreen` |
| 16 | Ayarlar ekranı | ✅ | ✅ | `/settings` — dil, avatar, offline sync, çıkış |

**Gösterge:** ✅ kodda tamam · 🟡 dış bağımlılık (migration, deploy, cihaz testi) · ❌ yapılmadı

### Son commit'ler (main, temiz working tree)

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-06-03 | `0c97f5f` | UI iyileştirmeleri |
| 2026-06-03 | `6f3f694` | UI/UX düzenlemeler |
| 2026-06-01 | `8c56bd9` | Odak/seans sayfaları; AI entegrasyonu |
| 2026-05-30 | `e03e1b8` | Onboarding tamamlandı |
| 2026-05-28 | `7f6f0cb` | Dil paketleri güncellendi |
| 2026-05-28 | `db43407` | Gökyüzü oyunlaştırması dinamik (DB katalog) |

### Yayın planı — v1 (ilk yükleme) vs v2 (ikinci güncelleme)

| | **v1 — Play / ilk mağaza sürümü** | **v2 — Sonraki güncelleme** |
|---|-----------------------------------|-----------------------------|
| **Platform** | Android (Google Play) öncelik; iOS mağazaya **henüz yok** | iOS App Store + gerekirse Play güncellemesi |
| **Giriş** | E-posta + şifre, **Google OAuth** | **Apple Sign In** (kod hazır; provider + mağaza build gerekir) |
| **Supabase** | Migration **001–016** ✅ (2026-06-05 doğrulandı) | Haftalık rapor cron (`CRON_SECRET`) |
| **Backend** | Express deploy + `GEMINI_API_KEY` + `EXPO_PUBLIC_API_URL` | Push bildirim worker (FCM) |
| **EAS** | `eas.json` preview (APK) + production profilleri hazır | iOS production build |
| **Apple kodu** | Repoda var; v1 build'de **zorunlu değil** | Supabase Apple provider + Apple Developer |

> Play'e ilk çıkışta Apple hesabı şart değil. iOS mağazaya çıkarken Apple Sign In ve native build (Expo Go değil) gerekir — **v2 kapsamı**.

### Ürün kararları — yapılmayacak / tasarım sapması

Bkz. `prodocs/PRD.md` §3.3. Özet:

- ❌ Duraklatma > 5 dk seans iptali
- ❌ Onboarding skip + varsayılan yıldız
- ❌ Seans ekranında yıldız görseli
- ❌ Otomatik yıldız unlock (manuel)
- ✅ Takımyıldızı kartları (PRD gökyüzü simülasyonu yerine)
- ✅ 4 slayt onboarding (PRD 3 ekran yerine)
- 🟡 v1.1: longest streak UI, streak mesajı, saat dilimi bonusu (görünür rozet), geçmiş sekmesi

### Teslim öncesi açık işler — v1 (öncelik)

**Altyapı (kritik)**

1. [x] Uzak Supabase migration **001–016** — `supabase migration list` ile doğrulandı (2026-06-05)
2. [x] Edge Function `generate-weekly-reports` — **ACTIVE** (v8, 2026-06-03)
3. [ ] Haftalık rapor **cron** — `CRON_SECRET` + `x-cron-secret` header (`docs/weekly-reports-cron.md`)
4. [ ] **Express API canlı deploy** + production `GEMINI_API_KEY` (`docs/backend-deploy.md`)
5. [ ] Production `EXPO_PUBLIC_API_URL` (EAS secrets / build env)
6. [ ] **Ürün analitiği** — kod hazır (`trackEvent` → PostHog HTTP); `EXPO_PUBLIC_POSTHOG_API_KEY` production'da set et
7. [ ] **Crash izleme** — kod hazır (`initMonitoring`); `npx expo install @sentry/react-native` + `EXPO_PUBLIC_SENTRY_DSN`
8. [x] **GitHub Actions CI** — `.github/workflows/ci.yml`
9. [ ] Google OAuth redirect doğrula (`docs/oauth-expo-go.md`)

**Yayın**

10. [ ] E2E smoke test (fiziksel cihaz)
11. [ ] Google Play kapalı test — `eas build --profile preview`
12. [ ] Demo video (`docs/demo-video-outline.md`)

### v2 (Play sonrası / ikinci güncelleme)

1. [ ] Supabase Auth → Apple provider + Apple Developer Services ID
2. [ ] iOS production build (`eas build --platform ios`) + App Store Connect
3. [ ] Apple Sign In uçtan uca test (TestFlight)
4. [ ] Push bildirim gönderim servisi (FCM)

### Kapatılan kalemler (2026-05-28 → 2026-06-05)

- [x] Gökyüzü katalog **DB'den** (`skyCatalog.ts` + migration 008) — statik 39 yıldız kaldırıldı
- [x] Takımyıldızı tier sistemi → `unlock_order` (009)
- [x] Erken bitir dinamik eşik + aktif odak süresi (010, 015)
- [x] UUID/RLS düzeltmeleri (011); kategori slug lookup (012)
- [x] Haftalık AI rapor tablosu + istemci UI (013, `useWeeklyReport`)
- [x] Günlük hedef sistemi (`DailyGoalCard`, 016 RPC'ler)
- [x] Onboarding yeniden tasarım (PNG görseller, animasyonlar, i18n)
- [x] SessionScreen büyük UI revizyonu (preset'ler, haftalık yıldızlar, rapor kartı)
- [x] GalaxyScreen Skia sahne + filtre + `ConstellationCard` / `StarCard`
- [x] ProfileScreen ayrıştırma: istatistikler profilde, ayarlar `/settings`
- [x] `BadgesScreen` + `/badges` rotası
- [x] `NotificationContext` — global toast / alert / confirm
- [x] `CelebrationHost` — tab geçişlerinde kutlama modalı kalır
- [x] E-posta deep link: `/verify-success`, `/reset-password`
- [x] `eas.json` build profilleri (development / preview APK / production)
- [x] Tipografi: DM Sans, Outfit, Space Mono (`expo-font`)
- [x] TR/EN i18n — ana ekranlar ve bileşenler büyük ölçüde çevrildi

---

## Uygulama mimarisi (çalışan hal)

```
frontend/ (Expo Router — monorepo kök altında)
  app/
    index.tsx              → onboardingSeen / auth / star-pick / tabs
    _layout.tsx            → font yükleme, CelebrationHost, skyCatalog preload
    (onboarding)/          → animasyonlu tanıtım + star-pick
    (auth)/                → AuthScreen
    auth/callback.tsx      → OAuth deep link
    (tabs)/                → session | galaxy | profile (+ auth guard)
    settings.tsx           → ayarlar (profilden ayrıldı)
    badges.tsx             → rozet koleksiyonu
    reset-password.tsx     → şifre sıfırlama deep link
    verify-success.tsx     → e-posta doğrulama sonrası
    legal/                 → gizlilik, hesap silme, acknowledgments

  src/context/             → Auth + Session + UI + Notification (+ AppContext)
  src/screens/             → tam ekran UI
  src/components/          → ui/, galaxy/, session/, profile/, settings/, badges/
  src/services/            → API / mapper / katalog / analytics
  src/hooks/               → useWeeklyReport, useDeepLink
  src/lib/                 → Supabase, OAuth, Apple, dailyGoalStorage
  src/shared/              → api, types, constants, i18n, theme, storage

backend/src/               → Express (LLM, analytics, unlock proxy, hesap silme)
backend/supabase/
  migrations/              → 001–016 SQL
  functions/               → generate-weekly-reports (Edge Function, OpenRouter)
```

**Veri akışı (özet):** Kritik ödül / unlock / streak / günlük hedef → **Supabase RPC**. Galaktik tavsiye → **Express + Gemini**. Haftalık rapor → **Edge Function + OpenRouter** → `weekly_reports` tablosu. İstemci ödül hesaplamaz (anti-cheat).

---

## Expo Router — rotalar

| Rota | Dosya | İşlev | Durum |
|------|--------|--------|--------|
| `/` | `app/index.tsx` | Bootstrap: Logo splash → onboarding / auth / star-pick / tabs | ✅ |
| `/(onboarding)` | `app/(onboarding)/index.tsx` | 4 slaytlık `OnboardingScreen` (PNG + animasyon) | ✅ |
| `/(onboarding)/star-pick` | `app/(onboarding)/star-pick.tsx` | İlk takımyıldızı; `start_constellation` RPC | ✅ |
| `/(auth)` | `app/(auth)/index.tsx` | Giriş / kayıt / Google / Apple | ✅ |
| `/auth/callback` | `app/auth/callback.tsx` | Google OAuth dönüşü | ✅ |
| `/(tabs)/session` | `app/(tabs)/session.tsx` | Odak seansı (yeni UI) | ✅ |
| `/(tabs)/galaxy` | `app/(tabs)/galaxy.tsx` | Gökyüzü / takımyıldızı ilerlemesi | ✅ |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Profil özeti + günlük hedef | ✅ |
| `/settings` | `app/settings.tsx` | Dil, avatar, offline sync, çıkış | ✅ |
| `/badges` | `app/badges.tsx` | Rozet koleksiyonu | ✅ |
| `/reset-password` | `app/reset-password.tsx` | Supabase recovery deep link | ✅ |
| `/verify-success` | `app/verify-success.tsx` | E-posta doğrulama sonrası | ✅ |
| `/legal/privacy-policy` | `app/legal/privacy-policy.tsx` | KVKK metni | ✅ |
| `/legal/delete-account` | `app/legal/delete-account.tsx` | Hesap silme | ✅ |
| `/legal/acknowledgments` | `app/legal/acknowledgments.tsx` | Atıflar / lisanslar | ✅ |
| Tab guard | `app/(tabs)/_layout.tsx` | `!user` veya `!onboardingCompleted` → redirect | ✅ |

---

## Context katmanı

| Modül | Dosya | İşlev | Durum |
|-------|--------|--------|--------|
| **AppContext** | `context/AppContext.tsx` | `useAppContext()` — auth + session + UI + notification tek yüzey | ✅ |
| **AuthContext** | `context/AuthContext.tsx` | Oturum, kayıt, Google/Apple, onboarding, unlock, silme | ✅ |
| **SessionContext** | `context/SessionContext.tsx` | Timer, seans RPC, offline kuyruk, analytics, NetInfo sync | ✅ |
| **UIContext** | `context/UIContext.tsx` | Dil, kutlama modal state | ✅ |
| **NotificationContext** | `context/NotificationContext.tsx` | Global `showToast`, `showAlert`, `showConfirm` | ✅ |
| **devDemo** | `context/auth/devDemo.ts` | `demo` / `demo@astrocus.dev` — 2 ✦/dk simülasyon | ✅ |
| **stardust** | `context/session/stardust.ts` | Günlük özet (yerel aggregation) | ✅ |
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
| `cancelSession` | Erken bitir; `cancel_focus_session` (dinamik eşik + `focused_minutes`) |
| `resetSession` | Yerel sıfırlama |
| `finalizeSession` | Tamamlanınca `complete_focus_session` + kutlama + LLM |
| `syncOfflineQueue` | `pendingSessions` → RPC `p_is_offline: true` |
| NetInfo effect | Online olunca otomatik `syncOfflineQueue` |
| `analyticsSummary` | Express `/analytics/summary` (demo'da null) |

---

## Ekranlar (`src/screens/`)

| Ekran | Dosya | İşlev | Durum | Not |
|-------|--------|--------|--------|-----|
| **OnboardingScreen** | `OnboardingScreen.tsx` | 4 slayt PNG + twinkle animasyon | ✅ | i18n tam |
| **AuthScreen** | `AuthScreen.tsx` | Login, kayıt, Google, Apple, şifre sıfırlama | ✅ | KVKK checkbox |
| **SessionScreen** | `SessionScreen.tsx` | Preset'ler, süre/kategori, timer, haftalık yıldızlar | ✅ | `WeeklyReportCard` entegre |
| **GalaxyScreen** | `GalaxyScreen.tsx` | DB katalog, filtre, sıralı unlock, Skia sahne | ✅ | 67 yıldız |
| **ProfileScreen** | `ProfileScreen.tsx` | Özet, günlük hedef, kategori dağılımı, nav | ✅ | Ayarlar ayrı ekran |
| **SettingsScreen** | `SettingsScreen.tsx` | Dil, avatar, offline sync, çıkış | ✅ | `/settings` |
| **BadgesScreen** | `BadgesScreen.tsx` | Kazanılan / kilitli rozetler | ✅ | `/badges` |
| **PrivacyPolicyScreen** | `PrivacyPolicyScreen.tsx` | Yasal metin | ✅ | — |
| **DeleteAccountScreen** | `DeleteAccountScreen.tsx` | `DELETE` account API + çıkış | ✅ | — |
| **AcknowledgmentsScreen** | `AcknowledgmentsScreen.tsx` | Üçüncü taraf atıflar | ✅ | — |

### SessionScreen — davranış detayı

- Quick preset'ler: Nefes (10), Pomodoro (25), Flow (45), Deep (60)
- Süre bölümü: 15, 30, 90, 120 + `CustomDurationSheet` (slider)
- Kategoriler: 8 adet, i18n etiketli
- Aktif seans: duraklat / devam; **Seansı bitir** → onay → `cancelSession()`
- Arka plan > 20 sn → `failed` + kullanıcı mesajı
- Tamamlanınca → `CelebrationHost` üzerinden kutlama + LLM
- Haftalık odak yıldızları (`WeekDayStars`) + `WeeklyReportCard`

### GalaxyScreen — davranış detayı

- Katalog: `loadSkyCatalog()` → Supabase `constellations` + `stars` (67 gök cismi)
- Filtre: all / active / completed
- Sıralama: `sortConstellationsForUser` + `unlock_order`
- Yalnızca aktif takımyıldızında sıradaki yıldıza tap ile unlock
- Maliyet: `starUnlockCost` — DB `required_stardust` alanı
- Tamamlanınca: toast + haptics

### ProfileScreen — davranış detayı

- `DailyGoalCard`: hedef seç (15–240 dk), ilerleme, ödül claim
- `CategoryDistribution`: haftalık kategori pasta grafiği
- `WeeklyReportCard` + modal
- Nav: Rozetler, Ayarlar, Gizlilik, Hesap silme

---

## Bileşenler (`src/components/`)

### Genel / layout

| Bileşen | İşlev | Durum |
|---------|--------|--------|
| `CelebrationHost` | Root kutlama overlay (tab geçişinde kalır) | ✅ |
| `CelebrationModal` | Seans sonu ✦, XP, streak, rozet, LLM | ✅ |
| `GlassToast` | Galaksi / global toast | ✅ |
| `AstroAlertModal` / `AstroConfirmModal` | Onay / uyarı diyalogları | ✅ |
| `TabScreenScaffold` / `SubScreenScaffold` | Tab / alt ekran iskeleti | ✅ |
| `ScreenContentColumn` | Responsive içerik sütunu | ✅ |
| `CosmicScreenBackground` / `GalaxyBackground` / `StarfieldBackground` | Arka plan katmanları | ✅ |
| `SurfaceCard` / `AppCard` / `Card` | Kart yüzeyleri | ✅ |
| `GradientButton` | Birincil CTA | ✅ |
| `Logo` | Marka logosu (splash) | ✅ |
| `UserAvatar` | Preset avatar seçimi | ✅ |

### UI primitives (`components/ui/`)

| Bileşen | İşlev |
|---------|--------|
| `AppText` | Tipografi wrapper (font scale clamp) |
| `PillChip` / `StarDustChip` | Seçim chip'leri |
| `ProgressBar` | İlerleme çubuğu |
| `LanguageToggle` | TR/EN geçiş |
| `IconTitleRow` | İkon + başlık satırı |

### Galaxy (`components/galaxy/`)

| Bileşen | İşlev |
|---------|--------|
| `SkySection` | Gökyüzü bölümü (tamamlanan / yolculuk) |
| `ConstellationCard` | Takımyıldızı kartı + ilerleme |
| `StarCard` | Yıldız kartı + unlock CTA |
| `ConstellationFilterBar` | all / active / completed filtre |
| `buildGalaxyScene` / `galaxySceneCache` | Skia sahne oluşturma + önbellek |
| `preloadGalaxyScene` | Session tab'dan arka planda preload |

### Session (`components/session/`)

| Bileşen | İşlev |
|---------|--------|
| `FocusSectionCard` | Süre / kategori seçim kartı |
| `WeekDayStars` | Haftalık odak yıldız göstergesi |
| `CustomDurationSheet` | Bottom sheet özel süre (slider) |

### Profile (`components/profile/`)

| Bileşen | İşlev |
|---------|--------|
| `DailyGoalCard` | Günlük hedef seçimi + ilerleme + ödül |
| `CategoryDistribution` | Kategori dağılım grafiği |
| `StatBox` | İstatistik kutusu |
| `ProfileNavRow` | Profil navigasyon satırı |

### Settings (`components/settings/`)

| Bileşen | İşlev |
|---------|--------|
| `SettingsRow` / `SettingsNavLink` / `SettingsDivider` | Ayarlar listesi |
| `OfflineSyncButton` | Bekleyen offline seans sync |

### Rapor / rozet

| Bileşen | İşlev |
|---------|--------|
| `WeeklyReportCard` | Haftalık rapor özeti kartı |
| `WeeklyReportModal` | Tam rapor modal |
| `BadgeItem` | Rozet grid öğesi |

---

## Servisler & lib

| Modül | Dosya | İşlev | Durum |
|-------|--------|--------|--------|
| **api** | `shared/api.ts` | Supabase auth, RPC, günlük hedef, unlock, demo | ✅ |
| **skyCatalog** | `services/skyCatalog.ts` | DB'den takımyıldızı + yıldız katalog (cache) | ✅ |
| **constellationCatalog** | `services/constellationCatalog.ts` | İlerleme listesi, gökyüzü grupları, maliyet | ✅ |
| **profileMapper** | `services/profileMapper.ts` | DB satır → domain tipleri | ✅ |
| **analyticsApi** | `services/analyticsApi.ts` | `GET /analytics/summary` | ✅ |
| **galacticAdvice** | `services/galacticAdvice.ts` | `POST /ai/galactic-advice` | ✅ |
| **dailyGoalStorage** | `lib/dailyGoalStorage.ts` | Yerel + RPC günlük hedef senkronu | ✅ |
| **useWeeklyReport** | `hooks/useWeeklyReport.ts` | Son haftalık rapor fetch | ✅ |
| **useDeepLink** | `hooks/useDeepLink.ts` | E-posta doğrulama / recovery linkleri | ✅ |
| **oauth** / **appleAuth** | `lib/oauth.ts`, `lib/appleAuth.ts` | Sosyal giriş | ✅ |
| **i18n** | `shared/i18n.ts` | TR/EN (~750+ satır çeviri) | ✅ |
| **constants** | `shared/constants.ts` | Kategoriler, rozetler, stardust formülleri | ✅ |
| **theme** / **responsive** | `shared/theme.ts`, `responsive.ts` | Tasarım token'ları, font scale clamp | ✅ |

### Günlük hedef RPC'leri (016)

| RPC | İşlev |
|-----|--------|
| `upsert_daily_goal` | Bugünün hedefini onayla (timezone-aware) |
| `get_daily_goal_progress` | Bugünkü hedef + odak dakikası |
| `claim_daily_goal_reward` | Hedef tamamlanınca ödül |
| `list_daily_goal_history` | Geçmiş hedefler (grafik / analytics) |

---

## Backend Express (`backend/src/`)

| Endpoint / modül | İşlev | Durum |
|------------------|--------|--------|
| `GET /health` | Supabase ping + Gemini env | ✅ |
| `GET /analytics/summary` | Haftalık dk, kategori, streak | ✅ |
| `GET /analytics/daily-goals` | Günlük hedef geçmişi (RPC proxy) | ✅ |
| `POST /stars/unlock` | JWT ile `unlock_star` proxy | ✅ |
| `POST /ai/galactic-advice` | Gemini motivasyon metni | ✅ |
| `DELETE /account` | Soft delete akışı | ✅ |

**LLM:** Express → **Google Gemini** (`GEMINI_API_KEY`, `gemini-2.0-flash` varsayılan).  
**Haftalık rapor:** Edge Function → **OpenRouter** (ücretsiz modeller, fallback zinciri).

**Scriptler:** `npm run dev` · `build` · `start` · `test` · `typecheck`

---

## Supabase Edge Function

| Fonksiyon | Dosya | İşlev | Deploy |
|-----------|--------|--------|--------|
| `generate-weekly-reports` | `backend/supabase/functions/generate-weekly-reports/` | Haftalık istatistik topla → OpenRouter → `weekly_reports` | 🟡 |

Rapor metni bilingual: `{ "tr": "...", "en": "..." }`. Kullanıcı tipi: inactive / new / low / medium / high.

---

## Supabase `db push` — adım adım (Windows)

Migration dosyaları: `backend/supabase/migrations/` (**001 → 016** sırayla uygulanır).

### Ön koşul

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen → **Settings → General** → **Reference ID** not al.
2. Supabase CLI (bir kez):

```powershell
npm install -g supabase
```

### Bağlan ve gönder

```powershell
cd c:\Users\lleda\astrocus\backend
supabase login
supabase link --project-ref BURAYA_REFERENCE_ID
supabase db push
```

### Doğrulama

Dashboard → **Table Editor**: `constellations`, `stars` (67 kayıt), `weekly_reports`, `daily_goal_entries` görünmeli.  
**SQL** → fonksiyonlar: `start_constellation`, `unlock_star`, `cancel_focus_session`, `get_daily_goal_progress` listelenmeli.

Uygulamada: yeni kullanıcı → onboarding → gökyüzü yükleniyor → hata yoksa **008+** başarılı.

### `db push` çalışmazsa (alternatif)

Dashboard → **SQL Editor** → her dosyayı **sırayla** yapıştırıp çalıştır:

1. `001_initial_schema.sql` *(uzak DB zaten doluysa atla)*
2. `002_profile_extra_fields.sql`
3. `003_constellation_gamification.sql` **← kritik**
4. `004_handle_new_user_resilient.sql`
5. `005_notification_logs.sql`
6. `006_notification_logs_rls.sql`
7. `007_user_constellation_tiers.sql`
8. `008_real_star_catalog.sql` **← 67 yıldız**
9. `009_constellation_unlock_order.sql`
10. `010_partial_stardust_dynamic_threshold.sql`
11. `011_fix_uuid_columns_and_rls.sql`
12. `012_fix_category_slug_lookup.sql`
13. `013_weekly_reports.sql`
14. `014_service_role_weekly_reports_grants.sql`
15. `015_focus_active_duration.sql`
16. `016_daily_goal_entries.sql`

> Uzak DB'de eski `complete_focus_session` (10 ✦/dk) veya statik 39 yıldız varsa **003 + 008** mutlaka çalışmalı.

---

## Supabase — migrations & RPC

| Dosya | İçerik | Uzakta uygulandı mı? |
|-------|--------|---------------------|
| `001`–`016` | Tüm şema, RPC, katalog, rapor, günlük hedef | ✅ **Production'da uygulandı** (2026-06-05) |

### RPC özeti (authenticated)

| RPC | İşlev |
|-----|--------|
| `complete_focus_session` | Seans kaydı, XP, stardust (2 ✦/dk + bonus), streak, rozetler |
| `cancel_focus_session` | Erken bitir; dinamik eşik + aktif odak dakikası |
| `unlock_star` | Manuel yıldız açma, dinamik maliyet, takımyıldızı tamamlama |
| `start_constellation` | Onboarding; `active_constellation_id` + `onboarding_completed` |
| `initialize_user_constellations` | Kullanıcı takımyıldızı ilerleme başlatma |
| `upsert_daily_goal` / `get_daily_goal_progress` / `claim_daily_goal_reward` | Günlük hedef döngüsü |
| `list_daily_goal_history` | Geçmiş hedef + odak verisi |

---

## Kimlik doğrulama matrisi

| Yöntem | Kod | Yapılandırma |
|--------|-----|--------------|
| E-posta + şifre | ✅ | Supabase Auth + deep link (verify / reset) |
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

## CI / kalite / build

| Kontrol | Durum |
|---------|--------|
| `.github/workflows/ci.yml` | ✅ backend test+build, frontend typecheck |
| `.github/workflows/weekly-reports-cron.yml` | ✅ Pazartesi cron (repo secrets gerekli) |
| `frontend` `npm run typecheck` | ✅ |
| `backend` `npm test` | ✅ (galacticAdvice, accountDeletion) |
| `eas.json` | ✅ development / preview (APK) / production |
| Fiziksel cihaz E2E checklist | 🟡 manuel |
| Demo video | 🟡 |

---

## Tarihçe (özet günlükler)

### 2026-06-05 — Ürün kararları + yayın altyapısı

**Bağlam:** PRD v1.3 ürün kararları dokümante edildi. Production DB migration 001–016 doğrulandı. CI, deploy dokümanları, PostHog/Sentry altyapısı eklendi.

**Altyapı:**
* `supabase migration list` — 001–016 Local = Remote ✅
* Edge Function `generate-weekly-reports` ACTIVE v8 ✅
* `.github/workflows/ci.yml` + `weekly-reports-cron.yml`
* `backend/Dockerfile`, `docs/backend-deploy.md`, `docs/release-checklist.md`
* PostHog HTTP capture (`analytics.ts`), Sentry hook (`monitoring.ts`)

**Açık:** Express production deploy, `GEMINI_API_KEY`, PostHog/Sentry keys, EAS build, demo video

---

### 2026-06-05 — Progress envanteri güncellendi

**Bağlam:** 2026-05-28 sonrası UI/UX, DB katalog, haftalık rapor ve günlük hedef özellikleri tamamlandı; bu kayıt güncel durumu yansıtır.

---

### 2026-06-03 — UI iyileştirmeleri

* Genel UI polish, responsive düzenlemeler
* `AppText`, font scale clamp, layout scaffold iyileştirmeleri

---

### 2026-06-01 — Odak/seans sayfaları + AI

* `SessionScreen` büyük revizyon: preset'ler, `CustomDurationSheet`, `WeekDayStars`
* `WeeklyReportCard` Session + Profile'a entegre
* Kutlama akışı `CelebrationHost`'a taşındı

---

### 2026-05-30 — Onboarding tamamlandı

* 4 slayt PNG görseller (`assets/onboarding/visual_0*.png`)
* Twinkle animasyonları, FlatList pager, i18n metinler
* KVKK / gizlilik kabul akışı auth'ta

---

### 2026-05-28 — DB katalog + dil paketleri

* Migration **008**: 67 gerçek yıldız katalog
* `skyCatalog.ts` — statik `constants.ts` yıldız listesi yerine DB fetch
* Migration **007, 009–012**: tier/unlock_order, partial stardust, UUID/RLS fix
* Migration **013–016**: haftalık rapor + günlük hedef
* i18n genişletildi (~750 satır TR/EN)
* `GalaxyScreen` Skia sahne, filtre, yeni kart bileşenleri
* `SettingsScreen`, `BadgesScreen`, `NotificationContext`
* `eas.json` build profilleri

---

### 2026-05-28 — Çekirdek eksikler kapatma (önceki tur)

* `SessionScreen`: Seansı bitir → `cancelSession()`; 2 ✦/dk
* `api.unlockStar`: doğrudan Supabase RPC
* NetInfo offline sync, Apple Sign In, onboarding bayrak hizası
* `006_notification_logs_rls.sql`

---

### 2026-05-21 — Takımyıldızı gamification, Google OAuth

* Migration **003**: 13 takımyıldızı, 2 ✦/dk, cancel/unlock RPC
* Google OAuth Expo Go redirect; `authErrors.ts`

---

### 2026-05-15 — Monorepo + Supabase + Express

* `/frontend` + `/backend` monorepo
* İlk şema + `complete_focus_session` RPC
* Analytics API; offline kuyruk

---

## Yaklaşım (Approach)

* **Önce PRD/MVP'yi teknik olarak tutarlı hale getir, sonra çalışan iskelet.**
* **Anti-cheat:** Stardust, XP, streak, unlock, günlük hedef ödülü → Supabase RPC.
* **LLM:** Seans sonu → Express/Gemini; haftalık rapor → Edge Function/OpenRouter.
* **Katalog:** Takımyıldızı/yıldız verisi artık **Supabase'den** (`skyCatalog.ts`).
* **Expo SDK 54 + Expo Router** — Skia galaxy sahne; Apple için native build gerekir.
* **Manuel yıldız unlock** — otomatik unlock kaldırıldı (ürün kuralı).
* **Profil / Ayarlar ayrımı** — odak istatistikleri profilde, tercihler `/settings`.

---

## plan.md ile fark (not)

`prodocs/plan.md` hâlâ eski durumu (dosya tabanlı storage, OpenRouter seans sonu, CI açık maddeler) yansıtıyor. Gerçek durum için **bu dosya (`progress.md`)** referans alınmalı. Plan.md güncellemesi ayrı bir görev.

---

*Astrocus Progress — son kod envanteri 2026-06-05*
