# Astrocus — Demo Video Kontrol Listesi

Ders teslimi için 3–5 dakikalık ekran kaydı önerilen akış:

1. **Giriş** — E-posta veya Google/Apple OAuth ile oturum açma
2. **Onboarding** — Tanıtım slaytları ve ilk yıldız seçimi
3. **Odak seansı** — Kategori + süre seç, seansı tamamla
4. **Kutlama** — Stardust, XP, (varsa) yeni rozet ve Galaktik Tavsiye (LLM)
5. **Gökyüzü** — Yıldız kilidini açma veya açılmış yıldızları görüntüleme
6. **Profil** — Streak, rozetler, analytics özeti
7. **Backend** (kısa) — `GET /health` ve canlı API URL’si

## Ortam

- Backend: `cd backend && npm run dev` veya deploy URL
- Frontend: `EXPO_PUBLIC_API_URL` fiziksel cihazda LAN IP olmalı
- Supabase: migration’lar uygulanmış (`db push`)

## Kayıt ipuçları

- iOS: Ekran Kaydı veya QuickTime (Mac + iPhone)
- Android: Dahili ekran kaydı veya `adb shell screenrecord`
- Ses: kısa anlatım veya altyazı
