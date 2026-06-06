# v1 Yayın Kontrol Listesi

Son doğrulama: **2026-06-05**

## Altyapı

| # | Madde | Durum | Not |
|---|--------|-------|-----|
| 1 | Supabase migration 001–016 | ✅ | `supabase migration list` — Local = Remote |
| 2 | Edge Function `generate-weekly-reports` | ✅ | ACTIVE v8 |
| 3 | Haftalık rapor cron | ⬜ | `docs/weekly-reports-cron.md` |
| 4 | Express API production deploy | ⬜ | `docs/backend-deploy.md`; Railway: `ALLOWED_ORIGIN=https://astrocus.app` |
| 4b | RLS tüm tablolarda aktif | ⬜ | `backend/supabase/scripts/verify-rls.sql` |
| 4c | Edge Function cron auth | ⬜ | Yalnızca `CRON_SECRET` (≥32 char); function redeploy |
| 5 | `OPENROUTER_API_KEY` Supabase secret | ⬜ | `docs/weekly-reports-cron.md` |
| 6 | EAS Secrets (production) | ⬜ | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| 7 | CI yeşil | ⬜ | `.github/workflows/ci.yml` |
| 8 | PostHog (veya analitik) | ⬜ | `EXPO_PUBLIC_POSTHOG_API_KEY` |
| 9 | Sentry crash DSN | ⬜ | `EXPO_PUBLIC_SENTRY_DSN` |
| 10 | Google OAuth redirect | ⬜ | `docs/oauth-expo-go.md` |

## Mağaza

| # | Madde | Durum |
|---|--------|-------|
| 11 | EAS preview APK build | ⬜ |
| 12 | Play Console kapalı test | ⬜ |
| 13 | Gizlilik politikası URL | ✅ in-app |
| 14 | Demo video | ⬜ `docs/demo-video-outline.md` |

## Smoke test (cihaz)

- [ ] Kayıt → onboarding → star-pick → seans tamamla
- [ ] Kutlama + AI tavsiye (API canlı)
- [ ] Manuel yıldız unlock
- [ ] Günlük hedef onayla + ilerleme
- [ ] Offline seans → sync
- [ ] Haftalık rapor kartı (cron sonrası)

## Bilinçli kapsam dışı (v1)

Bkz. `prodocs/PRD.md` §3.3 — duraklatma 5 dk, skip, seans ekranında yıldız, otomatik unlock, Apple Sign In (Android-first).
