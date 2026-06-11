# v1 Yayın Kontrol Listesi

Son doğrulama: **2026-06-11**  
**Tam rehber:** [production-go-live.md](./production-go-live.md) (adım adım, sorun giderme, kod değişiklikleri)

## Altyapı

| # | Madde | Durum | Not |
|---|--------|-------|-----|
| 1 | Supabase migration 001–028 | ⬜ | `028_weekly_reports_authenticated_grant.sql` push; `supabase migration list` |
| 2 | Edge Function `generate-weekly-reports` | ⬜ | ACTIVE + cron |
| 3 | Haftalık rapor cron | ⬜ | `docs/weekly-reports-cron.md` |
| 4 | Express API production deploy | 🟡 | Railway; `APP_ENV=production`, `ALLOWED_ORIGIN=false` — redeploy `/auth/confirm` sonrası |
| 4b | RLS tüm tablolarda aktif | ⬜ | `backend/supabase/scripts/verify-rls.sql` |
| 4c | Edge Function cron auth | ⬜ | `CRON_SECRET` (≥32 char) |
| 5 | `OPENROUTER_API_KEY` Supabase secret | ⬜ | `docs/weekly-reports-cron.md` |
| 6 | EAS / yerel env (production) | 🟡 | `APP_ENV=production`; `EXPO_PUBLIC_*` dolu — bkz. `frontend/.env.example` |
| 7 | CI yeşil | ⬜ | `.github/workflows/ci.yml` |
| 8 | PostHog | 🟡 | `EXPO_PUBLIC_POSTHOG_KEY` `.env`'de |
| 9 | Sentry crash DSN | 🟡 | `EXPO_PUBLIC_SENTRY_DSN` + isteğe bağlı `SENTRY_DSN` backend |
| 10 | Supabase redirect URLs | 🟡 | `astrocus://verify-success`, `astrocus://reset-password`, OAuth callback |
| 10b | Auth e-posta OTP + şablonlar | 🟡 | `npm run deploy:auth-email` — `/auth/confirm` ara sayfası (`docs/auth-email-templates.md`) |

**Gösterge:** ✅ tamam · 🟡 yapılandırıldı / deploy bekliyor · ⬜ yapılmadı

## Mobil build

| # | Madde | Durum |
|---|--------|-------|
| 11 | Android FCM `google-services.json` + prebuild | 🟡 | `frontend/google-services.json` (gitignore) — `docs/fcm-android-setup.md` |
| 11b | EAS FCM v1 service account (push gönderimi) | ⬜ | `eas credentials` veya Expo Dashboard |
| 12 | Release AAB/APK | ⬜ | `npm run android:release` — `docs/android-local-release.md` |
| 13 | Gizlilik politikası (kayıt öncesi erişilebilir) | ✅ | `/legal/privacy-policy` herkese açık |
| 14 | Play Console kapalı test | ⬜ |

## Kod / ürün (2026-06-11)

| Madde | Durum |
|-------|--------|
| Onboarding buton rengi (tema `#8387C3`) | ✅ |
| Seans kaybedildi metni 10 sn (bildirimle uyumlu) | ✅ |
| Demo mod yalnızca `__DEV__` | ✅ |
| E-posta `/auth/confirm` köprüsü | ✅ kod · 🟡 Railway deploy |
| Ölü kod: `StarfieldBackground`, `starsApi` | ✅ silindi |

## Smoke test (cihaz, production build)

- [ ] Kayıt → e-posta → `/auth/confirm` → uygulama → onboarding → star-pick
- [ ] Google OAuth giriş
- [ ] Odak seansı tamamla + kutlama
- [ ] Günlük hedef onayla + dinamik ödül (hedef × 3 ✦)
- [ ] Kilit ekranı ongoing bildirimi (Android)
- [ ] Arka plan 10 sn uyarı / seans kaybı mesajı
- [ ] Offline seans → sync
- [ ] Haftalık rapor kartı (cron sonrası)
- [ ] Hesap silme

## Bilinçli kapsam dışı (v1)

Bkz. `prodocs/PRD.md` — Apple Sign In (Android-first), Expo Go production desteği yok.
