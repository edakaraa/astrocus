# Android push (FCM) — canlı zorunlu

Hata: `Default FirebaseApp is not initialized` → native build'de `google-services.json` yok.

## 1. Firebase projesi

1. [Firebase Console](https://console.firebase.google.com/) → proje oluştur (veya mevcut Google Cloud projesini bağla)
2. **Add app** → **Android**
3. Package name: `com.astrocus.app`
4. `google-services.json` indir → `frontend/google-services.json` (gitignore'da, commit etme)

## 2. Native projeyi yenile

```bash
cd frontend
npx expo prebuild --platform android --clean
```

## 3. Expo / EAS FCM credentials (sunucudan push göndermek için)

Expo Push API Android cihazlara FCM v1 ile gönderir:

```bash
cd frontend
npx eas credentials
```

→ Android → Push Notifications → FCM V1 service account key yükle (Firebase → Project settings → Service accounts → Generate new private key).

Kota doluysa credentials komutu çalışır; yalnızca **cloud build** şart değil.

Alternatif: [Expo dashboard](https://expo.dev) → Project → Credentials → Android → FCM.

## 4. Yerel release / debug build

`google-services.json` eklendikten ve `prebuild --clean` sonrası push token kaydı çalışır.

## 5. Doğrulama

1. Uygulamada giriş yap (bildirim izni ver)
2. Supabase `profiles.expo_push_token` dolu mu?
3. Test push: [Expo push tool](https://expo.dev/notifications) veya `send-daily-quote` edge function
