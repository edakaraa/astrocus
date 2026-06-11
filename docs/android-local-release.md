# Android release build (EAS kotası olmadan)

EAS free kotası dolsa bile **yerel release APK/AAB** alabilirsin.

**Tam canlıya geçiş rehberi:** [production-go-live.md](./production-go-live.md)

## Önkoşullar

- Android Studio + SDK
- `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
- `frontend/google-services.json` (push için) — `docs/fcm-android-setup.md`  
  > Dosya `.gitignore`'da; repoda görünmez ama `frontend/` kökünde olmalı.
- `frontend/.env` production değerleri (`APP_ENV=production`)

### `frontend/.env` kontrol listesi (release öncesi)

```env
APP_ENV=production
EXPO_PUBLIC_API_URL=https://astrocus.up.railway.app/
EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI=astrocus://verify-success
EXPO_PUBLIC_AUTH_RESET_REDIRECT_URI=astrocus://reset-password
# + Supabase, PostHog, Sentry, Google OAuth anahtarları
```

`.env` değiştirdikten sonra APK'yı **yeniden** build et — değerler bundle'a gömülür.

## İlk kez veya `google-services.json` değiştiyse

```powershell
cd frontend
npx expo prebuild --platform android --clean
```

## Debug APK (telefonda hızlı test)

```powershell
cd frontend
npm run android:local
```

Google Sign-In için Google Console Android client'a **debug SHA-1** ekle (`gradlew signingReport`).

## Release APK (kapalı test / dağıtım)

```powershell
cd frontend
npm run android:release
```

Script (`scripts/build-release-apk.ps1`) otomatik set eder: `APP_ENV=production`, `NODE_ENV=production`.

Çıktı: `frontend/android/app/build/outputs/apk/release/app-release.apk`

> Varsayılan Expo prebuild release imzası şimdilik **debug keystore** kullanır (Play Store öncesi upload keystore ayarla).

## Release AAB (Play Store)

```powershell
cd frontend
npm run android:bundle
```

Çıktı: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

## Production ortam değişkenleri

Release bundle sırasında `APP_ENV=production` ve `.env` içindeki `EXPO_PUBLIC_*` gömülür.

EAS secrets yerine yerel `.env` kullanılır — canlı değerlerin dolu olduğundan emin ol.

`app.config.ts` production'da yerel `localhost` API URL'sini yok sayar; `EXPO_PUBLIC_API_URL` Railway olmalı.

## Sentry source map (isteğe bağlı)

Yerel release build'de `SENTRY_AUTH_TOKEN` yoksa source map yüklemesi otomatik atlanır (APK/AAB yine üretilir). Token ile yüklemek için:

```powershell
$env:SENTRY_AUTH_TOKEN = "sntrys_..."
npm run android:release
```

Token: Sentry → Settings → Auth Tokens.

## Google Sign-In SHA-1

```powershell
cd frontend\android
.\gradlew.bat signingReport
```

| Build | SHA-1 |
|-------|--------|
| `npm run android:local` (debug) | `signingReport` → Variant **debug** |
| Release (şimdilik debug keystore) | Aynı debug SHA-1 |
| EAS / kendi upload keystore | O keystore'un SHA-1'i |

Hepsini Google Android client'a ekle (`com.astrocus.app`, birden fazla SHA-1 olabilir).

## Release sonrası smoke test

Bkz. [release-checklist.md](./release-checklist.md) — özellikle e-posta doğrulama (`/auth/confirm`) ve push bildirimleri.

## EAS ne zaman?

- Play App Signing + upload key yönetimi
- CI/CD
- iOS

Kota yenilenince veya Starter plan ile EAS'e geçebilirsin; canlı çıkış için **yerel AAB yeterli**.
