# Astrocus — Tech Stack

Bu doküman, Astrocus’ta kullanılan teknolojileri, servis seçimlerinin kısa gerekçelerini ve geliştirme sürecinde yapay zekanın nasıl kullanıldığını özetler.

> **Son güncelleme:** 2026-06-12  
> **Geliştirici:** Eda Kara
> **Ürün durumu:** MVP tamamlandı — Google Play **açık test** (Android); App Store yayını yok (sonraki sürüm)

---

## 1. Mimari genel bakış

Astrocus **monorepo** yapısındadır: mobil istemci (Expo), sunucu tarafı API (Express), veri ve kimlik (Supabase) katmanları ayrılmıştır. Kritik oyunlaştırma işlemleri doğrudan Supabase RPC ile yapılır; Express API e-posta köprüsü, analitik proxy ve hesap silme gibi sunucu yetkisi gerektiren işler için kullanılır.

```
┌─────────────────┐     JWT + RPC      ┌──────────────────────┐
│  Expo mobil     │ ─────────────────► │  Supabase            │
│  (React Native) │                    │  Auth · PostgreSQL   │
└────────┬────────┘                    │  Edge Functions      │
         │                             └──────────┬───────────┘
         │ HTTP (token)                              │
         ▼                                           ▼
┌─────────────────┐                    Haftalık rapor (OpenRouter)
│  Express API    │                    Günlük quote push (Expo Push)
│  (Railway)      │
└─────────────────┘
```

### Repozitori yapısı (bootcamp teslim)

| Klasör / dosya | İçerik |
|----------------|--------|
| `/frontend` | Mobil arayüz — Expo Router, React Native, TypeScript |
| `/backend` | Express API, Supabase migration’lar, Edge Function kaynakları |
| `/prodocs` | PRD, tech-stack, Plan, DesignSystem, progress (AI ve teslim referansı) |
| `.gitignore` | Gereksiz / gizli dosyaların repoya girmesini engeller |
| `README.md` | Kurulum ve deploy özeti |
| `.env.example` | Gerçek API anahtarları olmadan ortam şablonu (`frontend/`, `backend/`) |

---

## 2. Frontend (`frontend/`)

| Katman | Seçim | Sürüm / not | Gerekçe |
|--------|-------|-------------|---------|
| **Framework** | Expo + React Native | SDK ~54, RN 0.81 | Tek kod tabanı; native modül ve EAS build desteği |
| **UI runtime** | React | 19.1 | Güncel RN/Expo uyumu |
| **Dil** | TypeScript | 5.9 | Tip güvenliği, bakım kolaylığı |
| **Routing** | Expo Router | 6.x, dosya tabanlı `app/` | Deep link (`astrocus://`), auth/onboarding grupları |
| **State** | React Context | `Auth`, `Session`, `UI`, `Notification` | MVP için yeterli; `useAppContext()` facade |
| **Backend istemci** | `@supabase/supabase-js` | 2.x | Auth + RPC + RLS korumalı veri erişimi |
| **Güvenli depolama** | `expo-secure-store` | — | JWT / auth token |
| **Yerel depolama** | `@react-native-async-storage/async-storage` | — | Dil, onboarding bayrakları, tercihler |
| **Ağ durumu** | `@react-native-community/netinfo` | — | Bağlantı algılama (çevrimdışı kuyruk v2 için altyapı) |
| **Animasyon** | `react-native-reanimated` | 4.x | Onboarding, geçişler, timer UI |
| **2D grafik** | `@shopify/react-native-skia` | 2.2 | Gökyüzü / galaksi sahnesi (`GalaxyBackground`) |
| **Tipografi** | DM Sans + Outfit | `@expo-google-fonts/*` | Okunabilirlik + kozmik display başlıklar |
| **İkonlar** | `@expo/vector-icons` (MaterialCommunityIcons) | — | Tab bar, kategori, ayarlar |
| **Haptics** | `expo-haptics` | — | Galaksi etkileşimleri (kısmi) |
| **Push (yerel + uzak)** | `expo-notifications` | — | Seans uyarıları, FCM (release build) |
| **OAuth** | `@react-native-google-signin/google-signin` | — | Native Google → `signInWithIdToken` |
| **Apple giriş** | `expo-apple-authentication` | — | Kod hazır; v1 mağaza yayınında aktif değil |
| **Analitik** | `posthog-react-native` | — | Ekran ve ürün olayları |
| **Hata izleme** | `@sentry/react-native` | org: astrocus | Crash ve hata raporlama (production build) |
| **Native modül** | `astrocus-focus-timer` | `modules/` | Android foreground service, kilit ekranı geri sayımı |

### v1 platform notu

