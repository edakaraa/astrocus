# Auth e-posta şablonları (doğrulama + şifre sıfırlama)

Supabase Auth e-postaları: kayıt doğrulama (`confirmation`) ve şifre sıfırlama (`recovery`).

| Ayar | Değer |
|------|--------|
| Bağlantı geçerliliği | **15 dakika** (`900` saniye) |
| Şablonlar | `backend/supabase/templates/confirmation.html`, `recovery.html` |
| Renk paleti | `frontend/src/theme/index.ts` ile uyumlu |
| Site URL | `https://astrocus.up.railway.app` |

## Akış (production)

E-posta güvenlik tarayıcılarının (Gmail, Outlook) tek kullanımlık linki tüketmemesi için **iki adımlı** köprü kullanılır:

```
E-posta düğmesi
    → GET /auth/confirm?token_hash=...&type=signup&path=verify-success
        (token henüz doğrulanmaz; ara HTML sayfası)
    → Kullanıcı "E-postamı doğrula" düğmesine basar
    → GET /auth/verify?token_hash=...&type=signup&path=verify-success
        (verifyOtp çalışır)
    → astrocus://verify-success#access_token=...&refresh_token=...&type=signup
    → Uygulama deep link handler → /verify-success ekranı
```

Şifre sıfırlama aynı mantıkla `type=recovery` ve `path=reset-password` kullanır.

Kod: `backend/src/routes/auth.routes.ts` (`/auth/confirm`, `/auth/verify`).

## Uzak Supabase projesine uygulama

Script `backend/.env` dosyasını otomatik okur. Gerekli anahtarlar:

```env
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_PROJECT_REF=yunvuwcaxumhcyqppikn

# SMTP (kayıt e-postası gönderimi için zorunlu)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_ADMIN_EMAIL=astrocus@techsider.co
```

**Windows / PowerShell:**

```powershell
cd backend
npm run deploy:auth-email
```

**Linux / macOS (env shell’de yoksa):**

```bash
cd backend
export SUPABASE_ACCESS_TOKEN="..."
export SUPABASE_PROJECT_REF="yunvuwcaxumhcyqppikn"
npm run deploy:auth-email
```

Beklenen çıktı:

```
[Astrocus] Custom SMTP ayarları payload'a eklendi: smtp.resend.com
Auth e-posta + redirect ayarları güncellendi (OTP: 900 sn / 15 dk).
```

Script şunları günceller:

- `mailer_otp_exp` → `900` (15 dk)
- `mailer_templates_confirmation_content` / `recovery_content`
- `site_url` → Railway API URL
- `uri_allow_list` → `astrocus://verify-success`, `astrocus://reset-password`, vb.
- SMTP ayarları (`.env` doluysa)

> **Not:** `.env` satır sonu yorumları (`# ...`) script tarafından otomatik temizlenir.

**Alternatif (tüm `config.toml` auth bloğu — dikkatli kullanın):**

```bash
cd backend
npx supabase config push --yes
```

`config push` tüm auth ayarlarını yazar. Yalnızca şablon güncellemek için `deploy:auth-email` yeterlidir.

## Supabase Dashboard kontrol listesi

1. **Authentication → URL Configuration**
   - Site URL: `https://astrocus.up.railway.app`
   - Redirect URLs: `astrocus://verify-success`, `astrocus://reset-password`, OAuth callback’ler
2. **Authentication → Email Templates** — deploy sonrası özel HTML görünmeli
3. **Authentication → Providers → Email** — OTP expiration `900` sn

## Mobil `.env` (kayıt `emailRedirectTo` fallback)

```env
EXPO_PUBLIC_AUTH_VERIFY_REDIRECT_URI=astrocus://verify-success
EXPO_PUBLIC_AUTH_RESET_REDIRECT_URI=astrocus://reset-password
```

`astrocus://verify-email` **kullanma** — uygulama rotası `verify-success`.

E-posta şablonundaki asıl link `SiteURL/auth/confirm` olduğu için bu değişken çoğunlukla `signUp` fallback’idir; yine de doğru tutulmalı.

## Custom SMTP

Supabase varsayılan e-posta göndericisi production'da sık sık **"Error sending confirmation email"** hatasına yol açar. Canlıda **custom SMTP** (Resend vb.) şarttır.

Alternatif: Supabase Dashboard → **Authentication** → **SMTP Settings**.

## Yerel geliştirme

`backend/supabase/config.toml` içinde `[auth.email]` ve şablon yolları tanımlıdır. Değişiklikten sonra:

```bash
cd backend
npx supabase stop
npx supabase start
```

## Sorun giderme

| Belirti | Olası neden | Çözüm |
|---------|-------------|--------|
| Railway'de takılı kalıyor (`astrocus.up.railway.app`) | **ALLOWED_ORIGIN=false değil** — CORS ile ilgisi yok | Backend redeploy; `/auth/confirm` düğmesi artık JS gerektirmez |
| Şifre sıfırlama uygulamayı açmıyor | Gmail/Outlook WebView `astrocus://` otomatik açmaz | "Astrocus'u aç" düğmesine dokun |
| `deploy:auth-email` token hatası | `.env` okunmuyor / token yok | `backend/.env` doldur, script güncel |
| `smtp_port: Expected string` | API tip hatası | Script güncel (string gönderir) |
| Süresi dolmuş (yeni mail) | Eski şablon `/auth/verify` | `deploy:auth-email` + yeni sıfırlama maili |
| Uygulama açılmıyor | Yanlış redirect URI | `astrocus://verify-success`, `astrocus://reset-password` |

Tam akış: [production-go-live.md](./production-go-live.md)
