# Astrocus — Tech Stack

[cite_start]Bu doküman, Astrocus uygulamasında kullanılan teknolojileri, servis seçimlerinin gerekçelerini ve geliştirme sürecinde yapay zekanın nasıl kullanıldığını özetler[cite: 29].

## 1. Mimari Genel Bakış & Repozitori Yapısı

[cite_start]Proje, gelecekte farklı platformlara hizmet verebilmesi adına frontend ve backend birbirinden ayrı olacak şekilde, API tabanlı bir mimariyle kurgulanmıştır[cite: 11]. Tüm proje tek bir monorepo altında yapılandırılmıştır.

* [cite_start]`/frontend`: Expo Router ve React Native kullanılarak yazılmış arayüz kodlarını içerir[cite: 16, 18].
* [cite_start]`/backend`: Node API (Gemini entegrasyonu, hesap silme) ve Supabase yapılandırmalarını barındıran arkayüz kodudur[cite: 17, 20].
* [cite_start]`/prodocs`: Geliştirme sürecinde AI ajanlarına bağlam sağlamak için kullanılan referans belgelerini (`PRD.md`, `Plan.md`, vb.) tutar[cite: 19].
* [cite_start]`.gitignore`: Proje kalabalığını ve gereksiz dosyaların repoya girmesini engeller[cite: 21, 22].
* [cite_start]`.env.example`: Gerçek API anahtarları paylaşılmadan projenin nasıl ayağa kaldırılacağını gösteren şablon ortam dosyasıdır[cite: 24, 35].

## 2. Frontend Katmanı (`frontend/`)

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| **Framework** | Expo SDK 54 + React Native | Cross-platform geliştirme olanağı sunması, tek kod tabanı ve Expo Go ile cihazlarda hızlı test imkanı. |
| **Dil** | TypeScript | Tip güvenliği (type safety) sağlayarak çalışma zamanı hatalarını minimize etmesi. |
| **Routing** | Expo Router | Dosya tabanlı route yapısı kurması ve native navigation ile deep link desteklemesi. |
| **State Yönetimi**| React Context | Auth, Session ve UI state'lerini yönetmek için MVP aşamasında yeterli ve performanlı olması. |
| **Backend Client**| `@supabase/supabase-js` | Mobil istemciden Row Level Security (RLS) kuralları ile veritabanına güvenli doğrudan erişim sağlaması. |
| **Depolama** | SecureStore + AsyncStorage | Hassas verilerin (token) SecureStore'da izole edilmesi, tercihlerin ve offline kuyruk seanslarının AsyncStorage'da tutulması. |

## 3. Backend Katmanı (`backend/`)

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| **Veritabanı** | Supabase PostgreSQL | Hosted Postgres sağlaması, RLS politikaları ile güvenliği garanti etmesi ve dahili Auth yapısı sunması. |
| **API** | Node.js + Express 5 | LLM çağrılarını (proxy) ve Supabase service role gerektiren hesap silme gibi yetkili işlemleri frontend'den izole etmek. |
| **AI Servisi** | Google Gemini | Uygulamanın çekirdek motivasyon mantığına entegre, hızlı ve güvenilir içerik üretimi. |
| **Doğrulama** | Zod | API isteklerinde gelen verilerin şema doğrulamalarını standartlaştırmak. |

## 4. Yapay Zeka Entegrasyonu (Ürün Özellikleri)

[cite_start]Yapay zeka (LLM) servisleri, uygulamanın çekirdek mantığına API üzerinden entegre edilerek gerçek bir probleme çözüm üretmesi hedeflenmiştir[cite: 10].

* **Çekirdek Kullanım (Galaktik Tavsiyeler):** Kullanıcı odaklanma seansını bitirdiğinde; seans süresi, çalışılan kategori ve streak bilgilerine dayalı olarak kişiselleştirilmiş, kozmik temalı tek cümlelik bir motivasyon tavsiyesi üretilir.
* **Veri Akışı:** Mobil İstemci → `POST /ai/galactic-advice` → Node.js Backend → Google Gemini API (`@google/generative-ai`) → Kutlama Modalı.
* **Güvenlik Katmanı:** Prompt injection risklerini önlemek için `GEMINI_API_KEY` kesinlikle frontend'e eklenmemiş, sadece backend tarafındaki `.env` dosyasında gizlenmiştir.

## 5. Yapay Zeka Kullanımı (Geliştirme Süreci)

[cite_start]Geliştirme sürecinde AI destekli araçlar ve metodolojiler aktif olarak kullanılmıştır[cite: 48, 49].

* **Araçlar:** Birincil kodlama ve refactoring asistanı olarak Cursor IDE kullanılmıştır.
* **Bağlam Yönetimi:** AI ajanlarının projeyi doğru anlayabilmesi için tüm mimari kurallar `/prodocs` klasöründe tutulmuş ve ajana referans olarak sunulmuştur.
* **İlerleme Takibi:** Geliştirme esnasında yapay zeka ile birlikte alınan mimari kararlar ve çözülen bug'lar şeffaf bir şekilde `Progress.md` dosyasına kayıt edilerek ilerlenmiştir.

## 6. Veri Akışı ve Veritabanı Modeli

### Veri Akışı
1. Mobil istemci Supabase'e JWT kullanarak bağlanır ve kendi verisini okur/yazar (RLS aktif).
2. Seans bittiğinde `complete_focus_session` RPC fonksiyonu tetiklenir (atomik işlem).
3. Mobil istemci Node.js API'sine (port 4000) token ile istek atarak Gemini tavsiyesi ister.

### Temel Tablolar (Supabase)
* `profiles`: Kullanıcı profil ve ilerleme verileri (`auth.users` ile birebir eşleşir).
* `sessions`: Tamamlanan odaklanma seanslarının kayıtları.
* `stardust_ledger`: Gamification için kazanılan/harcanan yıldız tozu hareketleri.

## 7. DevOps ve CI/CD İşlemleri
* **GitHub Actions:** Frontend ve backend tarafındaki kodların push öncesi tip doğrulamalarından (typecheck) geçmesi.
* [cite_start]**Kurallar:** `.env.example` şablonları oluşturulmuş, gerçek anahtarlar ve Supabase veritabanı şifreleri repoya kesinlikle pushlanmamıştır[cite: 24, 35].