- **Yayın:** Yalnızca **Android** (Google Play açık test).
- **iOS:** `app.json` / Apple Sign In kodu uyumlu; **App Store’a yayınlanmıyor** (sonraki sürüm).
- **Expo Go:** Geliştirme için kullanılır; Google native giriş, FCM push ve tam bildirim davranışı **release/preview APK** gerektirir.
- **OTA:** `app.config.ts` içinde kapalı (`updates.enabled: false`).

---

## 3. Backend (`backend/`)

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| **Runtime** | Node.js ≥ 20 | Express 5 ve tooling uyumu |
| **API** | Express 5 | Hafif HTTP katmanı: auth köprüsü, analytics proxy, hesap silme |
| **Deploy** | Railway (+ Docker) | `GET /health`, env tabanlı yapılandırma |
| **Doğrulama** | Zod | İstek gövdesi şema kontrolü |
| **Güvenlik** | Helmet, express-rate-limit, CORS | Production’da mobil-only (`ALLOWED_ORIGIN=false`) |
| **İzleme** | `@sentry/node`, `posthog-node` | Sunucu hataları ve `account_deleted` olayı |
| **Test** | Vitest | Hesap silme vb. birim testleri |

### Express uçları (özet)

| Route | Amaç |
|-------|------|
| `GET /auth/confirm` | E-posta ara sayfası (token tüketilmez) |
| `GET /auth/verify` | `verifyOtp` → mobil deep link |
| `GET /analytics/summary` | Haftalık özet proxy |
| `POST /account/delete` | Kalıcı hesap silme (service role) |

Gemini / seans sonu LLM **yok** — `50870bf` ile kaldırıldı.

---

## 4. Supabase

| Bileşen | Kullanım | Gerekçe |
|---------|----------|---------|
| **PostgreSQL** | Profiller, seanslar, takımyıldızı katalogu, quotes, haftalık raporlar | İlişkisel veri + migration (`001`–`028` production) |
| **Auth** | E-posta/şifre, Google, Apple (kod) | Hosted kimlik; JWT mobil istemciye |
| **RLS** | Tüm kullanıcı tabloları | Kullanıcı yalnızca kendi verisini görür |
| **RPC** | `complete_focus_session`, `unlock_star`, günlük hedef, vb. | Anti-cheat; atomik ödül hesabı |
| **Edge Functions** | `generate-weekly-reports`, `send-daily-quote` | LLM ve push, API anahtarları mobilde değil |
| **Storage** | **Kullanılmıyor** | Avatarlar emoji tabanlı |
| **SMTP** | Resend (auth e-posta) | `deploy:auth-email` script ile şablon deploy |

---

## 5. Üçüncü taraf servisler

| Servis | Rol | Gerekçe |
|--------|-----|---------|
| **OpenRouter** | Haftalık AI seans analizi | Gemma 4 model ailesi; ücretsiz tier + fallback zinciri |
| **Expo Push / FCM** | Android push (günlük quote) | `expo_push_token` + `google-services.json` |
| **PostHog** | Ürün analitiği (EU host) | Kohort ve ekran takibi |
| **Sentry** | Crash / hata | Production stabilite |
| **Google Cloud OAuth** | Native Google Sign-In | Android client + Web client (Supabase provider) |
| **Resend** | Auth e-posta SMTP | Doğrulama ve şifre sıfırlama |

---

## 6. Yapay zeka — ürün özellikleri

| Özellik | Katman | Sağlayıcı | Durum |
|---------|--------|-----------|--------|
| **Haftalık odak raporu** | Supabase Edge Function `generate-weekly-reports` | OpenRouter — **Gemma 4** (`google/gemma-4-31b-it:free` + fallback) | ✅ Aktif |
| **Günlük evren mesajı (push)** | Edge Function `send-daily-quote` | `quotes` tablosu + Expo Push API | ✅ Aktif |
| ~~Galaktik Tavsiye (seans sonu)~~ | ~~Express + Gemini~~ | — | ❌ Kaldırıldı (2026-06-06) |

**Güvenlik:** `OPENROUTER_API_KEY` ve `CRON_SECRET` yalnızca Supabase Edge secrets / sunucu ortamında; mobil bundle’da **yok**.

---

## 7. Yapay zeka — geliştirme süreci

Proje **solo geliştirme** (Eda Kara). AI araçları üretkenlik ve dokümantasyon için kullanıldı; mimari kararlar geliştirici tarafından verildi.

| Alan | Araç | Nasıl kullanıldı |
|------|------|------------------|
| **Kod yazımı** | Cursor | Özellik implementasyonu, refactoring, bileşen ve ekran geliştirme |
| **Debug** | Cursor, Claude | Hata ayıklama, OAuth/e-posta/FCM sorunları, CI düzeltmeleri |
| **Dökümantasyon** | Cursor | `prodocs/` bootcamp teslim seti (PRD, progress, tech-stack, …) |
| **UI/UX metinleri** | Cursor, Claude | TR/EN `i18n.ts`, onboarding ve hata mesajları |
| **Migration / SQL** | Cursor, Claude | Supabase migration’lar, RPC ve RLS tasarımı |

