# Auth e-posta şablonları (doğrulama + şifre sıfırlama)

Supabase Auth e-postaları: kayıt doğrulama (`confirmation`) ve şifre sıfırlama (`recovery`).

| Ayar | Değer |
|------|--------|
| Bağlantı geçerliliği | **15 dakika** (`900` saniye) |
| Şablonlar | `backend/supabase/templates/confirmation.html`, `recovery.html` |
| Renk paleti | `frontend/src/theme/index.ts` ile uyumlu |

## Uzak Supabase projesine uygulama

**Önerilen (yalnızca e-posta ayarları — redirect URL'lere dokunmaz):**

```bash
cd backend
export SUPABASE_ACCESS_TOKEN="..."   # Dashboard → Account → Access Tokens
export SUPABASE_PROJECT_REF="yunvuwcaxumhcyqppikn"

npm run deploy:auth-email
```

**Alternatif (tüm `config.toml` auth bloğu — dikkatli kullanın):**

```bash
cd backend
npx supabase config push --yes
```

`config push` `site_url` ve `additional_redirect_urls` dahil tüm auth ayarlarını yazar. Şablon veya OTP süresi dışında bir şey değiştirmeyecekseniz `deploy:auth-email` tercih edin.

Script / config şunları günceller:

- `mailer_otp_exp` / `otp_expiry` → `900` (15 dk)
- `mailer_subjects_confirmation` / `mailer_templates_confirmation_content`
- `mailer_subjects_recovery` / `mailer_templates_recovery_content`

## Yerel geliştirme

`backend/supabase/config.toml` içinde `[auth.email]` ve şablon yolları tanımlıdır. Değişiklikten sonra:

```bash
cd backend
npx supabase stop
npx supabase start
```

## Custom SMTP (kayıt / şifre sıfırlama e-postaları)

Supabase varsayılan e-posta göndericisi production'da sık sık **"Error sending confirmation email"** hatasına yol açar. Canlıda çalışması için **custom SMTP** (Resend, SendGrid, Brevo vb.) şarttır.

1. Sağlayıcıdan SMTP bilgilerini alın (`host`, `port`, `user`, `password`, gönderen adresi).
2. `backend/.env` içine ekleyin (git'e commit etmeyin):

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_ADMIN_EMAIL=onboarding@resend.dev
```

3. Deploy script'ini çalıştırın:

```bash
cd backend
npm run deploy:auth-email
```

Alternatif: Supabase Dashboard → **Authentication** → **SMTP Settings** üzerinden aynı bilgileri girin.

## Manuel (Dashboard)

1. [Supabase Dashboard](https://supabase.com/dashboard) → proje → **Authentication** → **Email Templates**
2. **Confirm signup** ve **Reset password** şablonlarının içeriğini `templates/` dosyalarından kopyala
3. **Authentication** → **Providers** → **Email** → **Email OTP Expiration** → `900` saniye
