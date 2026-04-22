# Astrocus QA Checklist

## Auth ve Onboarding

- [ ] E-posta + sifre ile kayit olunabiliyor.
- [ ] E-posta + sifre ile giris yapilabiliyor.
- [ ] Google ve Apple giris butonlari demo provider flow ile calisiyor.
- [ ] Onboarding 3 adimdan olusuyor.
- [ ] Kullanici bir yildiz secmeden onboarding tamamlanmiyor.

## Seans Dongusu

- [ ] Kullanici 15, 25, 45 ve 60 dakika arasindan sure secebiliyor.
- [ ] Kategori secimi seans baslamadan once yapilabiliyor.
- [ ] Zamanlayici baslat / duraklat / devam et / sifirla akislari calisiyor.
- [ ] Duraklatma en fazla 1 kez kullanilabiliyor.
- [ ] Uygulama arka plana alindiginda 20 saniye tolerans mantigi devreye giriyor.
- [ ] Uygulama 20 saniye icinde geri acilirsa seans devam ediyor.
- [ ] Uygulama 20 saniyeden uzun arka planda kalirsa seans kaybediliyor.
- [ ] Seans bitince kutlama karti gorunuyor.

## Oyunlastirma ve Profil

- [ ] Tamamlanan seans sonunda stardust hesaplaniyor.
- [ ] Yeterli stardust oldugunda yeni yildiz aciliyor.
- [ ] Profil ekraninda gunluk toplam sure gorunuyor.
- [ ] Profil ekraninda aktif ve en uzun streak gorunuyor.
- [ ] Dil degisikligi aninda uygulanıyor.
- [ ] Avatar degisikligi profile kaydediliyor.

## Offline ve Sync

- [ ] API kapaliyken tamamlanan seans offline kuyruga dusuyor.
- [ ] Profil ekranindaki sync butonu offline seanslari senkronize ediyor.
- [ ] Sync sonrasi offline kuyruk sifirlaniyor.

## Teknik Kontroller

- [ ] `npm run typecheck`
- [ ] `npm --prefix server run typecheck`
- [ ] `GET /health` 200 donuyor
