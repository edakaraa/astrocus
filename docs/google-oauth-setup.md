# Google OAuth (Astrocus) — Native Sign-In

Mobil uygulama **native Google Sign-In** (`@react-native-google-signin/google-signin`) kullanır:

1. Sistem Google hesap seçici (tarayıcı yok)
2. `id_token` alınır
3. `supabase.auth.signInWithIdToken` ile oturum açılır

**Redirect URI, IP veya `exp://` yok.** Expo Go'da çalışmaz; preview/production build gerekir.

## Gereksinimler

| Nerede | Ne |
|--------|-----|
| **Google Web client** | Client ID + secret → **Supabase** Google provider |
| **Google Android client** | Package `com.astrocus.app` + **EAS keystore SHA-1** |
| **EAS secrets** | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (zorunlu) |
| **Supabase Redirect URLs** | `astrocus://auth/callback` (e-posta akışları için; Google native girişte kullanılmaz) |

## 1. Google Cloud Console

[Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.

### Web client (Supabase için)

1. **OAuth client ID** → **Web application**
2. **Authorized redirect URIs:** yalnızca `https://<proje-ref>.supabase.co/auth/v1/callback`
3. Client ID + secret → Supabase **Authentication → Providers → Google**

### Android client (native giriş için)

1. **OAuth client ID** → **Android**
2. **Package name:** `com.astrocus.app`
3. **SHA-1:** EAS build keystore fingerprint

```bash
cd frontend
npx eas credentials -p android
```

Preview/production APK ile test ediyorsanız **EAS SHA-1** şart. Yerel debug SHA-1 yalnızca `expo run:android` için geçerlidir.

### iOS (ileride)

- Bundle ID: `com.astrocus.app`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` + config plugin `iosUrlScheme` (otomatik, Web client ID'den türetilir)

## 2. OAuth consent screen

- **Testing:** test kullanıcılarına Gmail ekle
- **Production:** tüm kullanıcılar için yayınla (doğrulama gerekebilir)

## 3. Supabase

**Providers → Google:** Web client ID + secret, enabled.

**Redirect URLs:** `astrocus://auth/callback`, `astrocus://verify-success`, `astrocus://reset-password`

## 4. EAS secrets

```bash
cd frontend
npx eas secret:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "....apps.googleusercontent.com" --scope project
```

Build sonrası client ID uygulamaya gömülür.

## 5. Build ve test

```bash
cd frontend
eas build -p android --profile preview
```

APK kur → Google ile giriş.

Kod değişiklikleri Metro ile güncellenir; **native modül veya env değişince** yeni build gerekir.

## Sık hatalar

| Hata | Sebep |
|------|--------|
| `DEVELOPER_ERROR` | Android client SHA-1 / package uyumsuz |
| Expo Go'da giriş yok | Beklenen — preview build kullan |
| `invalid_request` (eski tarayıcı akışı) | Artık kullanılmıyor; yeni build al |
| Supabase oturum hatası | Supabase Google provider Web client ID/secret kontrol et |
