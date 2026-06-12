# Astrocus — Progress Log

İşlem kaydı, alınan kararlar, karşılaşılan hatalar ve çözümler. Bootcamp teslim dökümanı.

> **Son güncelleme:** 2026-06-12  
> **Geliştirici:** Eda Kara (solo)  
> **Ürün durumu:** MVP tamamlandı — Google Play **açık test (open testing)**  
> **İlgili:** [PRD.md](./PRD.md) · [tech-stack.md — Canlıya geçiş](./tech-stack.md#devops)

## İçindekiler

- [Güncel durum özeti](#guncel-durum)
- [Kronolojik gelişim](#kronoloji)
- [Önemli kararlar](#kararlar)
- [Karşılaşılan sorunlar ve çözümler](#karsilasilan-sorunlar)
- [Canlıya geçiş kontrol listesi](#canliya-gecis-checklist)
- [Bilinen teknik borç](#bilinen-teknik-borc)
- [MVP özellik durumu](#mvp-durum)
- [Açık işler ve riskler](#acik-isler)

---

<a id="guncel-durum"></a>

## Güncel durum özeti

| Alan | Durum |
|------|--------|
| **Platform (v1)** | Yalnızca Android / Google Play açık test |
| **iOS** | Kod uyumlu; App Store yayını **yok** (sonraki sürüm) |
| **Veritabanı** | Supabase migration **001–028** production'da uygulandı (doğrulandı) |
| **Gamification** | Yalnızca **yıldız tozu (✦)**; XP/seviye UI'dan kaldırıldı |
| **AI (ürün)** | Haftalık seans analizi — OpenRouter **Gemma 4** (`generate-weekly-reports` Edge Function) |
| **AI (geliştirme)** | Cursor (kod, debug, prodocs); Claude (debug, migration/SQL, UI metinleri) |

---

<a id="kronoloji"></a>

## Kronolojik gelişim zaman çizelgesi

### 2026-04-15 — 2026-04-22 · Faz 0: Ürün tanımı ve kapsam

| Tarih | Commit / olay | Özet |
|-------|---------------|------|
| 2026-04-15 | `24d3792` PRD | İlk Product Requirements Document |
| 2026-04-16 | `afff0f9` … `c0542b1` | PRD revizyonları, MVP kapsamı, yazar bilgisi |
| 2026-04-22 | `6e90a0e` | Kapsam güncellemesi |
| 2026-04-22 | `bea9c86` | **Expo iskeleti** — monorepo, temel proje yapısı |

**Karar:** Odaklanma + kozmik gamification (burç takımyıldızları teması; astroloji tahmin uygulaması değil).

---

### 2026-05-05 — 2026-05-06 · Faz 1: İlk ekranlar ve auth

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-05-05 | `f538534` | İlk ekranlar eklendi |
| 2026-05-06 | `f020b1c` | Login, register, onboarding ekranları |
| 2026-05-06 | `ce39739` | Tüm ana ekranlar güncellendi |
| 2026-05-06 | `a22422b`, `2b646a8` | README güncellemeleri |

---

### 2026-05-13 — 2026-05-15 · Faz 2: Backend ve monorepo

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-05-13 | `5225520` | Backend bağlantıları (Supabase) |
| 2026-05-13 | `cd349f0` | Railway start script düzeltmesi |
| 2026-05-15 | `c491506` | **Klasör yapısı yeniden kurgulandı** — `/frontend`, `/backend`, `/prodocs` |
| 2026-05-15 | `948e1cb` | Backend ve frontend iyileştirmeleri |
| 2026-05-15 | `aa9e54c` | README |

**Karar:** Monorepo — mobil istemci ve Express API ayrı klasörler; kritik işlemler Supabase RPC ile.

---

### 2026-05-18 — 2026-05-21 · Faz 3: Auth düzeltmeleri ve gamification temeli

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-05-18 | `d0009e8` | Login/register hata düzeltmeleri |
| 2026-05-21 | `a226ce3` | Ara düzenlemeler |

**Migration 003 (takımyıldızı gamification):** 13 burç, `complete_focus_session` / `cancel_focus_session` / `unlock_star` RPC'leri, sıralı ilerleme.

**Karar:** Gökyüzü haritası simülasyonu yerine **takımyıldızı kartları** + manuel yıldız unlock.

---

### 2026-05-28 — 2026-05-30 · Faz 4: DB katalog, onboarding, i18n

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-05-28 | `db43407` | Gökyüzü oyunlaştırması **dinamik DB katalog** (`skyCatalog.ts`, migration 008 — 67 yıldız) |
| 2026-05-28 | `7f6f0cb` | Dil paketleri (TR/EN `i18n.ts`) |
| 2026-05-30 | `e03e1b8` | **Onboarding tamamlandı** — 4 slayt + `star-pick` |

**Migration'lar (bu dönem):** 007–016 — tier/unlock_order, haftalık rapor tablosu, günlük hedef RPC'leri, UUID/RLS düzeltmeleri.

**Karar:** Onboarding 3 ekran değil **4 slayt**; skip ve varsayılan yıldız yok.

---

### 2026-06-01 — 2026-06-03 · Faz 5: Seans UI ve haftalık rapor

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-06-01 | `8c56bd9` | Odak/seans sayfaları revizyonu; **AI entegrasyonu** (seans sonu — sonra kaldırıldı) |
| 2026-06-03 | `6f3f694`, `0c97f5f` | UI/UX iyileştirmeleri |

**Eklenen:** `WeeklyReportCard`, `CelebrationHost`, preset süreler, `CustomDurationSheet`, `WeekDayStars`.

---

### 2026-06-05 — 2026-06-06 · Faz 6: Ayarlar, push, ekonomi, izleme

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-06-05 | `c176cb1` | `quotes` tablosu; bildirim altyapısı; UI |
| 2026-06-05 | `19b59ee` | react-dom 19.1.0 CI hizalaması |
| 2026-06-05 | `149742b` | Settings/legal UI, Lorelei avatarlar, **hesap silme** |
| 2026-06-06 | `50870bf` | Günlük push + `send-daily-quote`; **Galaktik Tavsiye kaldırıldı**; PostHog SDK; Sentry refactor |
| 2026-06-06 | `16839ec`, `d80bf7b` | Node 20 ws transport; dotenv production guard |
| 2026-06-06 | (yerel) | Context ayrıştırma; kullanıcı adı migration 021–023; galaxy görselleri |

**Migration 024–025:** Yıldız tozu ekonomisi — 10 ✦/dk; tier maliyetleri 500 / 1200 / 2000 ✦; günlük hedef ödülü `max(75, hedef_dk × 3)`.

**Karar:** Seans sonu Gemini tavsiyesi v1'den çıkarıldı; yerine günlük quote push + haftalık OpenRouter raporu.

---

### 2026-06-07 — 2026-06-11 · Faz 7: Production go-live hazırlığı

| Tarih | Commit | Özet |
|-------|--------|------|
| 2026-06-07 | `5287aab` | Son düzenlemeler |
| 2026-06-08 | `9f2c92d` | Auth e-posta verify + mobile redirect (`/auth/confirm`, `/auth/verify`) |
| 2026-06-09 | `92e330a` | Haftalık rapor düzeltmeleri |
| 2026-06-10 | `7ed7839` | Bildirim sistemi hata düzeltmeleri |
| 2026-06-11 | `b07f1ca` | Focus session arka plan + bildirim güvenilirliği |
| 2026-06-11 | `cf6fa20` | package-lock CI sync |
| 2026-06-11 | `716c65b` | Auth confirm — **JavaScript olmayan e-posta WebView** desteği |
| 2026-06-11 | `58e974e` | `auth.routes` TypeScript build (CI / Railway) |

**Dokümantasyon:** Hata kayıtları bu dosyada; deploy adımları [tech-stack.md §10](./tech-stack.md#devops).

**Production ayarları:** `APP_ENV=production`; demo mod yalnızca `__DEV__`; `EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI=astrocus://verify-success`.

---

### 2026-06-12 · Bootcamp dökümantasyonu ve güvenlik denetimi

- [PRD.md](./PRD.md) bootcamp teslim formatına güncellendi (MVP özeti, Play açık test, iOS ertelendi, XP kaldırıldı).
- Gamification RLS sıkılaştırma ihtiyacı tespit edildi → migration 029 taslağı (aşağıda).

---

<a id="kararlar"></a>

## Önemli ürün ve teknik kararlar

| Tarih / dönem | Karar | Gerekçe |
|---------------|-------|---------|
| MVP | Takımyıldızı **kartları** (canlı gökyüzü simülasyonu değil) | Maliyet, net UX, DB katalog yeterli |
| MVP | **Manuel** yıldız unlock | Kullanıcı ödülü ne zaman harcayacağını seçer |
| MVP | Duraklatma > 5 dk → iptal **yok** | Düşük UX kazancı, ek karmaşıklık |
| MVP | Seans ekranında yıldız görseli **yok** | Odak öncelikli minimal UI |
| 2026-06-06 | Galaktik Tavsiye (Gemini) **kaldırıldı** | Kapsam sadeleştirme; günlük quote + haftalık rapor yeterli |
| 2026-06-06 | PostHog native SDK; Sentry `errorTracking.ts` | Ürün analitiği ve crash izleme |
| Mimari | Ödül/streak/unlock → **Supabase RPC** | Anti-cheat; istemci ödül hesaplamaz |
| Mimari | Haftalık AI → **Edge Function + OpenRouter** | API anahtarı mobil bundle'da değil |
| Mimari | Auth e-posta → **Express köprüsü** | Mail istemcisi WebView'da JS kapalı olabilir |
| v1 yayın | **Android only**; iOS kod hazır, mağaza yok | Play açık test öncelik |
| Gamification | **XP/seviye kaldırıldı** | Yalnızca yıldız tozu (✦) ekonomisi |

---

<a id="karsilasilan-sorunlar"></a>

## Karşılaşılan sorunlar ve çözümler

Aşağıdaki kayıtlar gerçek geliştirme ve production hazırlık sürecinden çıkarılmıştır. Her madde: **belirti → kök neden → çözüm** sırasıyla yazılmıştır. Canlıya geçiş adımları: [tech-stack.md §10](./tech-stack.md#devops).

---

### 1. E-posta doğrulama — “Bağlantının süresi dolmuş veya geçersiz”

**Belirti:** Kullanıcı kayıt e-postasındaki linke tıkladığında hata; link daha önce hiç açılmamış olsa bile token geçersiz sayılıyordu.

**Kök neden:** Gmail ve Outlook gibi istemciler, güvenlik taraması için e-postadaki doğrulama linkine **otomatik HTTP isteği** atıyor. Eski akışta link doğrudan `GET /auth/verify` → `verifyOtp` çağırıyordu; tarayıcı botu token'ı tüketince gerçek kullanıcı linke geldiğinde OTP artık geçersizdi.

**Çözüm (iki adımlı köprü):**

1. E-posta şablonu artık `{{ .SiteURL }}/auth/confirm?token_hash=...` adresine gidiyor — bu adımda token **henüz tüketilmiyor**.
2. `/auth/confirm` basit bir HTML ara sayfası gösteriyor; kullanıcı “E-postamı doğrula” düğmesine basınca `/auth/verify` çalışıyor.
3. `verifyOtp` başarılı olunca mobil deep link: `astrocus://verify-success#access_token=...&refresh_token=...`
4. Uygulama `useDeepLink` ile hash'teki token'ları okuyup oturumu kuruyor → `/verify-success` ekranı.

**Ek düzeltmeler:**

- Yanlış env: `astrocus://verify-email` rotası uygulamada yok → `EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI=astrocus://verify-success` olarak sabitlendi.
- Bazı mail WebView'larında JavaScript kapalı → ara sayfa mümkün olduğunca **JS'siz** çalışacak şekilde düzenlendi (`716c65b`).
- Şablon deploy: `cd backend && npm run deploy:auth-email` (SMTP + Supabase Management API). Railway'de `/auth/confirm` route'u yoksa backend **yeniden deploy** gerekir.

**İlgili:** `9f2c92d`, `716c65b` · `backend/src/routes/auth.routes.ts` · `backend/supabase/templates/` · `npm run deploy:auth-email`

**Ek sorun giderme (auth e-posta):**

| Belirti | Olası neden | Çözüm |
|---------|-------------|--------|
| Railway ara sayfasında takılı kalma | Eski şablon veya `/auth/confirm` route yok | Backend redeploy + `deploy:auth-email` |
| Şifre sıfırlama uygulamayı açmıyor | Mail WebView `astrocus://` otomatik açmaz | Ara sayfadaki “Astrocus'u aç” düğmesi |
| `deploy:auth-email` token hatası | `backend/.env` eksik | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` |
| Süresi dolmuş (yeni mail) | Eski şablon doğrudan `/auth/verify` | `deploy:auth-email` + yeni kayıt maili |
| Uygulama açılmıyor | Yanlış redirect URI | `astrocus://verify-success`, `astrocus://reset-password` |
| “Error sending confirmation email” | Supabase varsayılan SMTP | Custom SMTP (Resend) — `backend/.env` SMTP alanları |

---

<a id="google-oauth-hatalari"></a>

### 2. Google OAuth — Expo Go, mavi ekran ve `DEVELOPER_ERROR`

#### 2a. Expo Go'da native Google Sign-In çalışmıyor

**Belirti:** Google ile giriş butonu Expo Go'da hata veriyor veya hiç tamamlanmıyor.

**Kök neden:** Production akış **native** `@react-native-google-signin/google-signin` kullanıyor (`id_token` → `supabase.auth.signInWithIdToken`). Bu modül Expo Go'da yok; preview/production APK gerekir.

**Çözüm:** `eas build -p android --profile preview` veya yerel `npm run android:release`. Google Cloud'da Android OAuth client: package `com.astrocus.app` + doğru SHA-1.

**İlgili:** [tech-stack.md §10.6](./tech-stack.md#google-oauth)

#### 2b. Google dönüşünde “Failed to download remote update” (mavi ekran)

**Belirti:** OAuth sonrası Expo Go mavi ekran; Metro bundle indirilemiyor.

**Kök neden (birkaç senaryo):**

- Redirect URL'de `127.0.0.1` / `localhost` — fiziksel telefonda bu adres PC değil, telefonun kendisi.
- Android **cold start:** Chrome Custom Tab ayrı görevde açılınca `exp://` dönüşü Expo Go'yu sıfırdan başlatıyor; Metro'ya ulaşamıyor (logda `Android Bundled … (1 module)`).

**Çözüm:**

- Geliştirmede `npx expo start --lan -c`; Metro logundaki `exp://192.168.x.x:8081/--/auth/callback` değerini Supabase Redirect URLs'e ekle.
- PC ve telefon **aynı Wi‑Fi**; Windows ağ profili “Özel”; güvenlik duvarında Node.js **8081** açık.
- OAuth oturumunda `createTask: false` — Custom Tab aynı Android görevinde kalır.
- İsteğe bağlı: `EXPO_PUBLIC_OAUTH_REDIRECT_URI` ile sabit LAN redirect.

**İlgili:** [tech-stack.md §10.9](./tech-stack.md#expo-go-network)

#### 2c. `DEVELOPER_ERROR` (release APK)

**Belirti:** Google hesap seçici açılıyor ama `DEVELOPER_ERROR` ile düşüyor.

**Kök neden:** Google Cloud Android OAuth client'taki **SHA-1 fingerprint**, APK'yı imzalayan keystore ile uyuşmuyor. Debug keystore SHA-1 ≠ EAS release keystore SHA-1.

**Çözüm:**

```powershell
cd frontend
npx eas credentials -p android   # release SHA-1
# veya yerel debug için:
cd frontend\android
.\gradlew.bat signingReport
```

Doğru SHA-1'i Google Cloud → Credentials → Android client'a ekle. `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` EAS secret olarak build'e gömülmeli.

**İlgili:** `lib/googleSignIn.ts`, Google Cloud Android client SHA-1 — [tech-stack.md §10.6](./tech-stack.md#google-oauth)

---

### 3. Push bildirimleri ve FCM (Android)

#### 3a. `Default FirebaseApp is not initialized`

**Belirti:** Release build'de push veya FCM ile ilgili native crash.

**Kök neden:** Android native projede Firebase yapılandırması yok — `google-services.json` eksik veya prebuild sonrası eklenmemiş.

**Çözüm:**

1. Firebase Console → Android app `com.astrocus.app` → `google-services.json` indir → `frontend/google-services.json` (gitignore, repoya commit edilmez).
2. `npx expo prebuild --platform android --clean`
3. EAS'da FCM v1 service account key ([tech-stack.md §10.7](./tech-stack.md#fcm-push)).

#### 3b. Expo Go'da push token / kırmızı ekran

**Belirti:** SDK 53+ Expo Go Android'de `expo-notifications` import edilince `console.error` → LogBox fatal kırmızı ekran. OAuth sonrası da görülebilir.

**Kök neden:** Expo Go, push ve bazı native bildirim API'lerini tam desteklemiyor.

**Çözüm:** `src/shared/notifications.ts` içinde `isRunningInExpoGo()` kontrolü — Expo Go'da modül lazy yüklenmiyor. Gerçek push testi **yalnızca release/preview APK** ile. Günlük quote push (`send-daily-quote`) de production build + kayıtlı `expo_push_token` gerektirir.

**İlgili:** `7ed7839`, `shared/notifications.ts`, [tech-stack.md §10.7](./tech-stack.md#fcm-push)

#### 3c. Günlük quote push gelmiyor

**Kontrol listesi:** `google-services.json` var mı? `prebuild --clean` sonrası rebuild? Bildirim izni verildi mi? `profiles.expo_push_token` dolu mu? Edge Function `send-daily-quote` deploy + cron (`CRON_SECRET`)? Expo Go değil, release APK kullanılıyor mu?

---

### 4. Odak seansı — arka plan, bildirim ve seans kaybı

#### 4a. Uygulama arka plana geçince süre / seans durumu

**Belirti:** Kullanıcı başka uygulamaya geçince geri sayım tutarsız; uzun süre sonra seans iptal veya yanlış süre.

**Kök neden:** Saf JS timer arka planda throttle edilir; ekran kapanınca `setInterval` güvenilir değil.

**Çözüm:**

- **AppState + timestamp:** Arka plana geçiş anı kaydedilir; ön plana dönünce `completed_at - started_at` farkı hesaplanır.
- **20 sn tolerans** (`BACKGROUND_TOLERANCE_SECONDS`): Aşılırsa seans `failed`.
- **10. sn yerel bildirim** (`WARNING_THRESHOLD_SECONDS`): Kullanıcıyı uygulamaya dönmeye çağırır.
- UI metni bildirimle uyumlu olacak şekilde “10 saniye” olarak güncellendi (eskiden 20 sn yazıyordu).

**İlgili:** `b07f1ca`, `SessionContext`, `constants.ts`

#### 4b. Android kilit ekranında geri sayım görünmüyor

**Belirti:** Seans sürerken kilit ekranında süre yok; kullanıcı telefonu kilitleyince odak bağlamı kayboluyor.

**Çözüm:** Özel Expo modülü `astrocus-focus-timer` — Android **foreground service** + ongoing notification ile kilit ekranında geri sayım. `app.json` içinde `FOREGROUND_SERVICE`, `WAKE_LOCK`, `POST_NOTIFICATIONS` izinleri.

**İlgili:** `frontend/modules/astrocus-focus-timer/`

#### 4c. Bildirim zamanlaması güvenilirliği

**Belirti:** Arka planda uyarı bazen gecikiyor veya tetiklenmiyor.

**Çözüm:** `b07f1ca` ve `7ed7839` commit'lerinde focus session notification scheduling ve background handler'lar gözden geçirildi; notification channel'lar (`focus-session-ongoing`, `focus-session-warning` vb.) ayrı tanımlandı.

**Test:** `npm run test:session` (timer + notification unit testleri).

---

### 5. Production ortamı ve demo modu

#### 5a. Release build'de demo giriş veya localhost API

**Belirti:** Production APK'da demo hesap çalışıyor veya API localhost'a gidiyor.

**Kök neden:** `APP_ENV=development` veya eski demo token AsyncStorage'da kalmış.

**Çözüm:**

- Release build'de `APP_ENV=production` (`eas.json`, `build-release-apk.ps1`).
- `devDemo.ts`: `isDevDemoEnabled()` yalnızca `__DEV__` true iken demo kabul eder; production bootstrap'ta eski demo token temizlenir.
- `app.config.ts`: production'da cleartext HTTP kapalı.

**İlgili:** `devDemo.ts`, `AuthContext.tsx`, `APP_ENV=production`

---

### 6. CI, Railway ve backend deploy

#### 6a. GitHub Actions `npm ci` — react-dom uyumsuzluğu

**Belirti:** CI frontend adımında peer dependency / lockfile hatası.

**Kök neden:** React 19.1.0 ile react-dom sürümü lockfile'da hizasız.

**Çözüm:** react-dom 19.1.0'a sabitleme; `package-lock.json` sync (`19b59ee`, `149742b`, `cf6fa20`).

#### 6b. Railway TypeScript build fail — `auth.routes.ts`

**Belirti:** Backend Docker/Railway build'de TypeScript derleme hatası; CI kırmızı.

**Çözüm:** `auth.routes.ts` tip düzeltmeleri (`58e974e`) — e-posta köprüsü route'ları eklendikten sonra strict build kırılıyordu.

#### 6c. Node 20 WebSocket transport

**Belirti:** Backend'de ws bağlantısı veya transport hatası (geliştirme/production guard).

**Çözüm:** `16839ec` — ws transport Node 20 uyumu; `dotenv` production guard.

#### 6d. Express API + Expo Go geliştirme ağı

**Belirti:** Telefonda Supabase çalışıyor ama `POST /account/delete` veya analytics Express'e ulaşamıyor.

**Kök neden:** `expo start --tunnel` yalnızca Metro'yu (8081) tünelliyor; `localhost:4000` API telefondan erişilemez.

**Çözüm:** Geliştirmede backend için ayrı tünel (ngrok/cloudflared → port 4000) veya LAN IP (`EXPO_PUBLIC_API_URL=http://192.168.x.x:4000`) + `expo start --lan`. Ayrıntı: [tech-stack.md §10.9](./tech-stack.md#expo-go-network).

---

### 7. Haftalık AI rapor (OpenRouter / Edge Function)

#### 7a. Rapor oluşmuyor veya uygulamada boş

**Belirti:** `WeeklyReportModal` boş; Edge Function log hatası veya DB'de kayıt yok.

**Kök nedenler:**

- `OPENROUTER_API_KEY` veya `CRON_SECRET` Supabase Edge secrets'ta tanımlı değil (anahtar **backend/.env'de değil**, Dashboard/CLI'da).
- `weekly_reports` tablosu için service role / authenticated grant eksikliği.

**Çözüm:**

- Migration `013`, `014`, `028` — tablo + grant'ler.
- `92e330a` — haftalık rapor fix commit'i.
- Model: OpenRouter **Gemma 4** (`google/gemma-4-31b-it:free`) + fallback zinciri (`generate-weekly-reports/index.ts`).
- Cron: GitHub Actions `weekly-reports-cron.yml` veya harici cron; `Authorization: Bearer <CRON_SECRET>`.

**İlgili:** [tech-stack.md §10.8](./tech-stack.md#haftalik-cron), `.github/workflows/weekly-reports-cron.yml`

---

### 8. Veritabanı ve migration

#### 8a. Uzak DB'de eski ekonomi veya eksik katalog

**Belirti:** Yıldız maliyetleri yanlış; gökyüzü yüklenmiyor; RPC eski parametrelerle çalışıyor.

**Kök neden:** Migration'lar sırayla uygulanmamış; özellikle `003` (takımyıldızı) ve `008` (67 yıldız katalog) kritik.

**Çözüm:** `supabase db push` veya SQL Editor'de sıralı migration. Production'da **001–028 doğrulandı** (2026-06-12). Yerel doğrulama: `supabase migration list`.

#### 8b. Gamification RLS — client'tan stardust manipülasyonu riski

**Belirti (denetim):** `profiles.total_stardust`, `sessions`, `user_stars` için authenticated insert/update policy'leri doğrudan client yazımına izin veriyor; veri sızıntısı yok ama hile riski var.

**Çözüm taslağı:** `029_tighten_gamification_rls.sql` — RPC-only + trigger guard. Frontend'de 3 kod yolu (profil güncelleme ×2, push token) yeni RPC'lere taşınmalı → **yayın sonrası** (bilinen borç, aşağıda).

---

### 9. Diğer UI / kod temizliği

| Sorun | Çözüm |
|-------|--------|
| Onboarding “Başla” butonu tema dışı mor (`#7c3aed`) | `colors.primary` (`#8387C3`) — `OnboardingScreen.tsx` |
| Kullanılmayan `StarfieldBackground.tsx`, `starsApi.ts` | Silindi; unlock zaten Supabase RPC |
| Galaktik Tavsiye (Gemini) bakım maliyeti | Seans sonu LLM kaldırıldı; haftalık rapor + günlük quote kaldı (`50870bf`) |

---

### 10. Production — hızlı sorun tablosu

| Belirti | Kontrol | Çözüm |
|---------|---------|--------|
| “Bağlantının süresi dolmuş” | E-posta linki `/auth/verify` mi? | `deploy:auth-email` + yeni kayıt; Railway `/auth/confirm` redeploy |
| Google `DEVELOPER_ERROR` | SHA-1 / package | `gradlew signingReport` veya `eas credentials`; `com.astrocus.app` |
| Push gelmiyor | FCM + build tipi | `google-services.json`, `prebuild --clean`, release APK (Expo Go değil) |
| Demo giriş yok (release) | Beklenen | `demo@astrocus.dev` yalnızca `__DEV__` |
| Haftalık rapor boş | Edge secrets | `OPENROUTER_API_KEY`, `CRON_SECRET` — [tech-stack.md §10.8](./tech-stack.md#haftalik-cron) |

---

<a id="canliya-gecis-checklist"></a>

## Canlıya geçiş kontrol listesi

Son doğrulama: **2026-06-12** · Adım adımları: [tech-stack.md §10.2](./tech-stack.md#canliya-gecis-adimlari)

### Altyapı

| # | Madde | Durum | Not |
|---|--------|-------|-----|
| 1 | Supabase migration 001–028 | ✅ | Production'da doğrulandı (`028_weekly_reports_authenticated_grant.sql`) |
| 2 | Edge Function `generate-weekly-reports` | ✅ | Deploy edildi, ACTIVE |
| 3 | Haftalık rapor cron | ✅ | `.github/workflows/weekly-reports-cron.yml` |
| 4 | Express API Railway | ✅ | `APP_ENV=production`, `ALLOWED_ORIGIN=false` |
| 5 | `OPENROUTER_API_KEY` Supabase secret | ✅ | Edge Function secrets (Dashboard) |
| 6 | EAS / yerel env production | ✅ | `APP_ENV=production`, `EXPO_PUBLIC_*` release build'de |
| 7 | CI yeşil | ✅ | `.github/workflows/ci.yml` |
| 8 | PostHog / Sentry | ✅ | `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_SENTRY_DSN` |
| 9 | Supabase redirect URLs | ✅ | `astrocus://verify-success`, `astrocus://reset-password`, OAuth |
| 10 | Auth e-posta + SMTP | ✅ | `npm run deploy:auth-email`, `/auth/confirm` köprüsü |

**Gösterge:** ✅ tamam · 🟡 kısmi · ⬜ yapılmadı

### Mobil build

| # | Madde | Durum | Not |
|---|--------|-------|-----|
| 11 | `google-services.json` + prebuild | ✅ | FCM release APK'da |
| 12 | Release AAB/APK | ✅ | `npm run android:release` / `android:bundle` |
| 13 | Gizlilik politikası erişilebilir | ✅ | `/legal/privacy-policy` |
| 14 | Play Console açık test | ✅ | Google Play open testing |

### Smoke test (production build)

- [x] Kayıt → e-posta → `/auth/confirm` → uygulama → onboarding → star-pick
- [x] Google OAuth giriş (release APK)
- [x] Odak seansı tamamla + kutlama (✦)
- [x] Günlük hedef ödülü
- [x] Kilit ekranı ongoing bildirimi
- [x] Arka plan 10 sn uyarı / seans kaybı
- [x] Haftalık rapor kartı
- [x] Hesap silme (test hesabı)

---

<a id="bilinen-teknik-borc"></a>

## Bilinen teknik borç

### 2026-06-12 — Gamification RLS sıkılaştırma (migration 029)

**Bağlam:** Play Store öncesi güvenlik ve temizlik denetimi; gamification tablolarında RLS sıkılaştırma ihtiyacı tespit edildi.

* Güvenlik denetimi sırasında `stardust_ledger`, `sessions`, `user_stars` ve `profiles.total_stardust` tablolarındaki RLS policy'lerinin client'a doğrudan insert/update izni verdiği tespit edildi.
* Risk değerlendirmesi: kullanıcı verisi sızıntısı yok (RLS aktif, izolasyon var), ancak hile/abuse riski mevcut (örn. kullanıcı kendi stardust/total_stardust değerini manipüle edebilir).
* Çözüm tasarlandı ve migration taslağı hazırlandı: `backend/supabase/migrations/029_tighten_gamification_rls.sql` (RPC-only erişim + trigger guard + REVOKE).
* Bu migration, frontend'de 3 kod yolunun (profil güncelleme ×2, push token kaydı) yeni RPC'lere geçirilmesini gerektirdiği için bilinçli olarak yayın sonrasına ertelendi (known technical debt).

**Dokümantasyon:** Bu dosya — “Bilinen teknik borç” ve “Canlıya geçiş kontrol listesi” bölümleri.

---

<a id="offline-sync-v2"></a>

### 2026-06-12 — Çevrimdışı seans senkronu (UI kapalı, v2)

**Bağlam:** Çevrimdışı tamamlama ve senkron akışı uçtan uca güvenilir çalışmıyor; kullanıcıya yanıltıcı “kuyruğa alındı / senkronize et” deneyimi sunulmaması için v1'den gizlendi.

**Kod (korundu — teknik borç):**

* `context/session/offlineQueue.ts`, `offlineSessions.ts`, `api.syncSessions`, `OFFLINE_SESSION_SYNC_ENABLED = false`
* `CelebrationModal` `pendingSync` dalı (tetiklenmez)
* `components/settings/OfflineSyncButton.tsx` (kullanılmıyor)

**Ürün / UI değişiklikleri:**

* Ayarlar ekranından “Çevrimdışı seanslar” bloğu ve senkron butonu kaldırıldı (`SettingsScreen.tsx`).
* Ağ hatasında seans kaydı kuyruğa alınmıyor; kullanıcıya standart **seans kaydedilemedi** uyarısı gösteriliyor.
* Bekleyen seanslar istatistiklere yansıtılmıyor (`displaySessions` yalnızca sunucu seansları).
* Otomatik NetInfo senkronu devre dışı (`OFFLINE_SESSION_SYNC_ENABLED` false iken).

**Sonraki güncelleme (v2):** Flag `true`, ayarlar UI'si, kutlama `pendingSync` metinleri ve gizlilik politikası metni yeniden etkinleştirilecek.

---

<a id="mvp-durum"></a>

## MVP özellik durumu (kod × production)

| # | Özellik | Kod | Production |
|---|---------|-----|--------------|
| 01 | Odak zamanlayıcısı | ✅ | ✅ |
| 02 | Takımyıldızı / Galaksi | ✅ | ✅ |
| 03 | Yıldız tozu (10 ✦/dk, manuel unlock) | ✅ | ✅ |
| 04 | Gökyüzü UI (kartlar + Skia) | ✅ | ✅ |
| 05 | 8 odak kategorisi | ✅ | ✅ |
| 06 | Arka plan toleransı + uyarı | ✅ | ✅ |
| 07 | Günlük özet + hedef | ✅ | ✅ |
| 08 | Streak | ✅ | ✅ |
| 09 | Hesap (e-posta, Google) | ✅ | ✅ |
| 10 | Onboarding (4 slayt + star-pick) | ✅ | ✅ |
| 11 | Kutlama modalı (✦, streak, rozet) | ✅ | ✅ |
| 12 | TR / EN | ✅ | ✅ |
| 13 | Haftalık AI rapor (Gemma 4) | ✅ | ✅ Edge Function |
| 14 | Günlük quote push + evren mesajı | ✅ | ✅ |
| 15 | Rozetler, ayarlar, hesap silme | ✅ | ✅ |

**Not:** Çevrimdışı seans senkronu MVP kapsamında **kullanıcıya sunulmuyor** (teknik borç, yukarıda).

---

<a id="acik-isler"></a>

## Açık işler ve riskler (2026-06-12)

| Öncelik | Madde | Not |
|---------|-------|-----|
| Borç | Migration **029** RLS sıkılaştırma | Yayın sonrası; “Bilinen teknik borç” bölümü |
| Borç | **Çevrimdışı seans senkronu** | `OFFLINE_SESSION_SYNC_ENABLED = false`; v2 |
| v2 | iOS App Store + Apple Sign In mağaza testi | Kod hazır; yayın yok |
| v2 | Bildirim aç/kapa UI (ayarlar) | Token kaydı auth sonrası otomatik |

---

## Mimari referans (kısa)

```
Mobil (Expo Router)
  → Supabase Auth + RPC (seans, unlock, günlük hedef, streak)
  → Express API / Railway (auth e-posta köprüsü, analytics, hesap silme)
  → Edge Functions (haftalık rapor OpenRouter, günlük quote Expo Push)
```

**Ana rotalar:** `(tabs)/session` · `(tabs)/galaxy` · `(tabs)/profile` · `settings` · `badges` · `universe-message` · `legal/*`

**State:** `AuthContext`, `SessionContext`, `UIContext`, `NotificationContext` → `useAppContext()` facade

**Detaylı bileşen envanteri:** Önceki sürümlerde bu dosyada tutuluyordu; güncel kod için `frontend/src/` ve `frontend/app/` dizin yapısı referans alınmalı. İç geliştirme sprint planı: [plan.md](./plan.md) — **bu dosya (`progress.md`) güncel durum kaynağıdır**.

---

## Geliştirme yaklaşımı (özet)

1. Önce PRD/MVP tutarlılığı, sonra çalışan iskelet.
2. Kritik ödül ve ilerleme → sunucu RPC (anti-cheat).
3. LLM yalnızca haftalık rapor; seans sonu AI v1'de yok.
4. Katalog verisi Supabase'den (`skyCatalog.ts`).
5. AI destekli geliştirme: Cursor + Claude; bootcamp prodocs Cursor ile tamamlandı.

---

*Astrocus Progress — bootcamp teslim sürümü, 2026-06-12*
