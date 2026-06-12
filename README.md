# Astrocus

Odaklanma seanslarını galaksi inşa deneyimine dönüştüren mobil uygulama (Expo + Supabase).

## Dokümantasyon

| Döküman | İçerik |
|---------|--------|
| [`prodocs/`](./prodocs/README.md) | Bootcamp teslim seti (PRD, plan, progress, tech-stack, DesignSystem) |

**Canlıya geçiş:** [tech-stack.md §10](./prodocs/tech-stack.md#devops)  
**Hatalar ve çözümler:** [progress.md](./prodocs/progress.md#karsilasilan-sorunlar)  
**Yayın checklist:** [progress.md](./prodocs/progress.md#canliya-gecis-checklist)

## Kurulum (özet)

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Production için `APP_ENV=production` ve `EXPO_PUBLIC_*` değerlerini doldur. Ayrıntı: [tech-stack.md §10.1](./prodocs/tech-stack.md#prod-env).

## Hızlı komutlar

```powershell
cd backend
npm run deploy:auth-email

cd frontend
npm run android:release
```
