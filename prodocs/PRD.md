# Astrocus — Product Requirements Document (PRD)

> **Versiyon:** MVP v1.2
> **Durum:** Teknik sadeleştirme sonrası güncel
> **Hazırlayan:** Eda Kara
> **Hedef Platform:** iOS + Android
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
   - [4.9 Kullanıcı Hesabı & Profil](#49--kullanıcı-hesabı--profil--09--çekirdek--p0)
   - [4.10 Onboarding Akışı](#410--onboarding-akışı--10--ux--p0)
   - [4.11 Seans Sonu Kutlama Ekranı](#411--seans-sonu-kutlama-ekranı--11--gamification--p0)
   - [4.12 Uygulama İçi Dil: TR + EN](#412--uygulama-i̇çi-dil-en--tr--12--çekirdek--p0)
   - [4.13 Global Odalar](#413--global-odalar--13--sosyal--p1)
   - [4.14 Ambient Sesler](#414--ambient-sesler--14--ux--p1)
   - [4.15 Bildirimler](#415--bildirimler--15--ux--p1)
   - [4.16 Odadaki Aktif Kullanıcı Göstergesi](#416--odadaki-aktif-kullanıcı-göstergesi--16--sosyal--p1)
   - [4.17 Profil: Tema Bazlı Geçmiş](#417--profil-tema-bazlı-geçmiş--17--çekirdek--p1)
   - [4.18 Haptic Feedback & Ses Efektleri](#418--haptic-feedback--ses-efektleri--18--ux--p1)
   - [4.19 Karanlık Mod](#419--karanlık-mod--19--ux--p1)
   - [4.20 Gökyüzü Paylaşımı](#420--gökyüzü-paylaşımı--20--sosyal--p1)
5. [Teknik Mimari & Gereklilikler](#5-teknik-mimari--gereklilikler)
6. [Bağımlılıklar, Riskler & Varsayımlar](#6-bağımlılıklar-riskler--varsayımlar)

---

## 1. Döküman Bilgisi

| Alan | Değer |
|---|---|
| **Ürün Adı** | Astrocus |
| **Versiyon** | MVP v1.2 |
| **Hedef Platform** | iOS + Android |
| **Desteklenen Diller** | Türkçe (TR) + İngilizce (EN) |

### Teknik Revizyon Özeti (v1.1 → v1.2)

Bu revizyonun amacı PRD'yi yeniden ürün odaklı hale getirmektir. Teknik açıdan henüz doğrulanmamış veya MVP için gereksiz detaylar sadeleştirilmiş; yalnızca ürün davranışını doğrudan etkileyen kararlar bırakılmıştır.

| # | Değişiklik | Etkilenen Bölüm |
|---|---|---|
| T-12 | Vendor/kütüphane seviyesindeki bağlayıcı kararlar azaltıldı | §5.1, §5.2 |
| T-13 | Uzak bildirimler MVP dışına alındı; yalnızca cihaz içi kritik uyarı mantığı bırakıldı | §4.6, §4.10, §4.12, §4.15 |
| T-14 | Global odalar, aktif kullanıcı sayısı, ambient sesler ve paylaşım MVP sonrası kapsamına taşındı | §3, §4.13–§4.20, §6.3 |
| T-15 | Nadir yıldızlar ve Astral Kristal ekonomisi MVP'den çıkarıldı | §4.3, §4.4, §4.8, §5.3 |
| T-16 | Hesap birleştirme, gerçek zamanlı force-disconnect ve benzeri ileri seviye kimlik detayları sadeleştirildi | §4.9 |
| T-17 | Teknik mimari bölümü ürün gereksinimini destekleyen prensiplere göre yeniden yazıldı | §5 |

---

## 2. Ürün Vizyonu & Amaç

### 2.1 Problem Tanımı

Mevcut odaklanma uygulamaları pazarında üç temel sorun öne çıkmaktadır. Salt zamanlayıcı işlevi sunan uygulamalar kullanıcıya anlam ve motivasyon sağlamaktan uzaktır. Gamification odaklı alternatifler ise aşırı karmaşık mekaniklerle asıl amacı (odaklanmayı) ikinci plana atmaktadır. Pazar lideri konumundaki uygulamalar da en iyi deneyimi premium duvarının arkasına kilitleyerek aktif bir oturumu kesintisiz reklam ve satın alma baskısına dönüştürmektedir. Bu üç sorunun ortak sonucu aynıdır: kullanıcıyla kurulan bağ yüzeysel kalmakta, uzun vadeli alışkanlık oluşturma hedefi ise hiçbir zaman gerçekleşememektedir.

### 2.2 Çözüm

Astrocus, her odaklanma seansını bir galaksi inşa etme deneyimine dönüştürür. Kullanıcı çalıştıkça yıldız tozu kazanır, yıldızlar açar, kendi gökyüzünü oluşturur. Motivasyon içseldir: ilerleme görülür, hissedilir ve paylaşılabilir.

### 2.3 Değer Önerisi

- **Duygusal bağ:** Soyut süre → somut galaksi
- **Sosyal katman:** Yalnız ama birlikte çalışma hissi (body doubling)
- **Alışkanlık mekaniği:** Streak + görsel ilerleme + kutlama anı
- **Viral büyüme:** Galaksi paylaşımı organik edinim sağlar

### 2.4 Başarı Kriterleri

| Metrik Grubu | KPI | Hedef | Ölçüm Metodolojisi |
| :--- | :--- | :--- | :--- |
| **Bağlılık** | Retention (24 Saat) | %35+ | İlk kurulum sonrası 24 saat içinde en az 1 seans başlatan kullanıcı oranı |
| **Bağlılık** | Retention (Haftalık) | %15+ | İlk hafta sonunda uygulamayı aktif kullanmaya devam eden kohort oranı |
| **Angajman** | Ortalama Seans Süresi | 25 dk | Tamamlanan seansların aritmetik ortalaması |
| **Alışkanlık** | Sticky Factor | %18+ | DAU / MAU oranı |
| **Oyunlaştırma** | Aktif Seri Oranı (3+ Gün) | %20+ | En az 3 gün üst üste Star Dust kazanan kullanıcı oranı |
| **Aktivasyon** | İlk Seans Tamamlama Oranı | %60+ | Kurulumdan sonraki ilk 24 saatte en az 1 seansı tamamlayan kullanıcı oranı |
| **Aktivasyon** | Onboarding Tamamlama Oranı | %70+ | Onboarding akışını bitirip ana deneyime geçen kullanıcı oranı |

---

## 3. MVP Kapsam Özeti

Bu revizyonla birlikte MVP, ilk odaklanma döngüsünü doğrulayan çekirdek deneyimle sınırlandırılmıştır. Gerçek zamanlı sosyal katman, zengin medya ve ileri seviye engagement özellikleri MVP sonrası faza alınmıştır.

### 3.1 MVP İçindeki Özellikler

| # | Özellik | Kategori | Öncelik |
|---|---|---|---|
| 01 | Odaklanma Zamanlayıcısı | Çekirdek | P0 — Kritik |
| 02 | Yıldız Seçme & Galaksi Ekranı | Çekirdek | P0 — Kritik |
| 03 | Yıldız Tozu Kazanma Sistemi | Gamification | P0 — Kritik |
| 04 | Gökyüzü Haritası | Gamification | P0 — Kritik |
| 05 | Odaklanma Kategorisi Seçimi | Çekirdek | P0 — Kritik |
| 06 | Çıkış Toleransı + Seans Kaybı Uyarısı | UX | P0 — Kritik |
| 07 | Profil: Günlük Odaklanma Özeti | Çekirdek | P0 — Kritik |
| 08 | Streak Takibi | Gamification | P0 — Kritik |
| 09 | Kullanıcı Hesabı & Profil | Çekirdek | P0 — Kritik |
| 10 | Onboarding Akışı | UX | P0 — Kritik |
| 11 | Seans Sonu Kutlama Ekranı | Gamification | P0 — Kritik |
| 12 | Uygulama İçi Dil: EN + TR | Çekirdek | P0 — Kritik |

### 3.2 MVP Sonrası / Beklemede

| # | Özellik | Kategori | Öncelik |
|---|---|---|---|
| 13 | Global Odalar | Sosyal | Post-MVP |
| 14 | Ambient Sesler | UX | Post-MVP |
| 15 | Engagement Bildirimleri | UX | Post-MVP |
| 16 | Odadaki Aktif Kullanıcı Göstergesi | Sosyal | Post-MVP |
| 17 | Profil: Tema Bazlı Geçmiş | Çekirdek | Post-MVP |
| 18 | Haptic Feedback & Ses Efektleri | UX | Post-MVP |
| 19 | Karanlık Mod | UX | Post-MVP |
| 20 | Gökyüzü Paylaşımı | Sosyal | Post-MVP |

---

## 4. Detaylı Özellik Gereksinimleri

---

### 4.1 — Odaklanma Zamanlayıcısı `#01 · Çekirdek · P0`

#### İş Gereksinimi
Tüm ürün deneyimi bu özelliğin üzerine kurulu. Kullanıcının odaklanma seansını başlatması, yönetmesi ve tamamlaması bu ekran üzerinden gerçekleşir.

#### Fonksiyonel Gereklilikler
- Varsayılan seans süresi **25 dakika**. Kullanıcı 5–120 dakika arasında özelleştirebilir (5'er dakika artışlarla ya da serbest giriş).
- **Başlat / Duraklat / Sıfırla** kontrolleri. Duraklatma maksimum **1 kez** yapılabilir (Maksimum duraklama süresi 5 dakikadır, aşarsa seans iptal olur). Kullanıcı 2. kez duraklat butonuna basmak istediğinde buton pasif (disabled) görünür veya tıklandığında "Sadece 1 kez duraklatabilirsin" uyarısı çıkar.
- Seans devam ederken ekranın açık tutulması tercih edilir. Uygulama arka plana alınırsa **20 saniyelik tolerans süresi** başlar. **10. saniyede** kullanıcıyı geri çağıran cihaz içi uyarı planlanır. **20 saniye geçerse:** seans iptal edilir ve kullanıcıya `"Seans kaybedildi, yeni seans başlatmak ister misin?"` diyaloğu gösterilir.

**Arka Plan Mantığı (MVP):**
MVP'de seansın doğruluğu sürekli çalışan arka plan servisiyle değil, **AppState + timestamp farkı** ile korunur. Uygulama arka plana geçtiği an zaman damgası kaydedilir; uygulama tekrar açıldığında fark hesaplanır:
- 20 saniye aşılmışsa → seans iptal edilir, "Seans kaybedildi" diyaloğu gösterilir.
- Aşılmamışsa → seans kaldığı yerden devam eder.

**Teknik Not:**
Platforma özel foreground service, gelişmiş burn-in koruması ve parlaklık yönetimi gibi implementasyon detayları MVP için zorunlu değildir. Bu kararlar ancak seçilen mobil runtime ve gerçek cihaz testlerinden sonra kesinleştirilecektir.

#### Non-Fonksiyonel Gereklilikler
- Ön plandaki zamanlayıcı hassasiyeti: **±1 saniye tolerans.**
- Uygulama force-close / kill edilirse aktif seans otomatik devam ettirilmiş sayılmaz; geri açılışta timestamp farkına göre seansın geçerli kalıp kalmadığı yeniden değerlendirilir.

#### Kabul Kriterleri
- [ ] Kullanıcı süreyi ayarlayıp başlatabilir, geri sayım doğru çalışır.
- [ ] Uygulama arka plana alındığında süre durmaz (timestamp ile yönetilir).
- [ ] Süre bitişinde otomatik olarak Seans Sonu Kutlama ekranına ([#11](#411--seans-sonu-kutlama-ekranı--11--gamification--p0)) yönlendirilir.
- [ ] Duraklama sonrası devam butonu çalışır.

---

### 4.2 — Yıldız Seçme & Galaksi Ekranı `#02 · Çekirdek · P0`

#### İş Gereksinimi
Kullanıcının uygulamayla ilk duygusal bağını kurduğu an. İlk açılışta ve her seans öncesinde gösterilir. UI/UX farkının sergilendiği ana ekran.

#### Fonksiyonel Gereklilikler
- İlk açılışta kullanıcıya kendi galaksisini oluşturmak için bir yıldız seçmesi istenir (onboarding entegrasyonu — [#10](#410--onboarding-akışı--10--ux--p0)).
- Galaksi ekranı açık uzay temasında, animasyonlu ve interaktif olmalı. Parallax scroll efekti veya hafif parlaklık animasyonu.
- Mevcut yıldızlar **kilit/açık** durumlarıyla gösterilir. Kilitli yıldızlar soluk/gri gösterilir, üzerine tıklanınca `X yıldız tozu gerekli` etiketi belirir.
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
  Temel = seans_süresi_dk × 10 (Baz Çarpan)
  Toplam Bonus Yüzdesi = streak_bonusu + kategori_bonusu + tam_seans_bonusu
  Final Yıldız Tozu = Temel + (Temel × Toplam Bonus Yüzdesi)
  ```
- **Çarpanlar:**
  - Streak bonusu: +%10/gün (Maksimum sınır: +%50)
  - Kategori bonusu (Yerel saate göre):
    - **06:00 – 09:00:** Meditasyon, Spor, Okuma (+%20)
    - **09:00 – 17:00:** Çalışma, Kodlama, Proje (+%20)
    - **20:00 – 23:00:** Yaratıcılık (+%20)
  - Tam seans bonusu: Seans boyunca duraklatma butonuna hiç basılmadan tamamlanması → +%10

**Backend Validasyonu (Anti-Cheat):**
Client'tan gelen kazanım verisi doğrudan veritabanına yazılmaz. Sunucu tarafı, seans bitişinde `(completed_at - started_at)` farkını hesaplayarak client'ın bildirdiği `duration_minutes` değerini doğrular. Yıldız tozu formülü sunucu tarafında yeniden çalıştırılır; client değeri yalnızca bilgilendirici kabul edilir.

**Offline İstisnaları:**
Çevrimdışı tamamlanan seanslar backend'e iletildiğinde, süre doğrulaması cihazın gönderdiği verilere güvenilerek yapılır. Bu kayıtlara `is_offline: true` bayrağı eklenir. Offline seanslar streak ve bireysel yıldız kazanımı için geçerli sayılır; gelecekteki rekabetçi/sosyal modlarda (leaderboard vb.) kapsam dışı bırakılır.

- Yıldız tozu miktarı **backend'de** saklanır, client-side manipülasyona kapalıdır.
- Kazanılan miktar Seans Sonu Kutlama ekranında ([#11](#411--seans-sonu-kutlama-ekranı--11--gamification--p0)) animasyonlu gösterilir.
- Yıldız tozu yeterli miktara ulaştığında yeni yıldız otomatik açılır.

#### Veri Modeli

```
sessions
├── id
├── user_id
├── category_id
├── duration_minutes
├── stardust_earned
├── multipliers_applied    (JSON)
├── is_offline             (Boolean, default: false)  ← T-07
├── started_at             (Timestamp)
└── completed_at           (Timestamp)

users
├── id
├── total_stardust         (harcanabilir kümülatif bakiye)
├── current_streak
├── longest_streak
├── last_session_date      (Date)
└── target_star_id
```

#### Kabul Kriterleri
- [ ] Seans tamamlandığında kazanılan miktar server-side doğrulanarak DB'ye yazılır.
- [ ] Streak bonusu ardışık günlerde artar; gün sınırı aşılınca streak sıfırlanır.
- [ ] Yeterli tozu birikince seçilen yıldız açılır.

---

### 4.4 — Gökyüzü Haritası `#04 · Gamification · P0`

#### İş Gereksinimi
Kullanıcının odaklanma yolculuğunu görsel olarak temsil eden, açılan yıldızları sergileyen ve ilerlemenin somut kanıtını sunan ekran.

#### Fonksiyonel Gereklilikler
- Açık yıldızlar haritada parlar, kilitliler soluk görünür.
- Her yıldızın üzerine tıklanınca: yıldız adı, kaç seans sonucunda açıldığı, hangi kategoride çalışıldığı görünür.
- Toplam açık yıldız sayısı ve bir sonraki yıldıza kalan yıldız tozu miktarı gösterilir.
- Nadir yıldızlar, ikinci para birimi ve paylaşım entegrasyonu MVP sonrası fazda ele alınacaktır.

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
- Profil ekranında kategoriye göre toplam süre görünür ([#07](#47--profil-günlük-odaklanma-özeti--07--çekirdek--p0), [#17](#417--profil-tema-bazlı-geçmiş--17--çekirdek--p1)).

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
- **10. saniyede** cihaz içi lokal uyarı gösterilir: `"Yıldızın sönmek üzere — geri dön!"`
- **20 saniye geçerse:** Seans iptal edilir → `"Seans kaybedildi, yeni seans başlatmak ister misin?"` diyaloğu gösterilir.
- Cihaz uyku/kilit davranışı işletim sistemi koşullarına göre değişebileceği için MVP'de tek doğrulama kuralı arka plan süresinin timestamp farkıyla hesaplanmasıdır.

#### Kabul Kriterleri
- [ ] 20 saniye içinde dönüşte seans devam eder, ceza uygulanmaz.
- [ ] 20 saniye aşılınca seans kayıt edilmez, ödül verilmez.
- [ ] 10. saniyede lokal bildirim tetiklenir.

---

### 4.7 — Profil: Günlük Odaklanma Özeti `#07 · Çekirdek · P0`

#### İş Gereksinimi
Kullanıcının o gün ne kadar çalıştığını özet olarak görmesi. Kendini iyi hissettiren ve alışkanlık oluşturan günlük geri bildirim döngüsü.

#### Fonksiyonel Gereklilikler
- Profil ekranının üst bölümünde bugüne ait toplam odaklanma süresi görünür. Örnek: `"Bugün 1s 45dk odaklandın"`.
- Tamamlanan seans sayısı ve kategorilere göre dağılım gösterilir.
- **Günlük hedef:** Kullanıcı isteğe bağlı günlük süre hedefi belirleyebilir (örn. 2 saat). İlerleme çubuğu gösterilir.
- Veriler UTC + yerel saat dönüşümüyle hesaplanır; gün sınırı kullanıcının yerel gece yarısında sıfırlanır.

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
- **Takvim Günü Sınırı:** Streak takibi kullanıcının yerel saatine göre (cihaz timezone'u baz alınarak) **gece yarısı (00:00)** bazlıdır. Günü kapatmadan önce en az 1 seans tamamlanmazsa streak sıfırlanır (24 saatlik kayan pencere kullanılmaz).
- İleri seviye streak bildirimi ve milestone ödül ekonomisi MVP sonrası fazda ele alınacaktır.
- **Streak geçmişi:** En uzun streak rekoru ayrı tutulur ve profilde gösterilir.
- Streak kırılınca `"Yeni başlangıç"` motivasyon mesajı gösterilir, otomatik yeni streak başlar.

#### Kabul Kriterleri
- [ ] Günlük seans tamamlanınca streak artışı anlık yansır.
- [ ] Gece yarısı geçince ve seans yoksa streak sıfırlanır.
- [ ] En uzun streak bilgisi profilde doğru görünür.

---

### 4.9 — Kullanıcı Hesabı & Profil `#09 · Çekirdek · P0`

#### İş Gereksinimi
Cihaz değişiminde veri kaybı olmaksızın, tüm sosyal ve gamification özelliklerinin altyapısını sağlayan kimlik katmanı.

#### Fonksiyonel Gereklilikler
- **Kayıt yöntemleri:** E-posta + şifre, Google OAuth, Apple Sign In (**iOS için zorunlu**).
- **Profil bilgileri:** Kullanıcı adı (unique), avatar seçimi (preset galaksi avatarları), galaksi ismi.
- **Oturum yönetimi:** Kimlik sağlayıcısının native oturum yönetimi kullanılır. Token'lar cihazın güvenli katmanında saklanır; manuel token rotasyonu MVP kapsamında yazılmaz.
- **Hesap Çakışması:** Aynı e-posta ile farklı giriş yöntemleri kullanıldığında kullanıcı yönlendirme mesajı alır. Otomatik account linking davranışı MVP için zorunlu değildir.
- **Hesap silme:** Talep anında hesap pasif duruma alınır. 30 gün içinde geri dönülmezse kişisel veriler kalıcı olarak silinir.
- **Şifre sıfırlama:** E-posta doğrulamalı standart akış desteklenir.

#### Non-Fonksiyonel Gereklilikler
- Apple Sign In iOS App Store için zorunludur — eksik olursa **store red** alınır.
- Token'lar güvenli cihaz depolamasında tutulur (standart local storage'a kesinlikle yazılmaz).

#### Kabul Kriterleri
- [ ] Tüm kayıt yöntemleri çalışır, cihaz değişse bile veriler eksiksiz senkronize olur.
- [ ] Access token süresi dolduğunda, refresh token ile arka planda kullanıcıyı dökmeden (silent refresh) yeni token alınır.
- [ ] Aynı e-posta adresiyle farklı giriş yöntemi denendiğinde kullanıcı kopmadan doğru akışa yönlendirilir.

---

### 4.10 — Onboarding Akışı `#10 · UX · P0`

#### İş Gereksinimi
İlk 3 ekranda kullanıcı uygulamanın ne olduğunu anlayıp ilk seansını başlatmalı. Kötü onboarding = ilk gün drop-off.

#### Fonksiyonel Gereklilikler
| Ekran | İçerik |
|---|---|
| 1 | Karşılama & değer önerisi animasyonu: `"Çalış. Yıldız kazan. Galaksini inşa et."` |
| 2 | Galaksi ekranı tanıtımı — kullanıcı ilk yıldızını seçer ([#02](#42--yıldız-seçme--galaksi-ekranı--02--çekirdek--p0) entegrasyonu) |
| 3 | İlk odaklanma kategorisini seç ve ilk seansı başlat |

- Onboarding **atlanabilir** (`"Atla"` butonu), ancak yıldız seçimi zorunludur — atlarsa varsayılan yıldız atanır.
- **Bildirim izin isteği** onboarding içinde zorunlu adım olarak gösterilmez. Bildirim gerektiren özellik ilk kez kullanıldığında bağlamsal olarak istenir.
- Onboarding tamamlandı bayrağı hem local (`AsyncStorage`) hem backend'de saklanır; bir daha gösterilmez.

#### Kabul Kriterleri
- [ ] 3 ekran tamamlandıktan sonra ana ekrana geçilir.
- [ ] Yıldız seçilmezse varsayılan atanır; hata ekranı gösterilmez.
- [ ] Onboarding tamamlanması bildirim izni vermeye bağlı değildir.

---

### 4.11 — Seans Sonu Kutlama Ekranı `#11 · Gamification · P0`

#### İş Gereksinimi
En yüksek duygusal an. Kazanılan yıldız tozu ve açılan yıldız animasyonu paylaşım isteği doğurur — organik büyümenin tetikleyicisi.

#### Fonksiyonel Gereklilikler
- Seans tamamlanınca **tam ekran kutlama animasyonu** gösterilir.
- **Gösterilecekler:**
  - Kazanılan yıldız tozu miktarı (sayaç animasyonu)
  - Varsa: açılan yeni yıldız (parlaklık efekti)
  - Seri artışı
  - Toplam bugünkü odaklanma süresi
- **Devam et butonu:** Ana ekrana döner.
- Ekran minimum **3 saniye** görünür; kullanıcı `"Devam et"`e basana kadar kapanmaz.

#### Kabul Kriterleri
- [ ] Animasyon akıcı şekilde çalışır.
- [ ] Yeni yıldız açılışı doğru şekilde tetiklenir.

---

### 4.12 — Uygulama İçi Dil: TR + EN `#12 · Çekirdek · P0`

#### İş Gereksinimi
Global hedef ile Türkiye kitlesini aynı anda hedefleme. İki dil MVP'de yeterli; diğerleri büyüme fazında eklenir.

#### Fonksiyonel Gereklilikler
- **Desteklenen diller:** Türkçe (`tr`) ve İngilizce (`en`).
- **Dil tespiti:** Cihaz dilinden otomatik yapılır. Cihaz dili `tr` ise Türkçe, diğer tümünde İngilizce (Fallback: `en`).
- **Manuel dil değiştirme:** Ayarlar > Dil menüsünden.
- Tüm statik metinler, hata mesajları, onboarding içerikleri ve cihaz içi uyarılar lokalize edilmelidir.
- Çeviriler anahtar bazlı bir yapı ile yönetilmelidir; istemci tarafındaki dil değişimi uygulamayı yeniden başlatmadan anında yansımalıdır.
- Tarih/saat formatları locale'e göre otomatik ayarlanır (TR: `DD/MM/YYYY`, EN: `MM/DD/YYYY`).

#### Kabul Kriterleri
- [ ] İlk açılışta cihaz diline göre otomatik uygulama dili doğru atanır.
- [ ] Manuel dil değişikliği uygulama restart gerekmeden anında yeni dile geçer.
- [ ] Hiçbir ekranda eksik (fallback key olarak görünen) metin kalmaz.

---

### 4.13 — Global Odalar `#13 · Sosyal · P1`

#### İş Gereksinimi
Kullanıcıların aynı anda birbirinden habersiz ama aynı "odada" çalışması. Body doubling etkisi. Viral büyümenin tohumları bu özellikte.

#### Fonksiyonel Gereklilikler
- İlk sosyal fazda **3–5 sabit global oda:** Sabah Seansı, Gece Çalışması, Haftasonu Maratonu, Genel Oda.
- Kullanıcı seans başlatırken oda seçebilir **(isteğe bağlı).**
- Odada aktif kullanıcı sayısı gerçek zamanlı gösterilir ([#16](#416--odadaki-aktif-kullanıcı-göstergesi--16--sosyal--p1)).
- **Oda bazlı sohbet MVP'de YOK.** Sadece varlık hissi. (v2 kapsamı)
- Gerçek zamanlı altyapı seçimi bu fazda kesinleştirilmez; ürün ihtiyacı "anlık veya anlığa yakın görünürlük" olarak tanımlanır.

#### Non-Fonksiyonel Gereklilikler
- Bu özellik MVP dışında olduğundan, kesin ölçek ve protokol hedefleri ayrı teknik tasarım dokümanında netleştirilecektir.

#### Kabul Kriterleri
- [ ] Odaya giriş/çıkış anlık olarak aktif kullanıcı sayısına yansır.
- [ ] Seans bitişinde kullanıcı odadan otomatik çıkarılır.

---

### 4.14 — Ambient Sesler `#14 · UX · P1`

#### İş Gereksinimi
Odaklanma ekranını tamamlayan, immersive deneyim sağlayan ve ilerleyen sürümlerde premium katmana zemin hazırlayan ses özelliği.

#### Fonksiyonel Gereklilikler
- İlk ses paketinde: Yağmur, Beyaz Gürültü, Kafe, Orman (4 ses).
- Ses seçimi seans başlamadan önce veya sırasında değiştirilebilir.
- Volume kontrolü uygulama içinden.
- Ses dosyaları **locale'e cache'lenir;** internet bağlantısı gerektirmez.
- Genişletilmiş / premium ses paketi sonraki fazda eklenebilir.

#### Non-Fonksiyonel Gereklilikler (T-03)
- Ses altyapısına dair kütüphane ve native gereksinim kararı, bu özellik MVP dışına alındığı için sonraki fazda netleştirilecektir.

#### Kabul Kriterleri
- [ ] Ses arka planda da devam eder.
- [ ] Telefon silent modundayken ambient ses çalmaz.
- [ ] Ses seçimi seans devam ederken değiştirilebilir.

---

### 4.15 — Bildirimler `#15 · UX · P1`

#### İş Gereksinimi
Pasif kullanıcıyı aktif tutan, seri tehlikesi ve yıldız kazanımı gibi kritik anlarda tetiklenen akıllı bildirim sistemi.

#### Fonksiyonel Gereklilikler

**Bildirim türleri:**

| Tür | Tetikleyici | İçerik |
|---|---|---|
| **Hatırlatıcı** | Kullanıcı belirlediği saat | `"Odaklanma zamanı! 🌟"` |
| **Seri tehlikesi** | Seans yokken saat 20:00 | `"Seriini korumak için 5 dakikan var!"` |
| **Yıldız kazandın** | Seans tamamlanınca | `"X yıldız tozu kazandın!"` |
| **Yıldız söner** | Arka plana almanın 10. saniyesi | `"Yıldızın sönmek üzere — geri dön!"` |
| **Yeni yıldız açıldı** | Yeterli stardust birikince | `"Yeni yıldız açıldı: [Yıldız Adı] ✨"` |

- **Bildirim izinleri:** İlgili bildirim özelliği ilk kez etkinleştirilirken bağlamsal olarak istenir. İzin verilmezse uygulama içi banner ile telafi edilir.
- **Bildirim ayarları:** Kullanıcı her bildirim türünü ayrı ayrı kapatabilir.
- **Quiet hours:** Gece **23:00 – 08:00** arası seri ve hatırlatıcı bildirimleri gönderilmez.

#### Non-Fonksiyonel Gereklilikler
- Bu bölümde tanımlanan engagement bildirimleri MVP dışındadır. MVP içinde yalnızca aktif seans sırasında gerekli cihaz içi uyarı mantığı bulunur.
- Uzak bildirim sağlayıcısı, token yönetimi ve şablonlama kararları sonraki fazın teknik tasarımına bırakılmıştır.

#### Kabul Kriterleri
- [ ] Tüm bildirim türleri doğru zamanlama ve içerikle iletilir.
- [ ] Kapatılan bildirim türleri gönderilmez.
- [ ] Quiet hours dışında seri bildirimi gönderilmez.

---

### 4.16 — Odadaki Aktif Kullanıcı Göstergesi `#16 · Sosyal · P1`

#### İş Gereksinimi
`"Şu an 847 kişi çalışıyor"` hissi. Body doubling etkisini somutlaştıran minimal sosyal katman.

#### Fonksiyonel Gereklilikler
- Zamanlayıcı ekranında alt köşede küçük bir badge: `"X kişi şu an çalışıyor"`.
- Global oda seçilmişse o odanın sayısı, seçilmemişse toplam aktif kullanıcı sayısı gösterilir.
- Güncelleme sıklığı ve veri taşıma yöntemi teknik tasarım aşamasında netleştirilir.

#### Kabul Kriterleri
- [ ] Aktif kullanıcı sayısı gerçek zamanlıya yakın (max 10 sn gecikme) güncellenir.
- [ ] Sayı 0 ise badge gizlenir veya nötr bir mesaj gösterilir.

---

### 4.17 — Profil: Tema Bazlı Geçmiş `#17 · Çekirdek · P1`

#### İş Gereksinimi
`"Bu hafta 3 saat kitap okudun"` görünümü. Anlam + motivasyon + alışkanlık takibi.

#### Fonksiyonel Gereklilikler
- **Haftalık ve aylık görünüm** seçeneği (toggle).
- Her kategori için renk kodlu çubuk grafik veya halka grafik.
- İstatistikler: En uzun seans, en üretken gün, favori kategori.
- Geçmiş veriler **en az 12 ay** saklanır.

#### Kabul Kriterleri
- [ ] Haftalık/aylık geçiş doğru çalışır.
- [ ] Kategorilere göre süre toplamları backend ile tutarlıdır.

---

### 4.18 — Haptic Feedback & Ses Efektleri `#18 · UX · P1`

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

- Haptic ve ses efektleri **ayarlardan ayrı ayrı** kapatılabilir. Bu tercihler `AsyncStorage`'da tutulur (hassas veri değil, UI tercihidir).
- Silent modda ses efektleri çalmaz, **haptic devam eder.**

#### Non-Fonksiyonel Gereklilikler (T-03)
- Haptic ve ses efektleri için seçilecek kütüphane ve sessiz mod davranışı, bu özellik MVP dışında olduğu için sonraki fazda netleştirilecektir.

#### Kabul Kriterleri
- [ ] Ayarlardan kapatılan haptic veya sesin ilgili eylemde kesinlikle tetiklenmemesi.
- [ ] iOS ve Android cihazlar fiziksel olarak sessiz moda alındığında ses efektlerinin çalmaması (haptic hariç).
- [ ] Haptic tetiklenmelerinde cihazda UI thread blocking yaşanmaması.

---

### 4.19 — Karanlık Mod `#19 · UX · P1`

#### İş Gereksinimi
Gece çalışan öğrenci/üretken kitlenin standart beklentisini karşılamak.

#### Fonksiyonel Gereklilikler
- **Tema Seçenekleri:** Açık (Gündüz Gökyüzü) / Karanlık (Derin Uzay) / Sistem.
- Sistem ayarıyla **otomatik senkronize** olur.
- Kullanıcı uygulama içinden Ayarlar menüsünden **manuel override** yapabilir. Manuel seçim her zaman sistem seçimini ezer.
- Manuel seçim yapıldığında uygulama yeniden başlatılmaya gerek kalmadan (React Context / ThemeProvider) tüm UI anında güncellenir.
- Seçim `AsyncStorage`'da tutulur (hassas veri değil, UI tercihidir).
- Tüm ekranlar ve componentler her iki modda WCAG AA kontrast kuralları açısından test edilmiş olmalıdır.

#### Non-Fonksiyonel Gereklilikler
- Sistem temasını dinlemek için `react-native`'in `useColorScheme` hook'u veya `Appearance` modülü kullanılır.
- Uygulama geneli renk yönetimi ThemeProvider (React Context mimarisi) ile sağlanır; hiçbir component'te hardcoded renk (örn. `color: '#000'`) kullanılmaz.

#### Kabul Kriterleri
- [ ] Sistem modu değiştiğinde uygulama otomatik geçiş yapar.
- [ ] Manuel seçim yapıldığında uygulama anında tepki verir ve bu seçim sonraki açılışlarda korunur.

---

### 4.20 — Gökyüzü Paylaşımı `#20 · Sosyal · P1`

#### İş Gereksinimi
`"Bak galaksim ne kadar büyüdü"` paylaşımı. Kullanıcının emek verdiği galaksiyi sergilemesi ve uygulamanın organik büyümesini (K-Factor) sağlayan en güçlü motor.

#### Fonksiyonel Gereklilikler
- **Paylaş butonu:** Gökyüzü haritasında ([#04](#44--gökyüzü-haritası--04--gamification--p0)) ve seans sonu kutlama ekranında ([#11](#411--seans-sonu-kutlama-ekranı--11--gamification--p0)) yer alır.
- **Render ve Çıktı İşlemi:**
  - Gökyüzü ekranı arka planda snapshot'a dönüştürülür.
  - Görselin alt köşesine **Watermark:** `"Astrocus ile oluşturuldu"` damgası eklenir.
- **Paylaşım İçeriği (Payload):**
  - **Görsel:** Render edilen galaksi resmi.
  - **Metin (Ön Tanımlı):** `"Benim Astrocus galaksime bak! Sen de kendi gökyüzünü inşa et: [App/Play Store Deep Link]"`
- **Paylaşım hedefleri:** Cihazın standart paylaşım menüsü üzerinden Instagram (Post/Story), WhatsApp, Twitter/X ve genel paylaşım uygulamaları.

#### Non-Fonksiyonel Gereklilikler
- Render tekniği, paylaşım API'si ve native gereksinimler bu özellik MVP dışına alındığı için sonraki fazda netleştirilecektir.

#### Kabul Kriterleri
- [ ] Paylaşım butonuna basıldığında galaksi görseli yüksek çözünürlükte, bozulmadan ve watermark ile render edilir.
- [ ] Native share sheet sorunsuz açılır ve tüm uyumlu platformları listeler.
- [ ] Paylaşım yapıldığında hem görsel hem de mağaza linkini içeren ön tanımlı metin birlikte gönderilir (platform izin veriyorsa).

---

## 5. Teknik Mimari & Gereklilikler

### 5.1 Platform & Stack

| Katman | Tercih / Karar |
|---|---|
| **Mobile Framework** | **React Native + TypeScript** — Cross-platform geliştirme hızı ve tek kod tabanı hedeflenir. Expo uyumlu bir yaklaşım tercih edilir; ancak development build veya bare ihtiyaçları yalnızca seçilen kütüphaneler netleşince zorunlu hale getirilir. |
| **Backend / API** | Sunucu tarafında en azından auth, seans doğrulama, ödül hesaplama ve veri senkronizasyonunu yöneten bir katman gerekir. Bunun BaaS + edge function ya da özel API olarak kurulacağı kararını PRD değil teknik tasarım belirler. |
| **Veritabanı** | Kullanıcılar, seanslar, yıldız ilerlemesi ve kategori verileri için ilişkisel veri modeli gereklidir. Gerçek zamanlı presence ve ikinci katman cache ihtiyacı MVP sonrası sosyal özelliklerle birlikte yeniden değerlendirilir. |
| **Auth** | E-posta/şifre ve sosyal girişleri destekleyen yönetilen bir kimlik çözümü kullanılmalıdır. Token'lar cihazın güvenli depolamasında tutulmalı, sessiz oturum yenileme desteklenmelidir. |
| **Bildirimler** | MVP'de yalnızca cihaz içi kritik uyarılar zorunludur. Engagement amaçlı uzak bildirimler ve sağlayıcı seçimi post-MVP teknik tasarım kapsamındadır. |
| **Lokalizasyon** | İstemci tarafında anahtar bazlı bir i18n yapısı ile TR/EN desteklenmelidir. Dil değişimi anlık yansıtılmalıdır. |
| **Analytics** | Onboarding, seans başlatma, seans tamamlama, streak ve retention event'lerini ölçen ürün analitiği zorunludur. Araç seçimi değiştirilebilir. |
| **Monitoring** | Crash raporlama ve temel hata izleme MVP için zorunludur. Araç seçimi teknik ekip tarafından kesinleştirilir. |

### 5.2 Non-Fonksiyonel Gereklilikler

| Gereklilik | Hedef |
|---|---|
| **API Response Time** | Temel auth ve seans endpoint'leri için < 300ms (p95) hedeflenir. |
| **Uygulama İlk Yükleme** | < 3 saniye hedeflenir; ilk deneyimde ana akış hızlı açılmalıdır. |
| **Çevrimdışı Destek** | Tamamlanan seanslar cihazda güvenli olmayan yerel kuyrukta tutulabilir; bağlantı geldiğinde toplu senkronize edilir. Sunucu bu kayıtları `is_offline: true` olarak işaretler. |
| **Local Storage Kullanım Ayrımı** | Hassas veriler güvenli cihaz depolamasında, UI tercihleri ve offline kuyruk gibi hassas olmayan veriler standart local storage'da tutulur. |
| **Güvenlik** | HTTPS zorunludur; korumalı endpoint'ler yetkilendirme ile korunur; ödül hesapları sunucu tarafında doğrulanır; temel rate limiting uygulanır. |
| **KVKK / GDPR** | Kullanıcı verisi silme hakkı desteklenir, veri işleme politikası onboarding veya ilk kullanımda gösterilir, analitik araçlarında veri saklama süresi sınırlandırılır. |
| **Erişilebilirlik** | iOS VoiceOver + Android TalkBack temel desteği, aktif tema(lar) için WCAG AA kontrast oranı hedeflenir. |

### 5.3 Temel Veri Modeli

```sql
-- Kullanıcılar
users (
  id              UUID PRIMARY KEY,
  email           TEXT UNIQUE,
  username        TEXT UNIQUE,
  avatar_id       TEXT,
  galaxy_name     TEXT,
  total_stardust  INTEGER DEFAULT 0,
  streak_count    INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_session_date DATE,
  target_star_id  UUID,
  language        TEXT DEFAULT 'en',
  created_at      TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ          -- soft delete
)

-- Odaklanma kategorileri
categories (
  id       UUID PRIMARY KEY,
  name     TEXT,
  icon_url TEXT
)

-- Seans kayıtları
sessions (
  id                  UUID PRIMARY KEY,
  user_id             UUID REFERENCES users(id),
  category_id         UUID REFERENCES categories(id),
  duration_minutes    INTEGER,
  stardust_earned     INTEGER,
  multipliers_applied JSONB,
  is_offline          BOOLEAN DEFAULT false,  -- T-07
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  is_completed        BOOLEAN DEFAULT false
)

-- Yıldız kataloğu
stars (
  id                   UUID PRIMARY KEY,
  name                 TEXT,
  required_stardust    INTEGER,
  unlock_animation_url TEXT
)

-- Kullanıcı–yıldız ilişkisi
user_stars (
  user_id     UUID REFERENCES users(id),
  star_id     UUID REFERENCES stars(id),
  unlocked_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, star_id)
)

```

---

## 6. Bağımlılıklar, Riskler & Varsayımlar

### 6.1 Kritik Bağımlılıklar

| Bağımlılık | Etki (Eksik Olursa) |
|---|---|
| **Kimlik sağlayıcısı** | Kayıt, giriş, şifre sıfırlama ve oturum devamlılığı çalışmaz |
| **İlişkisel veritabanı** | Seans geçmişi, streak, yıldız ilerlemesi ve profil verileri saklanamaz |
| **Cihaz içi lokal bildirim desteği** | Aktif seansın kritik geri dönüş uyarısı çalışmaz |
| **Güvenli cihaz depolaması** | Token güvenliği ve kalıcı oturum deneyimi zayıflar |
| **Analitik + hata izleme** | MVP başarı kriterleri ölçülemez, üretimde hata görünürlüğü düşer |

### 6.2 Riskler & Azaltma Stratejileri

| Risk | Seviye | Azaltma |
|---|---|---|
| Galaksi ekranı animasyonu düşük cihazlarda takılır | 🔴 Yüksek | Lottie/Rive optimizasyonu; düşük donanımlı cihazlar için grafik kalite ayarı |
| Stardust formülü dengesiz | 🔴 Yüksek | İlk 50 beta kullanıcısından data alın, soft-launch'ta formülü ayarlayın |
| Offline senkronizasyonda tekrar kayıt / tutarsızlık oluşur | 🔴 Yüksek | Her seans için benzersiz istemci kimliği tutulur; sunucu tarafında idempotent sync uygulanır |
| Kimlik akışlarında sağlayıcı bazlı edge-case'ler çıkar | 🟡 Orta | E-posta/şifre akışı önce stabilize edilir; sosyal girişler gerçek cihazlarda ayrı QA edilir |
| TR/EN içeriklerde eksik çeviri kalır | 🟡 Orta | Release öncesi locale checklist ve ekran bazlı QA yapılır |
| Bildirim izin oranı düşük kalır | 🟡 Orta | İzin istemi onboarding içine gömülmez; doğru anda bağlamsal pre-prompt kullanılır |
| KVKK uyumsuzluğu ceza riski oluşturur | 🟢 Düşük-Orta | Veri işleme sözleşmesi ve gizlilik politikası hukuk onayından geçmeli |

### 6.3 Kapsam Dışı (MVP v1.2)

> ⚠️ Aşağıdaki özellikler v2 veya ilerleyen sürümlere ertelenmiştir.

- [ ] Oda içi sohbet / mesajlaşma
- [ ] Arkadaş ekleme & sosyal takip
- [ ] Global odalar ve aktif kullanıcı göstergesi
- [ ] Ambient sesler
- [ ] Engagement amaçlı push bildirimleri
- [ ] Haptic feedback ve ses efektleri
- [ ] Karanlık mod
- [ ] Gökyüzü paylaşımı
- [ ] Nadir yıldızlar ve Astral Kristal ekonomisi
- [ ] Premium abonelik & ödeme altyapısı
- [ ] Liderlik tablosu
- [ ] Üçüncü dil desteği
- [ ] Web uygulaması
- [ ] Wear OS / Apple Watch desteği

---

*Astrocus PRD — MVP v1.2 · Teknik sadeleştirme revizyonu · Bu döküman dahili kullanım içindir.*

### MVP Kapsam Detayları

> **Ürün Vizyonu:** Astrocus, her odaklanma seansını bir galaksi inşa etme deneyimine dönüştürür. MVP'nin amacı bu çekirdek döngüyü sade, tutarlı ve ölçülebilir şekilde doğrulamaktır.
>
> **Hedef Platform:** iOS & Android
> **Uygulama Tipi:** Cross-platform mobil uygulama
> **Desteklenen Diller:** Türkçe (TR) + İngilizce (EN)

### MVP Hedefi

Bu sürümde doğrulanacak ana deneyim:

1. Kullanıcı onboarding'i tamamlar.
2. Bir yıldız seçer ve ilk seansını başlatır.
3. Seansı tamamlayıp yıldız tozu kazanır.
4. İlerlemesini galaksi / gökyüzü haritasında görür.
5. Günlük özet ve streak ile geri dönme motivasyonu kazanır.

### Çekirdek Özellikler (P0)

* **Odaklanma Zamanlayıcısı:** Varsayılan 25 dakika; 5-120 dakika arası ayarlanabilir. Başlat, duraklat ve sıfırla akışlarını içerir.
* **Yıldız Seçme ve Galaksi Ekranı:** Kullanıcının ilk yıldızını seçtiği, açık ve kilitli yıldızları gördüğü ana ekran.
* **Yıldız Tozu Sistemi:** Tamamlanan seanslardan süre, streak ve kategori kurallarına göre yıldız tozu kazanılır.
* **Gökyüzü Haritası:** Açılan yıldızların, mevcut ilerlemenin ve bir sonraki hedefin görüntülendiği görsel ilerleme ekranı.
* **Kategori Seçimi:** Seans başlamadan önce isteğe bağlı kategori seçimi yapılır; seçilmezse genel kategoriye düşer.
* **Çıkış Toleransı:** Uygulama arka plana alınırsa 20 saniyelik tolerans başlar; 10. saniyede cihaz içi uyarı verilir, süre aşılırsa seans iptal edilir.
* **Günlük Odaklanma Özeti:** Günlük toplam süre, tamamlanan seans sayısı, kategori dağılımı ve günlük hedef takibi gösterilir.
* **Streak Takibi:** Kullanıcının yerel gün bazlı devamlılık zinciri ve en uzun streak bilgisi tutulur.
* **Kullanıcı Hesabı ve Profil:** E-posta/şifre, Google OAuth ve iOS için Apple Sign In ile giriş; temel profil bilgileri saklanır.
* **Onboarding Akışı:** Karşılama, galaksi tanıtımı, ilk yıldız seçimi ve ilk seansa yönlendirme içeren başlangıç akışı.
* **Seans Sonu Kutlama Ekranı:** Kazanılan yıldız tozu, varsa açılan yıldız ve günlük ilerleme kutlama ekranında gösterilir.
* **TR / EN Dil Desteği:** Tüm ana ekranlar, hata mesajları ve onboarding iki dilde çalışır; dil cihazdan algılanır ve manuel değiştirilebilir.

### MVP Teknik Sınırları

* Zamanlayıcı doğruluğu MVP'de sürekli çalışan arka plan servisiyle değil, `AppState + timestamp farkı` yaklaşımıyla korunur.
* Aktif seans için gerekli cihaz içi uyarı dışında engagement amaçlı uzak bildirimler MVP kapsamında değildir.
* Kimlik, seans doğrulama, ödül hesaplama ve veri senkronizasyonu için bir sunucu katmanı gerekir; bunun kesin implementasyonu teknik tasarım aşamasında netleşir.
* Hassas veriler güvenli cihaz depolamasında, UI tercihleri ve offline kuyruk gibi hassas olmayan veriler standart local storage'da tutulur.
* Analytics ve hata izleme MVP için zorunludur; araç seçimi değiştirilebilir.

### Başarı Ölçümünde Odaklanılacak Alanlar

* İlk 24 saatte ilk seans tamamlama oranı
* Onboarding tamamlama oranı
* Ortalama seans süresi
* Haftalık retention
* 3+ gün streak oluşturan kullanıcı oranı

### Kapsam Dışı (Post-MVP)

> MVP odağı korunmalıdır; aşağıdaki alanlar sonraki fazlara bırakılmıştır.

* Global odalar
* Odadaki aktif kullanıcı göstergesi
* Oda içi sohbet / mesajlaşma
* Ambient sesler
* Engagement amaçlı push bildirimleri
* Haptic feedback ve ses efektleri
* Karanlık mod
* Gökyüzü paylaşımı
* Profilde gelişmiş geçmiş ekranı (haftalık/aylık tema bazlı analiz)
* Nadir yıldızlar ve Astral Kristal ekonomisi
* Arkadaş ekleme ve sosyal takip
* Premium abonelik, ödeme sistemleri ve premium paketler
* Liderlik tablosu
* Üçüncü dil desteği
* Web uygulaması
* Wear OS / Apple Watch desteği


### Uyum (Compliance)

Son güncelleme: 2026-05-15

| Kriter | Durum |
|--------|-------|
| Etkileşimli uygulama | ✅ |
| LLM API çekirdek | ✅ Gemini `/ai/galactic-advice` |
| `/frontend` + `/backend` | ✅ |
| Canlı deploy | 🟡 |
| `prodocs` dokümanlar | ✅ |
| `.env.example` | ✅ frontend + backend |
| Gizlilik + hesap silme | ✅ |
| Demo video | 🔲 |
