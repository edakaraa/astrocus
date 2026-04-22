# Astrocus Uygulama Takip Planı

Bu dosya, projede neyin yapildigini ve neyin kaldigini hizli takip etmek icin kullanilir.

## Durum Anahtari

- `[x]` Tamamlandi
- `[ ]` Henuz yapilmadi
- `[-]` Basit MVP / demo surumu var, production seviyesi degil

## 1. Proje Iskeleti

- [x] Root `package.json` olusturuldu
- [x] Expo tabanli mobil uygulama iskeleti kuruldu
- [x] `App.tsx` giris noktasi olusturuldu
- [x] `src/` klasor yapisi kuruldu
- [x] `server/` klasoru ve ayri API yapisi olusturuldu
- [x] Root `tsconfig.json` eklendi
- [x] Server `tsconfig.json` eklendi
- [x] `babel.config.js` eklendi
- [x] `app.json` eklendi
- [x] `.gitignore` eklendi
- [x] TypeScript typecheck komutlari calisiyor

## 2. Ortak Uygulama Altyapisi

- [x] Uygulama temasi ve design token'lar eklendi
- [x] Ortak tipler (`types.ts`) tanimlandi
- [x] Ortak sabitler (`constants.ts`) tanimlandi
- [x] Basit i18n yapisi kuruldu
- [x] Secure / async storage ayrimi kuruldu
- [x] Basit analytics kayit yapisi eklendi
- [x] Lokal notification scheduling yardimcilari eklendi
- [x] API client katmani olusturuldu
- [ ] Yeniden kullanilabilir UI component kutuphanesi (`Button`, `Card`, `Modal`, `ProgressBar`) ayri klasorde ayrilmadi

## 3. Navigation ve Uygulama Akisi

- [x] `RootNavigator` kuruldu
- [x] Loading ekrani eklendi
- [x] Auth yoksa `AuthScreen` akisi calisiyor
- [x] Onboarding tamamlanmadiysa `OnboardingScreen` aciliyor
- [x] Onboarding tamamlandiysa tab yapisina geciliyor
- [x] `Session`, `Galaxy`, `Profile` tab ekranlari eklendi

## 4. Auth ve Profil

- [x] E-posta + sifre kayit akisi eklendi
- [x] E-posta + sifre giris akisi eklendi
- [-] Google giris butonu demo provider akisi ile calisiyor
- [-] Apple giris butonu demo provider akisi ile calisiyor
- [x] Token saklama yapisi eklendi
- [x] Bootstrap / session restore mantigi eklendi
- [x] Profilde username gosterimi var
- [x] Profilde avatar guncelleme var
- [x] Profilde galaxy name gosterimi var
- [x] Profilde language guncelleme var
- [ ] Gercek Google OAuth native entegrasyonu yok
- [ ] Gercek Apple Sign In native entegrasyonu yok

## 5. Onboarding

- [x] 3 adimli onboarding eklendi
- [x] Yildiz secimi onboarding icine alindi
- [x] Onboarding tamamlandiginda profile yaziliyor
- [x] Kullanici onboarding bitmeden ana akisa gecemiyor

## 6. Seans ve Timer Motoru

- [x] Sure secimi eklendi
- [x] Kategori secimi eklendi
- [x] Baslat akisi eklendi
- [x] Duraklat akisi eklendi
- [x] Devam et akisi eklendi
- [x] Sifirla akisi eklendi
- [x] Tek duraklatma hakki kurali uygulandi
- [x] Sayaç state yonetimi eklendi
- [x] Seans tamamlaninca otomatik finalize akisi eklendi
- [x] Kutlama karti eklendi

## 7. Arka Plan Toleransi

- [x] `AppState` dinleme mantigi eklendi
- [x] Arka plana gecis zamani kaydediliyor
- [x] 10. saniye lokal uyari planlama mantigi eklendi
- [x] Geri donuste gecen sure timestamp ile hesaplanıyor
- [x] 20 saniyeyi gecerse seans fail oluyor
- [ ] Gercek cihazda iOS / Android davranisi manuel QA ile dogrulanmadi

