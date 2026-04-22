# Astrocus — MVP v1.2 Kapsamı

> **Ürün Vizyonu:** Astrocus, her odaklanma seansını bir galaksi inşa etme deneyimine dönüştürür. MVP'nin amacı bu çekirdek döngüyü sade, tutarlı ve ölçülebilir şekilde doğrulamaktır.
>
> **Hedef Platform:** iOS & Android
> **Uygulama Tipi:** Cross-platform mobil uygulama
> **Desteklenen Diller:** Türkçe (TR) + İngilizce (EN)

## MVP Hedefi

Bu sürümde doğrulanacak ana deneyim:

1. Kullanıcı onboarding'i tamamlar.
2. Bir yıldız seçer ve ilk seansını başlatır.
3. Seansı tamamlayıp yıldız tozu kazanır.
4. İlerlemesini galaksi / gökyüzü haritasında görür.
5. Günlük özet ve streak ile geri dönme motivasyonu kazanır.

## Çekirdek Özellikler (P0)

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

## MVP Teknik Sınırları

* Zamanlayıcı doğruluğu MVP'de sürekli çalışan arka plan servisiyle değil, `AppState + timestamp farkı` yaklaşımıyla korunur.
* Aktif seans için gerekli cihaz içi uyarı dışında engagement amaçlı uzak bildirimler MVP kapsamında değildir.
* Kimlik, seans doğrulama, ödül hesaplama ve veri senkronizasyonu için bir sunucu katmanı gerekir; bunun kesin implementasyonu teknik tasarım aşamasında netleşir.
* Hassas veriler güvenli cihaz depolamasında, UI tercihleri ve offline kuyruk gibi hassas olmayan veriler standart local storage'da tutulur.
* Analytics ve hata izleme MVP için zorunludur; araç seçimi değiştirilebilir.

## Başarı Ölçümünde Odaklanılacak Alanlar

* İlk 24 saatte ilk seans tamamlama oranı
* Onboarding tamamlama oranı
* Ortalama seans süresi
* Haftalık retention
* 3+ gün streak oluşturan kullanıcı oranı

## Kapsam Dışı (Post-MVP)

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
