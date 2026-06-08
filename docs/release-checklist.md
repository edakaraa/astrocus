# v1 Yayın Kontrol Listesi

Son doğrulama: **2026-06-07**

## Altyapı

| # | Madde | Durum | Not |
|---|--------|-------|-----|
| 1 | Supabase migration 001–028 | ⬜ | `028_weekly_reports_authenticated_grant.sql` push; `supabase migration list` |
| 2 | Edge Function `generate-weekly-reports` | ⬜ | ACTIVE + cron |
| 3 | Haftalık rapor cron | ⬜ | `docs/weekly-reports-cron.md` |
| 4 | Express API production deploy | ⬜ | Railway; `ALLOWED_ORIGIN=false` veya `https://astrocus.app` |
| 4b | RLS tüm tablolarda aktif | ⬜ | `backend/supabase/scripts/verify-rls.sql` |
| 4c | Edge Function cron auth | ⬜ | `CRON_SECRET` (≥32 char) |
| 5 | `OPENROUTER_API_KEY` Supabase secret | ⬜ | `docs/weekly-reports-cron.md` |
| 6 | EAS env (production) | ⬜ | `APP_ENV=production` (eas.json); `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, Google OAuth — bkz. `docs/google-oauth-setup.md` |
| 7 | CI yeşil | ⬜ | `.github/workflows/ci.yml` |
| 8 | PostHog (opsiyonel) | ⬜ | `EXPO_PUBLIC_POSTHOG_KEY` |
| 9 | Sentry crash DSN (önerilir) | ⬜ | `EXPO_PUBLIC_SENTRY_DSN` |
| 10 | Supabase redirect URLs | ⬜ | `astrocus://verify-success`, `astrocus://reset-password`, OAuth callback |
| 10b | Auth e-posta OTP + şablonlar | ⬜ | `npm run deploy:auth-email` — `docs/auth-email-templates.md` (15 dk, marka renkleri) |

## Mobil build

| # | Madde | Durum |
|---|--------|-------|
| 11 | Android FCM `google-services.json` + `prebuild --clean` | ⬜ | `docs/fcm-android-setup.md` |
| 11b | EAS FCM v1 service account (push gönderimi) | ⬜ | `eas credentials` veya Expo Dashboard |
| 12 | Release AAB/APK | ⬜ | `npm run android:bundle` veya EAS — `docs/android-local-release.md` |
| 13 | Gizlilik politikası (kayıt öncesi erişilebilir) | ✅ `/legal/privacy-policy` herkese açık |
| 14 | Play Console kapalı test | ⬜ |

## Smoke test (cihaz, production build)

- [ ] Kayıt → e-posta doğrulama → onboarding → star-pick
- [ ] Google OAuth giriş
- [ ] Odak seansı tamamla + kutlama
- [ ] Günlük hedef onayla + dinamik ödül (hedef × 3 ✦)
- [ ] Kilit ekranı ongoing bildirimi (Android)
- [ ] Offline seans → sync
- [ ] Haftalık rapor kartı (cron sonrası)
- [ ] Hesap silme

## Bilinçli kapsam dışı (v1)

Bkz. `prodocs/PRD.md` — Apple Sign In (Android-first), Expo Go production desteği yok.
