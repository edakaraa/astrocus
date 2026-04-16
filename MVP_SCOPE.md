# Astrocus — MVP v1.0 Kapsamı

> **Ürün Vizyonu:** Astrocus, her odaklanma seansını bir galaksi inşa etme deneyimine dönüştürür. Soyut süreyi somut bir galaksiye dönüştürerek içsel motivasyon ve duygusal bağ yaratmayı hedefler.
> 
> **Hedef Platform:** iOS & Android (React Native)
> **Desteklenen Diller:** Türkçe (TR) + İngilizce (EN)

## 🚀 Çekirdek Özellikler (P0 - Kritik)

* **Odaklanma Zamanlayıcısı:** Varsayılan 25 dakika, 5-120 dakika arası ayarlanabilen, arka planda da çalışmaya devam eden temel sayaç.
* **Kategori Seçimi:** Çalışma, Okuma, Proje, Yaratıcılık, Spor, Meditasyon, Kodlama ve Diğer kategorilerinde odaklanma kaydı.
* **Çıkış Toleransı (Grace Period):** Arka plana alındığında devreye giren 20 saniyelik tolerans süresi. 10. saniyede "Yıldızın sönmek üzere" uyarısı.
* **Günlük Özet ve Profil:** Günlük toplam odaklanma süresi, kategori dağılımı ve günlük hedeflerin takibi.
* **Kullanıcı Hesabı:** E-posta, Google OAuth ve Apple Sign In (iOS zorunlu) ile JWT tabanlı oturum yönetimi.
* **Onboarding Akışı:** Karşılama, galaksi tanıtımı ve ilk yıldız seçimini içeren 3 adımlı başlangıç ekranı.

## 🌌 Oyunlaştırma (Gamification) (P0 & P1)

* **Yıldız Seçme ve Galaksi Ekranı:** Açık uzay temasında kilitli ve açık yıldızların sergilendiği ana interaktif ekran.
* **Yıldız Tozu (Stardust) Sistemi:** Seans süresine, streak ve kategori bonuslarına göre kazanılan ödül mekaniği.
* **Gökyüzü Haritası:** Toplam açık yıldızların ve stardust ilerlemesinin gösterildiği, detaylı istatistik sunan görsel harita.
* **Streak Takibi:** 24 saat içinde en az 1 seans tamamlamaya dayalı zincir sistemi ve tehlike bildirimleri.
* **Seans Sonu Kutlama:** Kazanılan stardust ve açılan yıldızların tam ekran, 60fps animasyonlarla gösterildiği ve paylaşılabildiği ekran.

## 🎧 UX ve Sosyal Özellikler (P1 - Yüksek)

* **Global Odalar:** Sabah Seansı, Gece Çalışması, Haftasonu Maratonu ve Genel Oda olmak üzere eş zamanlı varlık hissi veren lobiler.
* **Oda İçi Gösterge:** Odadaki aktif kullanıcı sayısını anlık (WebSocket/polling) gösteren badge.
* **Ambient Sesler:** İnternetsiz çalışabilen Yağmur, Beyaz Gürültü, Kafe ve Orman sesleri.
* **Tema ve Geri Bildirim:** Otomatik/manuel Karanlık Mod desteği ve haptic (dokunsal) geri bildirimler.
* **Sosyal Paylaşım:** Oluşturulan gökyüzünün "Astrocus ile oluşturuldu" filigranıyla sosyal mecralara native aktarımı.

## 🛠 Teknik Mimari

* **Frontend:** React Native (Expo)
* **Backend:** Node.js (NestJS) veya Python (FastAPI)
* **Veritabanı & Cache:** PostgreSQL, Redis (WebSocket ve Session için)
* **Kimlik Doğrulama:** Supabase Auth / Firebase Auth
* **Bildirimler:** FCM (Android) & APNs (iOS)

## 🛑 Kapsam Dışı (MVP v2 ve Sonrası)

> Geliştirme sürecinde MVP dışına çıkmamak için bu özellikler şimdilik backlog'a alınmıştır.

* Oda içi sohbet / mesajlaşma
* Arkadaş ekleme ve sosyal takip
* Premium abonelik, ödeme sistemleri ve özel ses/görsel paketler
* Liderlik tablosu (Leaderboard)
* Web ve Wear OS / Apple Watch desteği