**Bağlam yönetimi:** [README.md](./README.md) giriş noktası; karar ve hata kayıtları [progress.md](./progress.md) içinde tutulur.

---

## 8. Veri akışı (özet)

1. Kullanıcı giriş yapar → Supabase Auth JWT.
2. Odak seansı biter → mobil `complete_focus_session` RPC (süre doğrulama, ✦, streak, rozetler).
3. Yıldız açma → `unlock_star` RPC (dinamik maliyet).
4. Haftalık rapor → cron → Edge Function → OpenRouter → `weekly_reports` → `WeeklyReportModal`.
5. Günlük quote → cron → `send-daily-quote` → Expo Push → `/universe-message`.
6. E-posta doğrulama → e-posta linki → Railway `/auth/confirm` → `/auth/verify` → `astrocus://verify-success`.
7. Hesap silme → Express `/account/delete` (service role).

**Gamification:** Yalnızca **yıldız tozu (✦)**; XP/seviye UI’dan kaldırıldı.

**Çevrimdışı senkron:** Altyapı repoda (`offlineQueue.ts`, `OFFLINE_SESSION_SYNC_ENABLED = false`); v1’de kullanıcıya **gösterilmez** — v2 teknik borç ([progress.md](./progress.md#offline-sync-v2)).

---

## 9. Temel veritabanı tabloları

| Tablo | Amaç |
|-------|------|
| `profiles` | Kullanıcı profili, ✦, streak, günlük hedef, push token |
| `sessions` | Tamamlanan odak seansları |
| `stardust_ledger` | ✦ hareketleri |
| `constellations`, `stars`, `user_stars` | Takımyıldızı katalogu ve ilerleme |
| `badges`, `user_badges` | Rozetler |
| `daily_goal_entries` | Günlük hedef kayıtları |
| `weekly_reports` | Haftalık AI rapor metinleri (TR/EN) |
| `quotes` | Günlük alıntı katalogu |

---

<a id="devops"></a>

## 10. DevOps, CI/CD ve canlıya geçiş

| Araç | Kullanım |
|------|----------|
| **GitHub Actions** | `.github/workflows/ci.yml` — backend test/build, frontend typecheck |
| **GitHub Actions** | `.github/workflows/weekly-reports-cron.yml` — haftalık AI rapor cron |
| **EAS** | `eas.json` — preview (APK), production; `APP_ENV=production` |
| **Railway** | Express API (`backend/`) — auth e-posta köprüsü, analytics, hesap silme |
| **Supabase CLI** | `db push`, Edge Function deploy, `npm run deploy:auth-email` |
| **Yerel Android release** | `npm run android:release` / `android:bundle` |

**Gizlilik:** `google-services.json`, `.env` gitignore’da; örnekler `.env.example`.

**Hata kayıtları:** [progress.md — Karşılaşılan sorunlar](./progress.md#karsilasilan-sorunlar) · [Yayın checklist](./progress.md#canliya-gecis-checklist)

<a id="prod-env"></a>

### 10.1 Production ortam değişkenleri

`EXPO_PUBLIC_*` değerleri **release build sırasında bundle’a gömülür** — `.env` değişince APK/AAB yeniden alınmalı.

| Değişken | Doğru | Yanlış |
|----------|-------|--------|
| `APP_ENV` | `production` | `development` (release’te demo + localhost riski) |
| `EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI` | `astrocus://verify-success` | `astrocus://verify-email` (rota yok) |
| `ALLOWED_ORIGIN` (backend) | `false` (mobil-only) | Gereksiz CORS açık bırakma |

Şablonlar: `frontend/.env.example`, `backend/.env.example`. Örnek production seti için repodaki `.env.example` yorumlarına bakın.

<a id="canliya-gecis-adimlari"></a>

### 10.2 Canlıya geçiş adımları (özet)

1. **Önkoşul:** Android Studio + JDK; `frontend/google-services.json` (gitignore); `frontend/.env` + `backend/.env` dolu; `GET /health` → `{ ok: true }`.
2. **Supabase Auth:** Site URL = Railway API; Redirect URLs = `astrocus://verify-success`, `astrocus://reset-password`, `astrocus://auth/callback`.
3. **E-posta şablonları:** `cd backend && npm run deploy:auth-email` (SMTP + `/auth/confirm` şablonları).
4. **Railway:** `backend/` deploy; `APP_ENV=production`, `ALLOWED_ORIGIN=false`.
5. **Google Sign-In:** `cd frontend/android && gradlew signingReport` → SHA-1 → Google Cloud Android client (`com.astrocus.app`).
6. **Release build:** `npx expo prebuild --platform android --clean` (FCM değiştiyse) → `npm run android:release`.
7. **Smoke test:** Kayıt/e-posta, Google giriş, seans, push, hesap silme — [checklist](./progress.md#canliya-gecis-checklist).

<a id="railway-backend"></a>

### 10.3 Railway backend

- Root directory: `backend` · Health: `GET /health`
- Zorunlu env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ENV=production`
- Auth route’ları: `GET /auth/confirm`, `GET /auth/verify` — `auth.routes.ts`
- Monorepo kökünden deploy: `railway up` (servis root = `backend` ise `backend/` içinden değil)

```powershell
cd backend
npm run deploy:auth-email   # Supabase şablon + SMTP
```

### 10.4 Android release (yerel, EAS kotası olmadan)

```powershell
cd frontend
npx expo prebuild --platform android --clean   # google-services.json değiştiyse
npm run android:release                        # → android/app/build/outputs/apk/release/
npm run android:bundle                         # Play Store AAB
```

`scripts/build-release-apk.ps1` otomatik `APP_ENV=production` set eder.

### 10.5 Auth e-posta deploy

| Öğe | Konum |
|-----|--------|
| HTML şablonlar | `backend/supabase/templates/confirmation.html`, `recovery.html` |
| Deploy script | `backend/supabase/scripts/deploy-auth-email-config.mjs` |
| OTP süresi | 900 sn (15 dk) |
| Akış | E-posta → `/auth/confirm` (token tüketilmez) → kullanıcı tıklar → `/auth/verify` → `astrocus://verify-success` |

Custom SMTP (Resend vb.) production için **zorunlu** — `SMTP_*` alanları `backend/.env` içinde.

<a id="google-oauth"></a>

### 10.6 Google OAuth (native Sign-In)

- Paket: `com.astrocus.app` · Modül: `@react-native-google-signin/google-signin`
- **Expo Go’da çalışmaz** — preview/release APK gerekir
- Web client ID → Supabase Google provider + `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Android client → package + **SHA-1** (`eas credentials -p android` veya `gradlew signingReport`)
- Sık hata `DEVELOPER_ERROR` → SHA-1 uyumsuzluğu ([progress.md §2c](./progress.md#google-oauth-hatalari))

<a id="fcm-push"></a>

### 10.7 FCM / Android push

1. Firebase Console → Android `com.astrocus.app` → `google-services.json` → `frontend/`
2. `npx expo prebuild --platform android --clean`
3. EAS FCM v1 service account (`eas credentials` veya Expo Dashboard)
4. Doğrulama: `profiles.expo_push_token` dolu; release APK ile test

Hata `Default FirebaseApp is not initialized` → `google-services.json` eksik veya prebuild yapılmamış.

<a id="haftalik-cron"></a>

### 10.8 Haftalık AI rapor cron

`OPENROUTER_API_KEY` ve `CRON_SECRET` **Supabase Edge secrets** (backend `.env` değil).

```bash
cd backend
npx supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
npx supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
npx supabase functions deploy generate-weekly-reports
```

Cron: `.github/workflows/weekly-reports-cron.yml` veya harici POST → `generate-weekly-reports` + header `x-cron-secret`.

<a id="expo-go-network"></a>

### 10.9 Yerel geliştirme ağı (Expo Go)

| Sorun | Çözüm |
|-------|--------|
| Metro tunnel yalnızca 8081 | Express (4000) için ayrı ngrok veya LAN IP |
| OAuth mavi ekran | `expo start --lan -c`; Supabase’e `exp://192.168.x.x:8081/--/auth/callback` ekle |
| API erişilemiyor | `EXPO_PUBLIC_API_URL=http://<PC-IP>:4000` + aynı Wi‑Fi |

Demo: `APP_ENV=development`, `demo@astrocus.dev` / `demo1234` (yalnızca `__DEV__`).

### 10.10 Hızlı komutlar

```powershell
cd backend; npm run deploy:auth-email
cd frontend; npm run android:release
cd frontend; npm run typecheck
cd frontend; npm run test:session
```

---

## 11. Bilinçli teknik borç (v1)

| Konu | Durum |
|------|--------|
| Çevrimdışı seans senkronu | Kod var, UI kapalı — v2 |
| Migration `029` gamification RLS | Taslak hazır, production’da yok |
| iOS App Store | Kod uyumlu, yayın yok |
| PostHog / Sentry | Kod entegre; production anahtarları ortamda yapılandırılır |

---

## İlgili dokümanlar

- [PRD.md](./PRD.md) — ürün kapsamı  
- [progress.md](./progress.md) — kararlar, hatalar, kronoloji  
- [plan.md](./plan.md) — kullanıcı hikayeleri  
- [README.md](../README.md) — hızlı kurulum
