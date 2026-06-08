# Android release build (EAS kotası olmadan)

EAS free kotası dolsa bile **yerel release APK/AAB** alabilirsin.

## Önkoşullar

- Android Studio + SDK
- `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
- `frontend/google-services.json` (push için) — `docs/fcm-android-setup.md`
- `frontend/.env` production değerleri

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

## Sentry source map (isteğe bağlı)

Yerel release build'de `SENTRY_AUTH_TOKEN` yoksa source map yüklemesi otomatik atlanır (APK/AAB yine üretilir). Token ile yüklemek için:

```powershell
$env:SENTRY_AUTH_TOKEN = "sntrys_..."
npm run android:release
```

Token: Sentry → Settings → Auth Tokens.

## Google Sign-In SHA-1

| Build | SHA-1 |
|-------|--------|
| `npm run android:local` (debug) | `gradlew signingReport` → Variant debug |
| Release (şimdilik debug keystore) | Aynı debug SHA-1 |
| EAS / kendi upload keystore | O keystore'un SHA-1'i |

Hepsini Google Android client'a ekle (birden fazla SHA-1 olabilir).

## EAS ne zaman?

- Play App Signing + upload key yönetimi
- CI/CD
- iOS

Kota yenilenince veya Starter plan ile EAS'e geçebilirsin; canlı çıkış için **yerel AAB yeterli**.
