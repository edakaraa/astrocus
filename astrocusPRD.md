# Astrocus — Product Requirements Document (PRD)

> **Versiyon:** MVP v1.0  
> **Durum:** Onaylandı  
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
   - [4.9 Kullanıcı Hesabı & Profil Global Odalar](#49--kullanıcı-hesabı--profil--09--çekirdek--p0)
   - [4.10 Onboarding Akışı](#410--onboarding-akışı--10--ux--p0)
   - [4.11 Seans Sonu Kutlama Ekranı](#411--seans-sonu-kutlama-ekranı--11--gamification--p0)
   - [4.12 Uygulama İçi Dil: TR + EN](#412--uygulama-i̇çi-dil-en--tr--12--çekirdek--p0)
   - [4.13 Global Odalar](#413--global-odalar--13--sosyal--p1)
   - [4.14 Ambient Sesler](#414--ambient-sesler--14--ux--p1)
   - [4.15 Bildirimler](#415--bildirimler--15--ux--p1)
   - [4.16 Odadaki Aktif Kullanıcı Göstergesi ](#416--odadaki-aktif-kullanıcı-göstergesi--16--sosyal--p1)
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
| **Versiyon** | MVP v1.0 |
| **Hedef Platform** | iOS + Android |
| **Desteklenen Diller** | Türkçe (TR) + İngilizce (EN) |

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


| Metrik Grubu | KPI (Anahtar Performans Göstergesi) | Hedef | Ölçüm Metodolojisi |
| :--- | :--- | :--- | :--- |
| **Bağlılık (Retention)** | **Retention (Yeniden Dönüş)** | **%35+** | İlk kurulum sonrası 24 saat içinde en az 1 seans başlatan kullanıcı oranı. |
| **Bağlılık (Retention)** | **Retention (Haftalık Tutundurma)** | **%15+** | İlk hafta sonunda uygulamayı aktif kullanmaya devam eden kohort oranı. |
| **Angajman (Engagement)** | **Ortalama Seans Süresi** | **25 dk** | Tamamlanan seansların aritmetik ortalaması (Pomodoro standardı bazlı). |
| **Alışkanlık (Habit)** | **Sticky Factor** | **%18+** | Günlük aktif kullanıcıların aylık aktif kullanıcılara oranı (Bağımlılık rasyosu). |
| **Oyunlaştırma** | **Aktif Seri Oranı (3+ Gün)** | **%20+** | En az 3 gün üst üste "Star Dust" kazanan kullanıcıların toplam kullanıcıya oranı. |
| **Viralite (Growth)** | **K-Factor (Sosyal Paylaşım)** | **%3+** | Galaksi/Gökyüzü haritasını dış mecralarda paylaşan tekil kullanıcı oranı. |
| **Sosyal Etki** | **Global Oda Penetrasyonu** | **%10+** | Seanslarını Global Odalarda başlatan kullanıcıların toplam seanslara oranı. |

---

## 3. MVP Kapsam Özeti

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
| 09 | Kullanıcı Hesabı & Profil | Çekirdek | P0 — Kritik |
| 10 | Onboarding Akışı | UX | P0 — Kritik | 
| 11 | Seans Sonu Kutlama Ekranı | Gamification | P0 — Kritik | 
| 12 | Uygulama İçi Dil: EN + TR | Çekirdek | P0 — Kritik |
| 13 | Global Odalar | Sosyal | P1 — Yüksek |
| 14 | Ambient Sesler | UX | P1 — Yüksek |
| 15 | Bildirimler | UX | P1 — Yüksek | 
| 16 | Odadaki Aktif Kullanıcı Göstergesi | Sosyal | P1 — Yüksek | 
| 17 | Profil: Tema Bazlı Geçmiş | Çekirdek | P1 — Yüksek |
| 18 | Haptic Feedback & Ses Efektleri | UX | P1 — Yüksek |
| 19 | Karanlık Mod | UX | P1 — Yüksek |
| 20 | Gökyüzü Paylaşımı | Sosyal | P1 — Yüksek |

---

## 4. Detaylı Özellik Gereksinimleri

---

### 4.1 — Odaklanma Zamanlayıcısı `#01 · Çekirdek · P0`

#### İş Gereksinimi
Tüm ürün deneyimi bu özelliğin üzerine kurulu. Kullanıcının odaklanma seansını başlatması, yönetmesi ve tamamlaması bu ekran üzerinden gerçekleşir.

#### Fonksiyonel Gereklilikler
- Varsayılan seans süresi **25 dakika**. Kullanıcı 5–120 dakika arasında özelleştirebilir (5'er dakika artışlarla ya da serbest giriş).
- **Başlat / Duraklat / Sıfırla** kontrolleri. Duraklatma maksimum **1 kez** yapılabilir (Maksimum duraklama süresi 5 dakikadır, aşarsa seans iptal olur). Kullanıcı 2. kez duraklat butonuna basmak istediğinde buton pasif (disabled) görünür veya tıklandığında "Sadece 1 kez duraklatabilirsin" uyarısı çıkar.
- Seans devam ederken ekran ön planda kalır (`keepScreenOn`). Arka plana alınırsa **20 saniyelik tolerans süresi** başlar. **10. saniyede** `"Yıldızın sönmek üzere — geri dön!"` bildirimi gönderilir. **20 saniye geçerse:** Seans iptal edilir → `"Seans kaybedildi, yeni seans başlatmak ister misin?"` diyaloğu gösterilir.
-Arka Plan Mantığı (AppState & Timestamp): iOS ve Android'de arka plan servisleri sınırlandırıldığı için, uygulama arka plana alındığında o anın zaman damgası (timestamp) kaydedilir. 10. saniyedeki "Yıldızın sönmek üzere" uyarısı expo-notifications ile lokal bildirim olarak zamanlanır. Uygulama tekrar ön plana (active state) alındığında zaman farkı hesaplanır.
20 saniye aşılmışsa seans iptal edilir ve "Seans kaybedildi" diyaloğu gösterilir. Aşılmamışsa, zamanlanan lokal bildirim iptal edilir ve süre güncellenerek devam eder.
- Geri sayım görsel olarak 0'a ulaştığında seans tamamlanmış sayılır, otomatik olarak Seans Sonu Kutlama ekranına yönlendirilir ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)).
- Zamanlayıcı, uygulama arka plana atılsa veya sistem tarafından askıya alınsa dahi veri tutarlılığını korumalıdır; Android tarafında Foreground Service ile süreç canlı tutulmalı, iOS tarafında ise Background Tasks ve Local Notifications kombinasyonu ile seansın kesintiye uğraması engellenmelidir.
-Ekran Koruyucu & Burn-in Koruması: Seans boyunca ekran açık kalacağı (keepScreenOn: true) için, OLED/AMOLED ekranlarda yanmayı önlemek ve pili korumak adına 60 saniye hareketsizlik (touch inactivity) sonrası "Derin Uzay" tasarruf moduna geçilir. Arayüz elemanları gizlenir, ekran parlaklığı yazılımsal olarak düşürülür ve sadece kalan süre/aktif yıldız ekranda yavaşça yer değiştirir. Ekrana dokunulduğunda standart UI geri döner.

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
    - **06:00 - 09:00:** Meditasyon, Spor, Okuma (+%20)
    - **09:00 - 17:00:** Çalışma, Kodlama, Proje (+%20)
    - **20:00 - 23:00:** Yaratıcılık (+%20)
  - Tam seans bonusu: Seans boyunca duraklatma butonuna **hiç basılmadan** tamamlanması → +%10
  - **Backend Validasyonu (Anti-Cheat):** Client'tan gelen kazanım verisi doğrudan veritabanına yazılmaz. NestJS backend, seans bitişinde `(completed_at - started_at)` farkını hesaplayarak bildirilen `duration_minutes` değerini doğrular. Formül server-side çalıştırılıp client ile eşleşiyorsa onaylanır.
  -Offline İstisnaları: Çevrimdışı tamamlanan seanslar backend'e iletildiğinde, süre doğrulaması cihazın gönderdiği verilere güvenilerek yapılır ancak bu kayıtlara is_offline_synced: true bayrağı eklenir. Bu kayıtlar streak ve bireysel yıldız kazanımı için geçerli sayılırken, gelecekteki rekabetçi/sosyal modlarda (Leaderboard vb.) kapsam dışı bırakılır.
- Yıldız tozu miktarı **backend'de** saklanır, client-side manipülasyona kapalı olmalı.
- Kazanılan miktar Seans Sonu Kutlama ekranında ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)) animasyonlu gösterilir.
- Yıldız tozu yeterli miktara ulaştığında yeni yıldız otomatik açılır ve push notification tetiklenir.
-Backend Validasyonu (Anti-Cheat): Client'tan gelen kazanım verisi doğrudan veritabanına yazılmaz. NestJS backend, seans bitişinde (completed_at - started_at) farkını hesaplayarak bildirilen duration_minutes değerini doğrular. Yıldız tozu hesaplama formülü server-side olarak tekrar çalıştırılır ve client'ın gönderdiği değerle eşleşiyorsa (tolerans payı içinde) onaylanır.

#### Veri Modeli

```
sessions
├── session_id
├── user_id
├── category_id
├── duration_minutes
├── stardust_earned
├── multipliers_applied (JSON)
├── created_at (Timestamp)      --> Seansın başlama anı
└── completed_at (Timestamp)    --> Seansın bitiş anı

users
├── user_id 
├── total_stardust     --> Harcanabilir kümülatif bakiye
├── astral_crystals    --> Uzun streak'lerden gelen nadir element
├── current_streak     --> Güncel seri sayısı
├── longest_streak     --> Profilde gösterilecek rekor
├── last_session_date (Date)
└── target_star_id     --> Kullanıcının şu an biriktirdiği/hedeflediği yıldız
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
- **Nadir/Mistik Yıldızlar & Harcama:** Sadece uzun süreli streak'ler sonucu kazanılan "Astral Kristal" ile açılabilirler (Tanesi 1 Kristal). Kilitli nadir yıldıza tıklandığında stardust yerine özel "1 Astral Kristal ile Aç" modalı çıkar. Onaylandığında backend bakiye kontrolü yapar ve yıldız haritada parlar.
- Harita, paylaşım butonuna ([#19](#419--gökyüzü-paylaşımı--19--sosyal--p1)) bağlıdır.

#### Kabul Kriterleri
- [ ] Tüm açık yıldızlar doğru şekilde görüntülenir.
- [ ] Yeni yıldız açıldığında harita gerçek zamanlı güncellenir (uygulama yeniden başlatılmasına gerek kalmaz).
- [ ] Nadir yıldızlar sadece Astral Kristal bakiyesi ile açılabilir.

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
- **Takvim Günü Sınırı:** Streak takibi kullanıcının yerel saatine göre (cihaz timezone'u baz alınarak) **gece yarısı (00:00)** bazlıdır. Günü kapatmadan önce en az 1 seans tamamlanmazsa streak sıfırlanır (24 saatlik kayan pencere kullanılmaz).
- **Streak tehlike bildirimi:** Gün içinde seans yapılmamışsa ve saat **20:00** gelmişse bildirim: `"Bugün henüz odaklanmadın — streakini korumak için 5 dakikan var!"`
- **Sadakat Ödülü (Milestones):** Kullanıcı 7., 14., 21., 30., 40., 50., 60., 70., 80., 90. ve 100. gün kesintisiz streak dönüm noktalarına ulaştığında standart Yıldız Tozu'na ek olarak 1 adet Astral Kristal kazanır.
- **Streak geçmişi:** En uzun streak rekoru ayrı tutulur ve profilde gösterilir.
- Streak kırılınca `"Yeni başlangıç"` motivasyon mesajı gösterilir, otomatik yeni streak başlar.

#### Kabul Kriterleri
- [ ] Günlük seans tamamlanınca streak artışı anlık yansır.
- [ ] Gece yarısı geçince ve seans yoksa streak sıfırlanır.
- [ ] Dönüm noktalarına ulaşıldığında kullanıcıya Astral Kristal verilir.
- [ ] Tehlike bildirimi zamanında gönderilir (±5 dakika tolerans).

---

### 4.9 —  Kullanıcı Hesabı & Profil `#09 · Çekirdek · P0`

#### İş Gereksinimi
Cihaz değişiminde veri kaybı olmaksızın, tüm sosyal ve gamification özelliklerinin altyapısını sağlayan kimlik katmanı.

#### Fonksiyonel Gereklilikler
- **Kayıt yöntemleri:** E-posta + şifre, Google OAuth, Apple Sign In (**iOS için zorunlu**).
- **Profil bilgileri:** Kullanıcı adı (unique), avatar seçimi (preset galaksi avatarları), galaksi ismi.
- **Oturum yönetimi:** Doğrudan Supabase Auth native oturum yönetimi kullanılacaktır. Özel JWT veya manuel token rotasyonu yazılmayacaktır. Supabase client başlatılırken expo-secure-store adaptörü bağlanarak, token'ların cihazın güvenli katmanında otomatik saklanması ve süresi dolduğunda sessizce (silent refresh) yenilenmesi sağlanacaktır.
- **Hesap Çakışması:** Sosyal girişler ile e-posta girişleri aynı mail adresini kullanıyorsa, kimlik sağlayıcılar (auth providers) tek bir hesap altında birleştirilir (Account Linking).
- **Hesap silme:** Talep anında hesap "Pasif" duruma geçer. İşlem tetiklendiği an, kullanıcının aktif WebSocket bağlantısı zorla koparılır (force disconnect) ve Upstash Redis üzerindeki `room_presence` kaydı anında silinerek odadaki kişi sayısından düşülür. 30 gün içinde geri dönülmezse tüm kişisel veriler kalıcı olarak (hard delete) silinir.
- **Şifre sıfırlama:** E-posta doğrulamalı.

#### Non-Fonksiyonel Gereklilikler
- Şifreler **bcrypt** (min. 12 round) ile hash'lenir.
- Apple Sign In iOS App Store için zorunlu — eksik olursa **store red** alınır.


#### Kabul Kriterleri
- [ ] Tüm kayıt yöntemleri çalışır, cihaz değişse bile veriler eksiksiz senkronize olur.
- [ ] Access token süresi dolduğunda, refresh token ile arka planda kullanıcıyı dökmeden (silent refresh) yeni token alınır.
- [ ] Aynı e-posta adresiyle hem Google hem normal kayıt denenirse hesaplar güvenle eşleşir/yönlendirilir.

---

### 4.10 —Onboarding Akışı `#10· UX · P0`

#### İş Gereksinimi
İlk 3 ekranda kullanıcı uygulamanın ne olduğunu anlayıp ilk seansını başlatmalı. Kötü onboarding = ilk gün drop-off.

#### Fonksiyonel Gereklilikler
| Ekran | İçerik |
|---|---|
| 1 | Karşılama & değer önerisi animasyonu: `"Çalış. Yıldız kazan. Galaksini inşa et."` |
| 2 | Galaksi ekranı tanıtımı — kullanıcı ilk yıldızını seçer ([#02](#42--yıldız-seçme--galaksi-ekranı--02--çekirdek--p0) entegrasyonu) |
| 3 | İlk odaklanma kategorisini seç ve ilk seansı başlat |


- Onboarding **atlanabilir** (`"Atla"` butonu), ancak yıldız seçimi zorunlu — atlarsa varsayılan yıldız atanır.
- **Bildirim izin isteği** onboarding sonunda, ilk seans tamamlandıktan sonra gösterilir.
- Onboarding tamamlandı bayrağı hem local hem backend'de saklanır; bir daha gösterilmez.


#### Kabul Kriterleri
- [ ] 3 ekran tamamlandıktan sonra ana ekrana geçilir.
- [ ] Yıldız seçilmezse varsayılan atanır; hata ekranı gösterilmez.
- [ ] Bildirim izni onboarding sonunda istenir.

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
- **Paylaş butonu:** Kutlama ekranı görseli paylaşım sheet'ini açar ([#20](#420--gökyüzü-paylaşımı--20--sosyal--p1)).
- **Devam et butonu:** Ana ekrana döner.
- Ekran minimum **3 saniye** görünür; kullanıcı `"Devam et"`e basana kadar kapanmaz.


#### Kabul Kriterleri
- [ ] Animasyon akıcı şekilde çalışır.
- [ ] Yeni yıldız açılışı doğru şekilde tetiklenir.
- [ ] Paylaş butonu aktif çalışır.

---

### 4.12 — Uygulama İçi Dil: TR + EN `#12 · Çekirdek · P0`

#### İş Gereksinimi
Global hedef ile Türkiye kitlesini aynı anda hedefleme. İki dil MVP'de yeterli; diğerleri büyüme fazında eklenir.

#### Fonksiyonel Gereklilikler
- **Desteklenen diller:** Türkçe (`tr`) ve İngilizce (`en`).
- **Dil tespiti:** Cihaz dilinden otomatik (`expo-localization` vb. ile). Cihaz dili `tr` ise Türkçe, diğer tümünde İngilizce (Fallback: `en`).
- **Manuel dil değiştirme:** Ayarlar > Dil menüsünden.
- Tüm statik metinler, hata mesajları, bildirim içerikleri ve onboarding lokalize edilmelidir. Push notification'lar için backend (NestJS), `users` tablosundaki `language` alanını referans alır. Backend üzerinde şablon sistemi kurularak, FCM/APNs payload'ları kullanıcının seçili diline göre runtime'da oluşturulup gönderilir. Kullanıcı dili değiştirdiğinde backend anında güncellenir.
- **Lokalizasyon mimarisi (React Native):**
  - Çeviriler `tr.json` ve `en.json` dosyalarında (key-value mimarisiyle) tutulur (`i18next` standartları).
- Tarih/saat formatları locale'e göre otomatik ayarlanır (TR: `DD/MM/YYYY`, EN: `MM/DD/YYYY`).

#### Kabul Kriterleri
- [ ] İlk açılışta cihaz diline göre otomatik uygulama dilinin doğru atanması.
- [ ] Manuel dil değişikliğinin `React Context / i18next` üzerinden tetiklenmesi ve uygulamanın restart gerekmeden anında yeni dile geçmesi.
- [ ] Hiçbir ekranda eksik (fallback key olarak görünen) metin kalmaması.

---

### 4.13 — Global Odalar `#13 · Sosyal · P1`

#### İş Gereksinimi
Kullanıcıların aynı anda birbirinden habersiz ama aynı "odada" çalışması. Body doubling etkisi. Viral büyümenin tohumları bu özellikte.


#### Fonksiyonel Gereklilikler
- **MVP'de 3–5 sabit global oda:** Sabah Seansı, Gece Çalışması, Haftasonu Maratonu, Genel Oda.
- Kullanıcı seans başlatırken oda seçebilir **(isteğe bağlı).**
- Odada aktif kullanıcı sayısı gerçek zamanlı gösterilir ([#16](#416--odadaki-aktif-kullanıcı-göstergesi--16--sosyal--p1)).
- **Oda bazlı sohbet MVP'de YOK.** Sadece varlık hissi. (v2 kapsamı)
- WebSocket veya polling (5 saniyede bir) ile aktif sayı güncellenir.


#### Non-Fonksiyonel Gereklilikler
- Eş zamanlı **1.000 kullanıcıya** kadar ölçeklenebilir mimari.
- WebSocket bağlantısı kopunca otomatik yeniden bağlanma (exponential backoff).


#### Kabul Kriterleri
- [ ] Odaya giriş/çıkış anlık olarak aktif kullanıcı sayısına yansır.
- [ ] Seans bitişinde kullanıcı odadan otomatik çıkarılır.

---

### 4.14 —  Ambiyans Sesleri `#14 · UX · P1`

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

- **Bildirim izinleri:** Onboarding sırasında istenir. İzin verilmezse uygulama içi banner ile telafi edilir.
- **Bildirim ayarları:** Kullanıcı her bildirim türünü ayrı ayrı kapatabilir.
- **Quiet hours:** Gece **23:00 – 08:00** arası seri ve hatırlatıcı bildirimleri gönderilmez.

#### Non-Fonksiyonel Gereklilikler
- **FCM** (Android) + **APNs** (iOS) entegrasyonu.
- Bildirim gönderim başarı oranı izlenir (delivery tracking).

#### Kabul Kriterleri
- [ ] Tüm bildirim türleri doğru zamanlama ve içerikle iletilir.
- [ ] Kapatılan bildirim türleri gönderilmez.
- [ ] Quiet hours dışında Seri bildirimi gönderilmez.

---

### 4.16 —Odadaki Aktif Kullanıcı Göstergesi `#16 · Sosyal · P1`

#### İş Gereksinimi
`"Şu an 847 kişi çalışıyor"` hissi. Body doubling etkisini somutlaştıran minimal sosyal katman.

#### Fonksiyonel Gereklilikler
- Zamanlayıcı ekranında alt köşede küçük bir badge: `"X kişi şu an çalışıyor"`.
- Global oda seçilmişse o odanın sayısı, seçilmemişse toplam aktif kullanıcı sayısı gösterilir.
- Sayı her **5 saniyede bir** güncellenir 

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
- [ ] Kategorilere göre süre toplamları backend ile tutarlı.

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

- Haptic ve ses efektleri **ayarlardan ayrı ayrı** kapatılabilir. Bu tercihler cihazın lokal hafızasında (AsyncStorage) tutulur.
- Silent modda ses efektleri çalmaz, **haptic devam eder.**

#### Non-Fonksiyonel Gereklilikler
- **Haptic Altyapısı:** `expo-haptics` API'si kullanılacaktır.
- **Ses Altyapısı:** `expo-av` (Audio) API'si kullanılacaktır. 
- **Sessiz Mod Konfigürasyonu:** `expo-av` başlatılırken `playsInSilentModeIOS: false` bayrağı (flag) zorunlu olarak ayarlanmalıdır.

#### Kabul Kriterleri
- [ ] Ayarlardan kapatılan haptic veya sesin ilgili eylemde kesinlikle tetiklenmemesi.
- [ ] iOS ve Android cihazlar fiziksel olarak sessiz moda alındığında, uygulama içi ses efektlerinin çalmaması (haptic hariç).
- [ ] Haptic tetiklenmelerinde cihazda takılma (UI thread blocking) yaşanmaması.

---

### 4.19 — Karanlık Mod `#19 · UX · P1`

#### İş Gereksinimi
Gece çalışan öğrenci/üretken kitlenin standart beklentisini karşılamak.

#### Fonksiyonel Gereklilikler
- **Tema Seçenekleri:** Açık (Gündüz Gökyüzü) / Karanlık (Derin Uzay) / Sistem.
- Sistem ayarıyla **otomatik senkronize** olur. (Cihaz karanlık moda geçerse uygulama da geçer).
- Kullanıcı uygulama içinden Ayarlar menüsünden **manuel override** yapabilir. Manuel seçim her zaman sistem seçimini ezer.
- Manuel seçim yapıldığında uygulama yeniden başlatılmaya gerek kalmadan (React Context / State yönetimi ile) tüm UI anında güncellenir.
- Seçim, cihazın lokal hafızasında (`AsyncStorage`) tutulur (Local Persist).
- Tüm ekranlar ve componentler her iki modda okunabilirlik (WCAG kontrast kuralları) açısından test edilmiş olmalıdır.

#### Non-Fonksiyonel Gereklilikler (React Native)
- Sistem temasını dinlemek için `react-native` çekirdeğindeki `useColorScheme` hook'u veya `Appearance` modülü kullanılır.
- Uygulama geneli renk yönetimi ThemeProvider (veya benzeri bir Context mimarisi) ile sağlanır; hiçbir component'te hardcoded renk (örn: `color: '#000'`) kullanılmaz.

#### Kabul Kriterleri
- [ ] Sistem modu değiştiğinde (uygulama açıksa veya arka plandaysa) uygulama otomatik geçiş yapar.
- [ ] Manuel seçim yapıldığında uygulama anında tepki verir ve bu seçim sonraki açılışlarda korunur.

---

### 4.20 — Gökyüzü Paylaşımı `#20 · Sosyal · P1`

#### İş Gereksinimi
`"Bak galaksim ne kadar büyüdü"` paylaşımı. Kullanıcının emek verdiği galaksiyi sergilemesi ve uygulamanın organik büyümesini (K-Factor) sağlayan en güçlü motor.

#### Fonksiyonel Gereklilikler
- **Paylaş butonu:** Gökyüzü haritasında ([#04](#44--gökyüzü-haritası--04--gamification--p0)) ve seans sonu kutlama ekranında ([#14](#414--seans-sonu-kutlama-ekranı--14--gamification--p0)) yer alır.
- **Render ve Çıktı İşlemi:** - Gökyüzü ekranı arka planda bir ekran görüntüsüne (snapshot) dönüştürülür.
  - Görselin alt köşesine **Watermark:** `"Astrocus ile oluşturuldu"` damgası eklenir.
- **Paylaşım İçeriği (Payload):**
  - **Görsel:** Render edilen galaksi resmi.
  - **Metin (Ön Tanımlı):** `"Benim Astrocus galaksime bak! Sen de kendi gökyüzünü inşa et: [App/Play Store Deep Link]"`
- **Paylaşım hedefleri:** Cihazın standart paylaşım menüsü üzerinden Instagram (Post/Story), WhatsApp, Twitter/X ve genel paylaşım uygulamaları.

#### Non-Fonksiyonel Gereklilikler (React Native / Expo)
- Ekranı görsele çevirmek için `react-native-view-shot` (veya muadili) kullanılacaktır. Bu kütüphane varsayılan olarak main thread'de çalıştığı için render işlemi kesinlikle UI'ı dondurmamalıdır. Paylaşım işlemi `InteractionManager.runAfterInteractions` içine alınmalı veya ağır grafikler için off-screen render teknikleri kullanılmalıdır.
- Cihazın native paylaşım menüsünü tetiklemek için `expo-sharing` veya RN `Share` API kullanılır.

#### Kabul Kriterleri
- [ ] Paylaşım butonuna basıldığında galaksi görseli yüksek çözünürlükte, bozulmadan ve watermark ile render edilir.
- [ ] Native share sheet (paylaşım menüsü) sorunsuz açılır ve tüm uyumlu platformları (Instagram, WhatsApp vb.) listeler.
- [ ] Paylaşım yapıldığında hem görsel hem de mağaza linkini içeren ön tanımlı metin birlikte gönderilir (Platform izin veriyorsa).

---

## 5. Teknik Mimari & Gereklilikler

### 5.1 Platform & Stack Önerisi

| Katman | Tercih / Öneri |
|---|---|
| **Mobile Framework** | **React Native (Expo) + TypeScript** — Cross-platform hız avantajı ve uçtan uca tip güvenliği. Arka plan servisleri (zamanlayıcı, ambient ses) için **Expo Development Build** hazırlıklı başlanmalıdır. Managed Workflow ile başlanabilir ancak ilk sprint'ten itibaren custom native module ihtiyacına karşı hazırlıklı olunmalıdır. |
| **Backend** | Node.js (NestJS) + Prisma ORM. Modüler yapısı ve yerleşik WebSocket (Socket.io) desteği ile Global Odalar için uygundur. Uygulama, WebSocket bağlantılarının kopmaması için serverless bir ortamda değil, Render veya Railway gibi container tabanlı kesintisiz bir sunucuda (PaaS) barındırılacaktır. |
| **Veritabanı** | **PostgreSQL (Supabase) + Redis (Upstash)** — İlişkisel veriler için Supabase üzerinde Postgres, gerçek zamanlı oda mevcudiyeti (presence) ve streak önbelleği için Upstash Redis. Supabase'in native Redis desteği bulunmadığından Upstash ayrıca entegre edilmelidir; aynı region'da konuşlandırılması latency sorununu ortadan kaldırır. |
| **Auth** | **Supabase Auth** — Postgres ile doğrudan ve güvenli konuşur. Apple Sign-In ve Google OAuth entegrasyonu Expo ile sorunsuz çalışır. |
| **Push Bildirimi** | **Expo Push Notifications** — FCM veya APNs sertifikalarıyla tek tek uğraşmak yerine tek bir API ile her iki platforma bildirim atılır. Büyüme fazında FCM/APNs direkt geçişine hazırlıklı olmak için kod tarafında **NotificationService soyutlama katmanı** ilk sprint'te oluşturulmalıdır. |
| **Dosya / CDN** | **Supabase Storage** — Auth ve DB için Supabase kullanıldığından avatar ve paylaşım render'larını aynı ekosistemde tutmak DevOps maliyetini ve entegrasyon yükünü sıfırlar. |
| **Analytics** | **Mixpanel** — Battle-tested React Native entegrasyonu ve MVP için yeterli event tracking (streak, funnel, retention). PostHog'un React Native SDK'sı henüz olgunlaşmadığından büyüme fazında geçiş değerlendirilebilir. |
| **Monitoring** | **Sentry** — Crash raporlama ve performans izleme (haptic/ses gecikmeleri vb.) için MVP aşamasında tek başına yeterlidir. |


### 5.2 Non-Fonksiyonel Gereklilikler

| Gereklilik | Hedef |
|---|---|
| **API Response Time** | << 200ms (p95) — Sık kullanılan endpoint'ler Upstash Redis ile önbelleğe alınarak hedef < 150ms'ye çekilecektir. |
| **Uygulama İlk Yükleme** | < 2 saniye — Expo bundle optimizasyonu ve lazy loading ile sağlanır |
| **Eş Zamanlı Kullanıcı** | MVP: Upstash free tier (10.000 komut/gün) yeterlidir. Büyüme fazında Upstash Pay-as-you-go'ya geçilerek yatay ölçekleme sağlanır |
| **Çevrimdışı Destek** |Seanslar cihazda (AsyncStorage/SecureStore) tutulur. İnternet gelince NestJS sync endpoint'ine toplu iletilir. Offline seanslar streak hesaplamaları için retroaktif olarak kabul edilir ancak hile koruması gereği "is_offline" olarak işaretlenir.|
| **Güvenlik** | HTTPS/TLS 1.3 zorunlu, Prisma ORM SQL injection'ı yapısal olarak engeller, SupabaseAuthGuard tüm korumalı endpoint'leri kapsar, rate limiting (60 req/dk/user) NestJS Guard katmanında uygulanır |
| **KVKK / GDPR** | Kullanıcı verisi silme hakkı (30 gün içinde Supabase + Upstash'ten temizlenir), veri işleme politikası onboarding'de gösterilir, Mixpanel veri saklama süresi 90 gün ile sınırlandırılır |
| **Erişilebilirlik** | iOS VoiceOver + Android TalkBack temel desteği, WCAG AA kontrast oranı — karanlık mod (#18) her iki standard için ayrıca test edilir |

### 5.3 Temel Veri Modeli

```sql
-- Kullanıcılar
users (
  id, email, username, avatar_id, galaxy_name,
  total_stardust, streak_count, longest_streak,
  language, theme, created_at, deleted_at
)

-- Odaklanma kategorileri
categories (
  id, name, icon_url
)

-- Seans kayıtları
sessions (
  id, user_id, category_id, duration_minutes,
  stardust_earned, multipliers_applied JSON,
  room_id, started_at, completed_at, is_completed
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

-- Oda varlığı (Redis'te tutulur, Postgres'e yazılmaz)
-- room_presence: user_id, room_id, session_id, joined_at
```

---

## 6. Bağımlılıklar, Riskler & Varsayımlar

### 6.1 Kritik Bağımlılıklar

| Bağımlılık | Etki (Eksik Olursa) |
|---|---|
| **Apple Sign In API** | iOS App Store zorunluluğu — eksik olursa uygulama red alır |
| **Expo Push Notifications** | Streak, çıkış toleransı ve motivasyon bildirimleri çalışmaz; FCM/APNs sertifikaları Expo üzerinden tanımlanmalıdır |
| **NestJS + Socket.io + Upstash Redis** | Global odalar ve aktif kullanıcı sayısı gerçek zamanlılığı bozulur; Redis olmadan presence yönetimi mümkün değildir |
| **Ambient ses dosyaları** | Lisanslı veya royalty-free kaynaklardan temin edilmeli; eksik olursa #10 özelliği devre dışı kalır |
| **Supabase (Auth + Postgres + Storage)** | Tüm kimlik doğrulama, veri saklama ve dosya yönetimi bu servise bağımlıdır; servis kesintisi uygulamayı tamamen etkiler |

### 6.2 Riskler & Azaltma Stratejileri

| Risk | Seviye | Azaltma |
|---|---|---|
| Galaksi ekranı animasyonu düşük cihazlarda takılır | 🔴 Yüksek | Lottie/Rive optimizasyonu; düşük donanımlı cihazlar için grafik kalite ayarı eklenebilir |
| Stardust formülü dengesiz; kazanım çok kolay/zor | 🔴 Yüksek | İlk 50 beta kullanıcısından data alın, soft-launch'ta formülü ayarlayın |
| Expo Managed Workflow arka plan servis limitlerine takılır | 🔴 Yüksek | Zamanlayıcı ve ambient ses arka plan testleri ilk sprint'te yapılmalı; sorun çıkarsa Expo Development Build'e geçilmeli |
| Supabase cold start yüksek response time üretir | 🟡 Orta | Sık kullanılan endpoint'ler Upstash Redis ile önbelleğe alınır; kritik sorgular için connection pooling (Supabase pgBouncer) aktif edilir |
| WebSocket yüksek trafikte aşırı yüklenir | 🟡 Orta | Upstash Redis pub/sub ile yatay ölçekleme; bağlantı kopuklarında polling fallback devreye girer |
| Upstash free tier günlük komut kotası aşılır | 🟡 Orta | MVP trafiği için yeterli ancak kullanım izlenir; eşik aşılınca Pay-as-you-go'ya geçilir |
| Apple Review süreci MVP yayınını geciktirir | 🟡 Orta | Review kuyruğuna erken girilmeli; Apple Sign In ve privacy manifest eksiksiz olmalıdır |
| KVKK uyumsuzluğu ceza riski oluşturur | 🟢 Düşük-Orta | Veri işleme sözleşmesi ve gizlilik politikası hukuk onayından geçmeli; Mixpanel veri saklama 90 günle sınırlandırılmalıdır |

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
- [ ] FCM / APNs direkt entegrasyonu (Expo Push üzerinden yönetilir; büyüme fazında değerlendirilebilir)
- [ ] PostHog'a geçiş (Mixpanel ile başlanır; büyüme fazında değerlendirilebilir)
---

*Astrocus PRD — MVP v1.0 · Bu döküman dahili kullanım içindir.*
