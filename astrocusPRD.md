# Astrocus — Product Requirements Document (PRD)

> **Versiyon:** MVP v1.0  
> **Durum:** Taslak — Onay Bekliyor  
> **Hazırlayan:** Eda Kara   
> **Hedef Platform:** iOS & Android  
> **Desteklenen Diller:** Türkçe (TR) + İngilizce (EN)  
> **Gizlilik:** Dahili

---

## İçindekiler

1. [Döküman Bilgisi](#1-döküman-bilgisi)
2. [Ürün Vizyonu & Amaç](#2-ürün-vizyonu--amaç)
3. [MVP Kapsam Özeti](#3-mvp-kapsam-özeti)
4. [Detaylı Özellik Gereksinimleri](#4-detaylı-özellik-gereksinimleri)
   - [4.1 Odaklanma Zamanlayıcısı](#41--odaklanma-zamanlayıcısı--01--çekirdek--p0)
   - [4.2 Yıldız Seçme & Galaksi Ekranı](#42--yıldız-seçme--galaksi-ekranı--02--çekirdek--p0)
   - [4.3 Yıldız Tozu Kazanma Sistemi](#43--yıldız-tozu-kazanma-sistemi--03--gamification--p0)
   - [4.4 Gökyüzü Haritası](#44--gökyüzü-haritası--04--gamification--p0)
   - [4.5 Odaklanma Kategorisi Seçimi](#45--odaklanma-kategorisi-seçimi--05--çekirdek--p0)
   - [4.6 Çıkış Toleransı + Yıldız Söner Bildirimi](#46--çıkış-toleransı--yıldız-söner-bildirimi--06--ux--p0)
   - [4.7 Profil: Günlük Odaklanma Özeti](#47--profil-günlük-odaklanma-özeti--07--çekirdek--p0)
   - [4.8 Streak Takibi](#48--streak-takibi--08--gamification--p0)
   - [4.9 Global Odalar](#49--global-odalar--09--sosyal--p1)
   - [4.10 Ambient Sesler](#410--ambient-sesler--10--ux--p1)
   - [4.11 Kullanıcı Hesabı & Profil](#411--kullanıcı-hesabı--profil--11--çekirdek--p0)
   - [4.12 Bildirimler](#412--bildirimler--12--ux--p1)
   - [4.13 Onboarding Akışı](#413--onboarding-akışı--13--ux--p0)
   - [4.14 Seans Sonu Kutlama Ekranı](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)
   - [4.15 Odadaki Aktif Kullanıcı Göstergesi](#415--odadaki-aktif-kullanıcı-göstergesi--15--sosyal--p1)
   - [4.16 Profil: Tema Bazlı Geçmiş](#416--profil-tema-bazlı-geçmiş--16--çekirdek--p1)
   - [4.17 Haptic Feedback & Ses Efektleri](#417--haptic-feedback--ses-efektleri--17--ux--p1)
   - [4.18 Karanlık Mod](#418--karanlık-mod--18--ux--p1)
   - [4.19 Gökyüzü Paylaşımı](#419--gökyüzü-paylaşımı--19--sosyal--p1)
   - [4.20 Uygulama İçi Dil: EN + TR](#420--uygulama-i̇çi-dil-en--tr--20--çekirdek--p0)
5. [Teknik Mimari & Gereklilikler](#5-teknik-mimari--gereklilikler)
6. [Bağımlılıklar, Riskler & Varsayımlar](#6-bağımlılıklar-riskler--varsayımlar)
7. [Onay Süreci & Sonraki Adımlar](#7-onay-süreci--sonraki-adımlar)

---

## 1. Döküman Bilgisi

| Alan | Değer |
|---|---|
| **Ürün Adı** | Astrocus |
| **Versiyon** | MVP v1.0 |
| **Döküman Durumu** | Taslak — Geliştirici Onayı Bekleniyor |
| **Hedef Platform** | iOS + Android — React Native |
| **Desteklenen Diller** | Türkçe (TR) + İngilizce (EN) |
| **Bağımlı Ekipler** | Ürün, Tasarım, Frontend (Mobile), Backend, QA |
| **Sprint Hedefi** | MVP canlıya alım — 20 özellik, tek iterasyon |
| **Gözden Geçirenler** | CTO, Lead Developer, UX Lead |

---

## 2. Ürün Vizyonu & Amaç

### 2.1 Problem Tanımı

Mevcut odaklanma uygulamaları pazarında üç temel sorun öne çıkmaktadır. Salt zamanlayıcı işlevi sunan uygulamalar kullanıcıya anlam ve motivasyon sağlamaktan uzaktır. Gamification odaklı alternatifler ise aşırı karmaşık mekaniklerle asıl amacı — odaklanmayı — ikinci plana atmaktadır. Pazar lideri konumundaki uygulamalar da en iyi deneyimi premium duvarının arkasına kilitleyerek aktif bir oturumu kesintisiz reklam ve satın alma baskısına dönüştürmektedir. Bu üç sorunun ortak sonucu aynıdır: kullanıcıyla kurulan bağ yüzeysel kalmakta, uzun vadeli alışkanlık oluşturma hedefi ise hiçbir zaman gerçekleşememektedir.

### 2.2 Çözüm

Astrocus, her odaklanma seansını bir galaksi inşa etme deneyimine dönüştürür. Kullanıcı çalıştıkça yıldız tozu kazanır, yıldızlar açar, kendi gökyüzünü oluşturur. Motivasyon içseldir: ilerleme görülür, hissedilir ve paylaşılabilir.

### 2.3 Değer Önerisi

- **Duygusal bağ:** Soyut süre → somut galaksi
- **Sosyal katman:** Yalnız ama birlikte çalışma hissi (body doubling)
- **Alışkanlık mekaniği:** Streak + görsel ilerleme + kutlama anı
- **Viral büyüme:** Galaksi paylaşımı organik edinim sağlar

### 2.4 Başarı Kriterleri (MVP — 30. Gün)

| Metrik | Hedef | Ölçüm Yöntemi |
|---|---|---|
| D1 Retention | %40+ | Analytics (Mixpanel/Amplitude) |
| D7 Retention | %20+ | Cohort analizi |
| Ortalama Seans Süresi | 20+ dakika | Event tracking |
| Streak 3+ gün tutan kullanıcı | %25+ | Backend streak log |
| Galaksi paylaşımı | DAU'nun %5'i | Share event |
| Global oda aktif kullanıcı | İlk haftada 50+ | Concurrent user sayısı |

---

## 3. MVP Kapsam Özeti

> Tüm özellikler v1.0 kapsamındadır. Hiçbirisi sonraki sürüme ertelenmemiştir.

| # | Özellik | Kategori | Öncelik |
|---|---|---|---|
| 01 | Odaklanma Zamanlayıcısı | Çekirdek | P0 — Kritik |
| 02 | Yıldız Seçme & Galaksi Ekranı | Çekirdek | P0 — Kritik |
| 03 | Yıldız Tozu Kazanma Sistemi | Gamification | P0 — Kritik |
| 04 | Gökyüzü Haritası | Gamification | P0 — Kritik |
| 05 | Odaklanma Kategorisi Seçimi | Çekirdek | P0 — Kritik |
| 06 | Çıkış Toleransı + Yıldız Söner Bildirimi | UX | P0 — Kritik |
| 07 | Profil: Günlük Odaklanma Özeti | Çekirdek | P0 — Kritik |
| 08 | Streak Takibi | Gamification | P0 — Kritik |
| 09 | Global Odalar | Sosyal | P1 — Yüksek |
| 10 | Ambient Sesler | UX | P1 — Yüksek |
| 11 | Kullanıcı Hesabı & Profil | Çekirdek | P0 — Kritik |
| 12 | Bildirimler | UX | P1 — Yüksek |
| 13 | Onboarding Akışı | UX | P0 — Kritik |
| 14 | Seans Sonu Kutlama Ekranı | Gamification | P0 — Kritik |
| 15 | Odadaki Aktif Kullanıcı Göstergesi | Sosyal | P1 — Yüksek |
| 16 | Profil: Tema Bazlı Geçmiş | Çekirdek | P1 — Yüksek |
| 17 | Haptic Feedback & Ses Efektleri | UX | P1 — Yüksek |
| 18 | Karanlık Mod | UX | P1 — Yüksek |
| 19 | Gökyüzü Paylaşımı | Sosyal | P1 — Yüksek |
| 20 | Uygulama İçi Dil: EN + TR | Çekirdek | P0 — Kritik |

---

## 4. Detaylı Özellik Gereksinimleri

---

### 4.1 — Odaklanma Zamanlayıcısı `#01 · Çekirdek · P0`

#### İş Gereksinimi
Tüm ürün deneyimi bu özelliğin üzerine kurulu. Kullanıcının odaklanma seansını başlatması, yönetmesi ve tamamlaması bu ekran üzerinden gerçekleşir.

#### Fonksiyonel Gereklilikler
- Varsayılan seans süresi **25 dakika**. Kullanıcı 5–120 dakika arasında özelleştirebilir (5'er dakika artışlarla ya da serbest giriş).
- **Başlat / Duraklat / Sıfırla** kontrolleri. Duraklama maksimum 1 kez izin verilir; ikinci duraklamada uyarı gösterilir.
- Seans devam ederken ekran ön planda kalır (`keepScreenOn`). Arka plana alınırsa seans devam eder, bildirim gösterilir.
- Geri sayım görsel olarak 0'a ulaştığında seans tamamlanmış sayılır, otomatik olarak Seans Sonu Kutlama ekranına yönlendirilir ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)).
- Zamanlayıcı arka planda çalışmaya devam etmeli; uygulama kapatılsa dahi **foreground service** (Android) / **background task** (iOS) ile süre korunmalıdır.

#### Non-Fonksiyonel Gereklilikler
- Zamanlayıcı hassasiyeti: **±1 saniye tolerans.**
- Arka plan kaybı senaryosu: Uygulama kill edilirse, kullanıcı geri döndüğünde geçen süre hesaplanarak seans devam ettirilir veya kullanıcıya `Seans kesildi` bildirimi gösterilir.

#### Kabul Kriterleri
- [ ] Kullanıcı süreyi ayarlayıp başlatabilir, geri sayım doğru çalışır.
- [ ] Uygulama arka plana alındığında süre durmaz.
- [ ] Süre bitişinde otomatik kutlama ekranı açılır.
- [ ] Duraklama sonrası devam butonu çalışır.

---

### 4.2 — Yıldız Seçme & Galaksi Ekranı `#02 · Çekirdek · P0`

#### İş Gereksinimi
Kullanıcının uygulamayla ilk duygusal bağını kurduğu an. İlk açılışta ve her seans öncesinde gösterilir. UI/UX farkının sergilendiği ana ekran.

#### Fonksiyonel Gereklilikler
- İlk açılışta kullanıcıya kendi galaksisini oluşturmak için bir yıldız seçmesi istenir (onboarding entegrasyonu — [#13](#413--onboarding-akışı--13--ux--p0)).
- Galaksi ekranı açık uzay temasında, animasyonlu ve interaktif olmalı. Parallax scroll efekti veya hafif parlaklık animasyonu.
- Mevcut yıldızlar **kilit/açık** durumlarıyla gösterilir. Kilitli yıldızlar soluk/gri gösterilir, üzerinde `X yıldız tozu gerekli` etiketi bulunur.
- Seçili yıldız seans boyunca ekranda animasyonlu şekilde görünür.
- Yeni yıldız açıldığında (Gökyüzü Haritası — [#04](#44--gökyüzü-haritası--04--gamification--p0)) galaksi ekranı güncellenir.

#### Kabul Kriterleri
- [ ] İlk açılışta galaksi ekranı gösterilir ve yıldız seçimi yapılabilir.
- [ ] Kilitli ve açık yıldızlar ayrıştırılmış şekilde görünür.
- [ ] Seçim sonrası zamanlayıcı ekranına geçiş animasyonlu olur.

---

### 4.3 — Yıldız Tozu Kazanma Sistemi `#03 · Gamification · P0`

#### İş Gereksinimi
Her seans sonunda kullanıcıya ödül hissi yaşatan temel gamification mekaniği. Retention'ın çekirdeği; diğer tüm gamification öğeleri buna bağlıdır.

#### Fonksiyonel Gereklilikler
- Seans tamamlandığında kazanılan yıldız tozu hesaplanır:
  ```
  Temel = seans_süresi_dk × baz_çarpan
  Final = Temel × streak_bonusu × kategori_bonusu × tam_seans_bonusu
  ```
- **Çarpanlar:**
  - Streak bonusu: +%10/gün, maksimum +%50
  - Kategori bonusu: Belirli saatlerde ilgili kategoriyle çalışmak
  - Tam seans bonusu: Hiç duraklamadan tamamlama → +%20
- Yıldız tozu miktarı **backend'de** saklanır, client-side manipülasyona kapalı olmalı.
- Kazanılan miktar Seans Sonu Kutlama ekranında ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)) animasyonlu gösterilir.
- Yıldız tozu yeterli miktara ulaştığında yeni yıldız otomatik açılır ve push notification tetiklenir.

#### Veri Modeli

```
sessions
├── user_id
├── session_id
├── duration_minutes
├── category_id
├── stardust_earned
├── multipliers_applied  (JSON)
└── completed_at

users
└── total_stardust  (kümülatif sayaç)
```

#### Kabul Kriterleri
- [ ] Seans tamamlandığında kazanılan miktar doğru hesaplanır ve DB'ye yazılır.
- [ ] Streak bonusu ardışık günlerde artar, 24 saatin ötesinde streak sıfırlanır.
- [ ] Yeterli tozu birikince seçilen yıldız açılır.

---

### 4.4 — Gökyüzü Haritası `#04 · Gamification · P0`

#### İş Gereksinimi
Kullanıcının odaklanma yolculuğunu görsel olarak temsil eden, açılan yıldızları sergileyen ve ilerlemenin somut kanıtını sunan ekran.

#### Fonksiyonel Gereklilikler
- Açık yıldızlar haritada parlar, kilitliler soluk görünür.
- Her yıldızın üzerine tıklanınca: yıldız adı, kaç seans sonucunda açıldığı, hangi kategoride çalışıldığı görünür.
- Toplam açık yıldız sayısı ve bir sonraki yıldıza kalan yıldız tozu miktarı gösterilir.
- Harita, paylaşım butonuna ([#19](#419--gökyüzü-paylaşımı--19--sosyal--p1)) bağlıdır.

#### Kabul Kriterleri
- [ ] Tüm açık yıldızlar doğru şekilde görüntülenir.
- [ ] Yeni yıldız açıldığında harita gerçek zamanlı güncellenir (uygulama yeniden başlatılmasına gerek kalmaz).

---

### 4.5 — Odaklanma Kategorisi Seçimi `#05 · Çekirdek · P0`

#### İş Gereksinimi
Kullanıcının ne üzerinde çalıştığını kayıt altına alarak profil özetinde ve geçmişte anlamlı veriler sunmak için zorunlu altyapı.

#### Fonksiyonel Gereklilikler
- Seans başlamadan önce kategori seçimi yapılır. **İsteğe bağlı**; atlanabilir → `Genel` olarak kaydedilir.
- **MVP kategorileri:** Çalışma, Okuma, Proje, Yaratıcılık, Spor, Meditasyon, Kodlama, Diğer.
- Seçilen kategori seans kaydına (session log) eklenir.
- Profil ekranında kategoriye göre toplam süre görünür ([#07](#47--profil-günlük-odaklanma-özeti--07--çekirdek--p0), [#16](#416--profil-tema-bazlı-geçmiş--16--çekirdek--p1)).

#### Kabul Kriterleri
- [ ] Kategori seçimi zamanlayıcı başlamadan önce yapılabilir.
- [ ] Profil ekranında kategoriye göre dağılım doğru hesaplanır.

---

### 4.6 — Çıkış Toleransı + Yıldız Söner Bildirimi `#06 · UX · P0`

#### İş Gereksinimi
Seans sırasında yanlışlıkla uygulamadan çıkan ya da kısa süre arka plana alan kullanıcıları cezalandırmadan motive eden kritik denge mekanizması.

#### Fonksiyonel Gereklilikler
- Kullanıcı seans sırasında uygulamayı arka plana alırsa **20 saniyelik tolerans süresi** başlar.
- Tolerans süresi içinde geri dönülürse seans kaldığı yerden devam eder, herhangi bir ceza uygulanmaz.
- **10. saniyede** push notification: `"Yıldızın sönmek üzere — geri dön!"`
- **20 saniye geçerse:** Seans iptal edilir → `"Seans kaybedildi, yeni seans başlatmak ister misin?"` diyaloğu gösterilir.
- Telefonun ekranı kapatılması (sleep) arka plana alma sayılmaz; seans devam eder.

#### Kabul Kriterleri
- [ ] 20 saniye içinde dönüşte seans devam eder, ceza uygulanmaz.
- [ ] 20 saniye aşılınca seans kayıt edilmez, ödül verilmez.
- [ ] 10. saniyede bildirim tetiklenir.

---

### 4.7 — Profil: Günlük Odaklanma Özeti `#07 · Çekirdek · P0`

#### İş Gereksinimi
Kullanıcının o gün ne kadar çalıştığını özet olarak görmesi. Kendini iyi hissettiren ve alışkanlık oluşturan günlük geri bildirim döngüsü.

#### Fonksiyonel Gereklilikler
- Profil ekranının üst bölümünde bugüne ait toplam odaklanma süresi görünür. Örnek: `"Bugün 1s 45dk odaklandın"`.
- Tamamlanan seans sayısı ve kategorilere göre dağılım gösterilir.
- **Günlük hedef:** Kullanıcı isteğe bağlı günlük süre hedefi belirleyebilir (ör. 2 saat). İlerleme çubuğu gösterilir.
- Veriler UTC + yerel saat dönüşümüyle hesaplanır; gün sınırı gece yarısı sıfırlanır.

#### Kabul Kriterleri
- [ ] Günlük toplam süre doğru hesaplanır.
- [ ] Kategorilere göre dağılım doğru görünür.
- [ ] Gece yarısı günlük özet sıfırlanır, önceki günün verisi geçmiş sekmeye taşınır.

---

### 4.8 — Streak Takibi `#08 · Gamification · P0`

#### İş Gereksinimi
Ardışık gün zincirini kırmama motivasyonu. Retention'ı doğrudan etkileyen en güçlü alışkanlık mekaniği (Duolingo etkisi).

#### Fonksiyonel Gereklilikler
- Her gün en az **1 tamamlanmış seans** streak sayacını artırır.
- 24 saat içinde seans tamamlanmazsa streak **sıfırlanır.**
- **Streak tehlike bildirimi:** Gün içinde seans yapılmamışsa ve saat **20:00** gelmişse bildirim: `"Bugün henüz odaklanmadın — streakini korumak için 5 dakikan var!"`
- **Streak geçmişi:** En uzun streak rekoru ayrı tutulur ve profilde gösterilir.
- Streak kırılınca `"Yeni başlangıç"` motivasyon mesajı gösterilir, otomatik yeni streak başlar.

#### Kabul Kriterleri
- [ ] Günlük seans tamamlanınca streak artışı anlık yansır.
- [ ] Gece yarısı geçince ve seans yoksa streak sıfırlanır.
- [ ] Tehlike bildirimi zamanında gönderilir (±5 dakika tolerans).

---

### 4.9 — Global Odalar `#09 · Sosyal · P1`

#### İş Gereksinimi
Kullanıcıların aynı anda birbirinden habersiz ama aynı "odada" çalışması. Body doubling etkisi. Viral büyümenin tohumları bu özellikte.

#### Fonksiyonel Gereklilikler
- **MVP'de 3–5 sabit global oda:** Sabah Seansı, Gece Çalışması, Haftasonu Maratonu, Genel Oda.
- Kullanıcı seans başlatırken oda seçebilir **(isteğe bağlı).**
- Odada aktif kullanıcı sayısı gerçek zamanlı gösterilir ([#15](#415--odadaki-aktif-kullanıcı-göstergesi--15--sosyal--p1)).
- **Oda bazlı sohbet MVP'de YOK.** Sadece varlık hissi. (v2 kapsamı)
- WebSocket veya polling (5 saniyede bir) ile aktif sayı güncellenir.

#### Non-Fonksiyonel Gereklilikler
- Eş zamanlı **1.000 kullanıcıya** kadar ölçeklenebilir mimari.
- WebSocket bağlantısı kopunca otomatik yeniden bağlanma (exponential backoff).

#### Kabul Kriterleri
- [ ] Odaya giriş/çıkış anlık olarak aktif kullanıcı sayısına yansır.
- [ ] Seans bitişinde kullanıcı odadan otomatik çıkarılır.

---

### 4.10 — Ambient Sesler `#10 · UX · P1`

#### İş Gereksinimi
Odaklanma ekranını tamamlayan, immersive deneyim sağlayan ve ilerleyen sürümlerde premium katmana zemin hazırlayan ses özelliği.

#### Fonksiyonel Gereklilikler
- **MVP ses paketi (ücretsiz):** Yağmur, Beyaz Gürültü, Kafe, Orman (4 ses).
- Ses seçimi seans başlamadan önce veya sırasında değiştirilebilir.
- Volume kontrolü uygulama içinden.
- Ses dosyaları **local'e cache'lenir;** internet bağlantısı gerektirmez.
- Premium ses paketi (keman, lofi, doğa sesleri) v2'de — MVP'de `"Yakında geliyor"` etiketi gösterilir.

#### Kabul Kriterleri
- [ ] Ses arka planda da devam eder.
- [ ] Telefon silent modundayken ses çalmaz.
- [ ] Ses seçimi seans devam ederken değiştirilebilir.

---

### 4.11 — Kullanıcı Hesabı & Profil `#11 · Çekirdek · P0`

#### İş Gereksinimi
Cihaz değişiminde veri kaybı olmaksızın, tüm sosyal ve gamification özelliklerinin altyapısını sağlayan kimlik katmanı.

#### Fonksiyonel Gereklilikler
- **Kayıt yöntemleri:** E-posta + şifre, Google OAuth, Apple Sign In (**iOS için zorunlu**).
- **Profil bilgileri:** Kullanıcı adı (unique), avatar seçimi (preset galaksi avatarları), galaksi ismi.
- **Oturum yönetimi:** JWT + refresh token. Access token 1 saat, refresh token 30 gün.
- **Hesap silme:** KVKK/GDPR uyumlu, 30 gün içinde tüm veriler silinir.
- **Şifre sıfırlama:** E-posta doğrulamalı.

#### Non-Fonksiyonel Gereklilikler
- Şifreler **bcrypt** (min. 12 round) ile hash'lenir.
- Apple Sign In iOS App Store için zorunlu — eksik olursa **store red** alınır.

#### Kabul Kriterleri
- [ ] Tüm kayıt yöntemleri çalışır, session korunur.
- [ ] Farklı cihazda giriş yapıldığında tüm veriler senkronize görünür.

---

### 4.12 — Bildirimler `#12 · UX · P1`

#### İş Gereksinimi
Pasif kullanıcıyı aktif tutan, streak tehlikesi ve yıldız kazanımı gibi kritik anlarda tetiklenen akıllı bildirim sistemi.

#### Fonksiyonel Gereklilikler

**Bildirim türleri:**

| Tür | Tetikleyici | İçerik |
|---|---|---|
| Hatırlatıcı | Kullanıcı belirlediği saat | `"Odaklanma zamanı! 🌟"` |
| Streak tehlikesi | Seans yokken saat 20:00 | `"Streakini korumak için 5 dakikan var!"` |
| Yıldız kazandın | Seans tamamlanınca | `"X yıldız tozu kazandın!"` |
| Yıldız söner | Arka plana almanın 10. saniyesi | `"Yıldızın sönmek üzere — geri dön!"` |
| Yeni yıldız açıldı | Yeterli stardust birikince | `"Yeni yıldız açıldı: [Yıldız Adı] ✨"` |

- **Bildirim izinleri:** Onboarding sırasında istenir. İzin verilmezse uygulama içi banner ile telafi edilir.
- **Bildirim ayarları:** Kullanıcı her bildirim türünü ayrı ayrı kapatabilir.
- **Quiet hours:** Gece **23:00 – 08:00** arası streak ve hatırlatıcı bildirimleri gönderilmez.

#### Non-Fonksiyonel Gereklilikler
- **FCM** (Android) + **APNs** (iOS) entegrasyonu.
- Bildirim gönderim başarı oranı izlenir (delivery tracking).

#### Kabul Kriterleri
- [ ] Tüm bildirim türleri doğru zamanlama ve içerikle iletilir.
- [ ] Kapatılan bildirim türleri gönderilmez.
- [ ] Quiet hours dışında streak bildirimi gönderilmez.

---

### 4.13 — Onboarding Akışı `#13 · UX · P0`

#### İş Gereksinimi
İlk 3 ekranda kullanıcı uygulamanın ne olduğunu anlayıp ilk seansını başlatmalı. Kötü onboarding = ilk gün drop-off.

#### Fonksiyonel Gereklilikler

| Ekran | İçerik |
|---|---|
| Ekran 1 | Karşılama & değer önerisi animasyonu: `"Çalış. Yıldız kazan. Galaksini inşa et."` |
| Ekran 2 | Galaksi ekranı tanıtımı — kullanıcı ilk yıldızını seçer ([#02](#42--yıldız-seçme--galaksi-ekranı--02--çekirdek--p0) entegrasyonu) |
| Ekran 3 | İlk odaklanma kategorisini seç ve ilk seansı başlat |

- Onboarding **atlanabilir** (`"Atla"` butonu), ancak yıldız seçimi zorunlu — atlarsa varsayılan yıldız atanır.
- **Bildirim izin isteği** onboarding sonunda, ilk seans tamamlandıktan sonra gösterilir.
- Onboarding tamamlandı bayrağı hem local hem backend'de saklanır; bir daha gösterilmez.

#### Kabul Kriterleri
- [ ] 3 ekran tamamlandıktan sonra ana ekrana geçilir.
- [ ] Yıldız seçilmezse varsayılan atanır; hata ekranı gösterilmez.
- [ ] Bildirim izni onboarding sonunda istenir.

---

### 4.14 — Seans Sonu Kutlama Ekranı `#14 · Gamification · P0`

#### İş Gereksinimi
En yüksek duygusal an. Kazanılan yıldız tozu ve açılan yıldız animasyonu paylaşım isteği doğurur — organik büyümenin tetikleyicisi.

#### Fonksiyonel Gereklilikler
- Seans tamamlanınca **tam ekran kutlama animasyonu** gösterilir.
- **Gösterilecekler:**
  - Kazanılan yıldız tozu miktarı (sayaç animasyonu)
  - Varsa: açılan yeni yıldız (parlaklık efekti)
  - Streak artışı
  - Toplam bugünkü odaklanma süresi
- **Paylaş butonu:** Kutlama ekranı görseli paylaşım sheet'ini açar ([#19](#419--gökyüzü-paylaşımı--19--sosyal--p1)).
- **Devam et butonu:** Ana ekrana döner.
- Ekran minimum **3 saniye** görünür; kullanıcı `"Devam et"`e basana kadar kapanmaz.

#### Kabul Kriterleri
- [ ] Animasyon akıcı çalışır (60fps hedef).
- [ ] Yeni yıldız açılışı doğru tetiklenir.
- [ ] Paylaş butonu çalışır.

---

### 4.15 — Odadaki Aktif Kullanıcı Göstergesi `#15 · Sosyal · P1`

#### İş Gereksinimi
`"Şu an 847 kişi çalışıyor"` hissi. Body doubling etkisini somutlaştıran minimal sosyal katman.

#### Fonksiyonel Gereklilikler
- Zamanlayıcı ekranında alt köşede küçük bir badge: `"X kişi şu an çalışıyor"`.
- Global oda seçilmişse o odanın sayısı, seçilmemişse toplam aktif kullanıcı sayısı gösterilir.
- Sayı her **10 saniyede** bir güncellenir (polling veya WebSocket push).
- 100+ kişi varsa `"100+ kişi"` olarak gösterilir; tam sayı gizlenir (privacy).

#### Kabul Kriterleri
- [ ] Aktif kullanıcı sayısı gerçek zamanlıya yakın (max 10 sn gecikme) güncellenir.
- [ ] Sayı 0 ise badge gizlenir veya nötr bir mesaj gösterilir.

---

### 4.16 — Profil: Tema Bazlı Geçmiş `#16 · Çekirdek · P1`

#### İş Gereksinimi
`"Bu hafta 3 saat kitap okudun"` görünümü. Anlam + motivasyon + alışkanlık takibi.

#### Fonksiyonel Gereklilikler
- **Haftalık ve aylık görünüm** seçeneği (toggle).
- Her kategori için renk kodlu çubuk grafik veya halka grafik.
- İstatistikler: En uzun seans, en üretken gün, favori kategori.
- Geçmiş veriler **en az 12 ay** saklanır.

#### Kabul Kriterleri
- [ ] Haftalık/aylık geçiş doğru çalışır.
- [ ] Kategorilere göre süre toplamları backend ile tutarlı.

---

### 4.17 — Haptic Feedback & Ses Efektleri `#17 · UX · P1`

#### İş Gereksinimi
Zamanlayıcı başlayınca, yıldız açılınca dokunsal ve sesli geri bildirim. Kalite hissini artıran mikro-etkileşim katmanı.

#### Fonksiyonel Gereklilikler

**Haptic:**

| Olay | Haptic Tipi |
|---|---|
| Zamanlayıcı başlatma | Medium Impact |
| Seans tamamlama | Success Notification |
| Yıldız açılışı | Heavy Impact |

**Ses efektleri:**

| Olay | Ses |
|---|---|
| Seans başlangıcı | Hafif çan |
| Seans bitişi | Kutlama sesi |
| Yıldız açılışı | Sparkle sesi |

- Haptic ve ses efektleri **ayarlardan ayrı ayrı** kapatılabilir.
- Silent modda ses efektleri çalmaz, **haptic devam eder.**

#### Non-Fonksiyonel Gereklilikler
- iOS: `UIFeedbackGenerator`
- Android: `VibrationEffect` (API 26+)

#### Kabul Kriterleri
- [ ] Haptic API'leri doğru tetiklenir.
- [ ] Silent modda ses çalmaz, haptic çalışır.

---

### 4.18 — Karanlık Mod `#18 · UX · P1`

#### İş Gereksinimi
Gece çalışan öğrenci kitlesinin standart beklentisi. Galaksi teması zaten karanlıkta en iyi görünür.

#### Fonksiyonel Gereklilikler
- Sistem ayarıyla **otomatik senkronize** olur (iOS: `UIUserInterfaceStyle`, Android: `Configuration.uiMode`).
- Kullanıcı uygulama içinden **manuel override** yapabilir: Açık / Karanlık / Sistem.
- Tüm ekranlar ve componentler her iki modda test edilmiş olmalı.
- Seçim **local'de persist** edilir.

#### Kabul Kriterleri
- [ ] Sistem mod değiştiğinde uygulama otomatik geçiş yapar.
- [ ] Manuel seçim sonraki açılışta da korunur.

---

### 4.19 — Gökyüzü Paylaşımı `#19 · Sosyal · P1`

#### İş Gereksinimi
`"Bak galaksim ne kadar büyüdü"` paylaşımı. Organik büyümenin en güçlü motoru.

#### Fonksiyonel Gereklilikler
- **Paylaş butonu:** Gökyüzü haritasında ([#04](#44--gökyüzü-haritası--04--gamification--p0)) ve seans sonu kutlama ekranında ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)).
- **Paylaşım görseli:**
  - Kullanıcının galaksisinin render'ı
  - Watermark: `"Astrocus ile oluşturuldu"`
  - App Store / Play Store deep link
- **Native share sheet:** iOS: `UIActivityViewController` / Android: `Intent.ACTION_SEND`
- **Paylaşım hedefleri:** Instagram, WhatsApp, Twitter/X, genel paylaşım.

#### Kabul Kriterleri
- [ ] Paylaşım görseli doğru render edilir.
- [ ] Watermark ve store linki görselde yer alır.
- [ ] Native share sheet tüm hedefleri sunar.

---

### 4.20 — Uygulama İçi Dil: EN + TR `#20 · Çekirdek · P0`

#### İş Gereksinimi
Global hedef ile Türkiye kitlesini aynı anda hedefleme. İki dil MVP'de yeterli; diğerleri büyüme fazında eklenir.

#### Fonksiyonel Gereklilikler
- **Desteklenen diller:** Türkçe (`tr`) ve İngilizce (`en`).
- **Dil tespiti:** Cihaz dilinden otomatik. Cihaz dili `tr` ise Türkçe, diğer tümünde İngilizce.
- **Manuel dil değiştirme:** Ayarlar > Dil menüsünden.
- Tüm statik metinler, hata mesajları, bildirim içerikleri ve onboarding lokalize edilmeli.
- **Lokalizasyon dosyaları:**
  - iOS: `Localizable.strings` (tr / en)
  - Android: `strings.xml` (tr / en klasörleri)
- Tarih/saat formatları locale'e göre otomatik (TR: `GG/AA/YYYY`, EN: `MM/DD/YYYY`).

#### Kabul Kriterleri
- [ ] Cihaz Türkçe'de açılınca uygulama Türkçe, İngilizce'de açılınca İngilizce başlar.
- [ ] Manuel değişiklik anında yansır, uygulama restart gerekmez.
- [ ] Hiçbir ekranda eksik / untranslated string kalmaz.

---

## 5. Teknik Mimari & Gereklilikler

### 5.1 Platform & Stack Önerisi

| Katman | Tercih / Öneri |
|---|---|
| **Mobile Framework** | React Native (Expo) veya Flutter — cross-platform, hız avantajı. Native (Swift/Kotlin) yalnızca animasyon performansı kritikse tercih edilebilir. |
| **Backend** | Node.js (NestJS) veya Python (FastAPI). RESTful API + WebSocket (Socket.io). |
| **Veritabanı** | PostgreSQL (ana DB) + Redis (session, streak cache, WebSocket presence). |
| **Auth** | Supabase Auth veya Firebase Auth (OAuth entegrasyonu dahil). Apple Sign In zorunlu. |
| **Push Bildirimi** | FCM (Android) + APNs (iOS). OneSignal veya Firebase Messaging wrapper. |
| **Dosya / CDN** | AWS S3 veya Cloudflare R2 — avatar görselleri ve paylaşım render'ları için. |
| **Analytics** | Mixpanel veya Amplitude — event tracking, funnel, retention. |
| **Monitoring** | Sentry (crash reporting) + Datadog veya Grafana (backend metrics). |

### 5.2 Non-Fonksiyonel Gereklilikler

| Gereklilik | Hedef |
|---|---|
| **API Response Time** | < 200ms (p95) |
| **Uygulama İlk Yükleme** | < 3 saniye |
| **Eş Zamanlı Kullanıcı** | 10.000'e kadar yatay ölçeklenebilir |
| **Çevrimdışı Destek** | Seans zamanlayıcısı internet olmadan çalışır; bağlantı gelince senkronize edilir |
| **Güvenlik** | HTTPS/TLS 1.3 zorunlu, SQL injection / XSS koruması, rate limiting (60 req/dk/user) |
| **KVKK / GDPR** | Kullanıcı verisi silme hakkı, veri işleme politikası onboarding'de gösterilir |
| **Erişilebilirlik** | iOS VoiceOver + Android TalkBack temel desteği, WCAG AA kontrast oranı |

### 5.3 Temel Veri Modeli

```sql
-- Kullanıcılar
users (
  id, email, username, avatar_id, galaxy_name,
  total_stardust, streak_count, longest_streak,
  language, theme, created_at
)

-- Seans kayıtları
sessions (
  id, user_id, category_id, duration_minutes,
  stardust_earned, multipliers_applied,
  room_id, completed_at, is_completed
)

-- Yıldız kataloğu
stars (
  id, name, required_stardust, unlock_animation_url
)

-- Kullanıcı–yıldız ilişkisi
user_stars (
  user_id, star_id, unlocked_at
)

-- Odalar
rooms (
  id, name, description, is_active
)

-- Oda varlığı (Redis'te tutulur, DB'ye yazılmaz)
room_presence (
  user_id, room_id, session_id, joined_at
)
```

---

## 6. Bağımlılıklar, Riskler & Varsayımlar

### 6.1 Kritik Bağımlılıklar

| Bağımlılık | Etki (Eksik Olursa) |
|---|---|
| **Apple Sign In API** | iOS App Store zorunluluğu — eksik olursa uygulama red alır |
| **FCM / APNs** | Streak, çıkış toleransı ve motivasyon bildirimleri çalışmaz |
| **WebSocket altyapısı** | Global odalar ve aktif kullanıcı sayısı gerçek zamanlılığı bozulur |
| **Ambient ses dosyaları** | Lisanslı veya royalty-free kaynaklardan temin edilmeli |

### 6.2 Riskler & Azaltma Stratejileri

| Risk | Seviye | Azaltma |
|---|---|---|
| Galaksi ekranı animasyonu düşük cihazlarda takılır | 🔴 Yüksek | Lottie/Rive optimizasyonu; grafik kalite ayarı eklenebilir |
| Stardust formülü dengesiz; kazanım çok kolay/zor | 🔴 Yüksek | İlk 50 beta kullanıcısından data alın, soft-launch'ta ayarlayın |
| WebSocket yüksek trafikte aşırı yüklenir | 🟡 Orta | Redis pub/sub + horizontal scaling; polling fallback |
| Apple Review süreci MVP yayınını geciktirir | 🟡 Orta | Review kuyruğuna erken girin; kritik özellik eksikleri bırakmayın |
| KVKK uyumsuzluğu ceza riski oluşturur | 🟢 Düşük-Orta | Veri işleme sözleşmesi ve gizlilik politikası hukuk onayından geçmeli |

### 6.3 Kapsam Dışı (MVP v1.0)

> ⚠️ Aşağıdaki özellikler v2 veya ilerleyen sürümlere ertelenmiştir. Developer bu listedeki hiçbir özelliği MVP kapsamında geliştirmemeli.

- [ ] Oda içi sohbet / mesajlaşma
- [ ] Arkadaş ekleme & sosyal takip
- [ ] Premium abonelik & ödeme altyapısı
- [ ] Premium ambient ses paketi (UI'da `"Yakında"` etiketi koyulabilir)
- [ ] Liderlik tablosu
- [ ] Üçüncü dil desteği
- [ ] Web uygulaması
- [ ] Wear OS / Apple Watch desteği

---

## 7. Onay Süreci & Sonraki Adımlar

### 7.1 Gerekli Onaylar

| Rol | Ad Soyad | Durum | Tarih |
|---|---|---|---|
| CPO / Ürün Sahibi | _______________ | ⏳ Bekliyor | — |
| CTO / Teknik Lider | _______________ | ⏳ Bekliyor | — |
| UX Lead | _______________ | ⏳ Bekliyor | — |
| Lead Developer | _______________ | ⏳ Bekliyor | — |

### 7.2 Sonraki Adımlar

1. **PRD onayı** alındıktan sonra UX ekibi wireframe ve tasarım sürecini başlatır.
2. **Lead developer** teknik refinement yaparak story point'leri belirler.
3. **Sprint planlaması:** P0 özellikler Sprint 1–2'ye, P1 özellikler Sprint 3–4'e alınır.
4. **Stardust formülü** için prototip ve kullanıcı testi planlanır (beta grubunda 50 kişi).
5. **Hukuk onayı:** KVKK gizlilik politikası ve kullanım koşulları paralelde hazırlanır.

---

*Astrocus PRD — MVP v1.0 · Bu döküman dahili kullanım içindir.*