## 8. Oyunlastirma

- [x] Stardust formulu istemci tarafinda tanimlandi
- [x] Kategori bonusu mantigi eklendi
- [x] Pause etmeme bonusu eklendi
- [x] Streak bonusu mantigi eklendi
- [x] Yildiz katalogu tanimlandi
- [x] Acilan yildizlar hesaplanıyor
- [x] Galaxy ekraninda kilitli / acik ilerleme gosteriliyor
- [ ] Ayrik `user_stars` veritabani modeli gercek DB'de yok, dosya tabanli simplification var

## 9. Gunluk Ozet ve Profil Metrikleri

- [x] Gunluk toplam sure hesaplanıyor
- [x] Tamamlanan seans sayisi hesaplanıyor
- [x] Kategori dagilimi hesaplanıyor
- [x] Gunluk hedef ilerlemesi hesaplanıyor
- [x] Aktif streak gosteriliyor
- [x] En uzun streak gosteriliyor
- [x] Toplam stardust gosteriliyor

## 10. Offline ve Sync

- [x] Offline seans kuyrugu eklendi
- [x] AsyncStorage uzerinde pending session saklama var
- [x] API yoksa optimistic fallback akisi var
- [x] Profil ekraninda sync butonu var
- [x] Server tarafinda `sessions/sync` endpoint'i var
- [x] Sync sonrasi pending queue temizleniyor
- [ ] Cakismali / bozuk ag kosullarinda gercek cihaz QA yapilmadi

## 11. Server / API

- [x] Express API kuruldu
- [x] `GET /health` eklendi
- [x] `GET /bootstrap` eklendi
- [x] `POST /auth/register` eklendi
- [x] `POST /auth/login` eklendi
- [x] `POST /auth/provider` eklendi
- [x] `PATCH /profile` eklendi
- [x] `POST /sessions/complete` eklendi
- [x] `POST /sessions/sync` eklendi
- [x] Zod ile request validation eklendi
- [x] Bcrypt ile password hash eklendi
- [x] Dosya tabanli JSON storage eklendi
- [x] Token tabanli basit auth guard mantigi eklendi
- [ ] PostgreSQL / Supabase entegrasyonu yok
- [ ] Prisma veya migration yapisi yok
- [ ] Production-grade auth provider entegrasyonu yok

## 12. Lokalizasyon, Analytics, Dokumantasyon

- [x] TR / EN metinler eklendi
- [x] Dil degistirme profile baglandi
- [x] Basit analytics event log yapisi eklendi
- [x] `docs/SETUP.md` eklendi
- [x] `docs/QA_CHECKLIST.md` eklendi
- [x] `docs/ANALYTICS_EVENTS.md` eklendi
- [ ] Gercek analytics servisi (Mixpanel / PostHog vb.) baglanmadi
- [ ] Gercek error monitoring (Sentry vb.) baglanmadi

## 13. Test ve Release Durumu

- [x] Root `npm run typecheck` gecti
- [x] Server `npm run typecheck` gecti
- [x] Expo Metro dev server baslatildi
- [x] API dev server baslatildi
- [ ] Emulatorde veya cihazda tam UI smoke test yapilmadi
- [ ] Internal beta paketi alinmadi
- [ ] Release build alinmadi

## 14. Siradaki En Mantikli Adimlar

- [ ] Expo arayuzunu emulatorde / telefonda acip ilk smoke test'i yapmak
- [ ] Gercek register -> onboarding -> session -> celebration akisini test etmek
- [ ] Offline mod senaryosunu test etmek
- [ ] Gercek auth provider secmek
- [ ] Gercek database secmek ve dosya tabanli storage'i degistirmek
- [ ] Gercek analytics + monitoring servislerini baglamak
