# Astrocus

Odaklanma seanslarını galaksi inşa deneyimine dönüştüren mobil uygulama (Expo + Supabase).

## Canlıya geçiş (baştan sona)

**Ana rehber:** [docs/production-go-live.md](docs/production-go-live.md) — ortam değişkenleri, e-posta doğrulama, release build, smoke test, sorun giderme.

## Yayın öncesi

- [Yayın kontrol listesi](docs/release-checklist.md)
- [Android release APK/AAB (yerel)](docs/android-local-release.md)
- [Backend deploy (Railway)](docs/backend-deploy.md)
- [Auth e-posta şablonları + SMTP](docs/auth-email-templates.md)
- [Haftalık rapor cron](docs/weekly-reports-cron.md)
- [Ürün kararları & ilerleme](prodocs/progress.md) · [PRD v1.3](prodocs/PRD.md)

## Kurulum (özet)

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Production için `APP_ENV=production` ve API URL'lerini doldur. Detay: [production-go-live.md](docs/production-go-live.md) §2.

## Hızlı komutlar

```powershell
# E-posta şablonlarını Supabase'e yükle
cd backend
npm run deploy:auth-email

# Android release APK
cd frontend
npm run android:release
```
