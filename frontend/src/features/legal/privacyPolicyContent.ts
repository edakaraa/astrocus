import type { Language } from "../../shared/types";

type PolicyBlock = { title: string; body: string };

const EFFECTIVE_DATE = "6 Haziran 2026";
const EFFECTIVE_DATE_EN = "June 6, 2026";
const CONTACT_EMAIL = "edakara.dev@gmail.com";

const tr: PolicyBlock[] = [
  {
    title: "Veri Sorumlusu",
    body: `Astrocus uygulamasının veri sorumlusu, uygulamayı geliştiren ve işleten kişidir (${CONTACT_EMAIL}). Yürürlük tarihi: ${EFFECTIVE_DATE}.`,
  },
  {
    title: "Topladığımız Veriler",
    body: `Hesap ve kimlik: e-posta adresi, kullanıcı adı, görünen ad (isteğe bağlı), şifre (yalnızca e-posta ile kayıtta; şifrelenmiş olarak Supabase Auth tarafından saklanır), dil tercihi. Google ile giriş yaparsanız Google kimlik doğrulama için ad ve e-posta bilgisini bizimle paylaşır; şifre oluşturmanız gerekmez.

Profil ve oyunlaştırma: avatar seçimi, galaksi adı, hedef yıldız, toplam yıldız tozu ve XP, seviye, seri (streak) kayıtları, açılan yıldızlar, rozetler ve takımyıldızı ilerlemesi, günlük hedef süresi.

Odak seansları: kategori, süre, kazanılan yıldız tozu ve XP, duraklatma kullanımı, başlangıç ve bitiş zamanları; çevrimdışı tamamlanan seanslar cihazınızda geçici olarak saklanır ve bağlantı gelince sunucuya iletilir.

Haftalık raporlar: odak istatistiklerinizden üretilen özet metinler (Türkçe ve İngilizce) veritabanında saklanır.

Cihaz ve teknik veriler: oturum belirteci (token) güvenli cihaz deposunda tutulur; tercihler standart yerel depolamada saklanır. İsteğe bağlı push bildirimleri için Expo push token'ı ve bildirim tercihiniz profilinizde saklanır. Üretim ortamında, yapılandırıldığında: çökme ve hata raporları (Sentry), uygulama kullanım olayları ve ekran görüntülemeleri (PostHog), işletim sistemi sürümü ve cihaz modeli gibi teknik bilgiler.`,
  },
  {
    title: "Verileri Neden ve Nasıl Kullanıyoruz",
    body: `Verilerinizi şu amaçlarla işleriz: hesap oluşturma ve güvenli giriş; odak seanslarınızı kaydetme ve ilerlemenizi (yıldız tozu, XP, rozetler, takımyıldızları) gösterme; oyunlaştırma kurallarını uygulama ve hile girişimlerini önleme (ör. minimum süre ve sunucu tarafı doğrulama); haftalık kişiselleştirilmiş odak raporu üretme; isteğe bağlı push bildirimleri gönderme; uygulama kararlılığını izleme ve hataları giderme; ürün deneyimini iyileştirmek için anonim veya kimliklendirilmiş kullanım analitiği.

Hukuki dayanak (KVKK / GDPR): sözleşmenin ifası (hesap ve temel özellikler), meşru menfaat (güvenlik, hata ayıklama, analitik) ve açık rızanız (push bildirimleri ve kayıt sırasında kabul ettiğiniz gizlilik politikası).`,
  },
  {
    title: "Üçüncü Taraf Hizmetler",
    body: `Verileriniz aşağıdaki hizmet sağlayıcıların altyapısında işlenir; her birinin kendi gizlilik politikası geçerlidir:

• Supabase — veritabanı (PostgreSQL), kimlik doğrulama ve güvenli API erişimi.
• Expo / EAS — uygulama derleme, dağıtım ve push bildirim altyapısı.
• OpenRouter — haftalık AI odak raporları için özet istatistiklerin işlenmesi.
• PostHog — ürün analitiği (yapılandırıldığında).
• Sentry — çökme ve hata raporlama (yapılandırıldığında).
• Google — isteğe bağlı Google ile giriş (OAuth).

Bu sağlayıcılar verileri kendi sunucularında (çoğunlukla ABD ve AB bölgeleri) işleyebilir.`,
  },
  {
    title: "Yapay Zeka İşleme",
    body: `Haftalık odak raporlarınız, seans özet istatistikleriniz (ör. toplam dakika, seans sayısı, seri, günlük hedef) OpenRouter üzerinden yapay zeka modellerine gönderilerek kişiselleştirilmiş metin üretilir. Ham e-posta adresiniz veya şifreniz bu isteklere dahil edilmez. API anahtarları yalnızca sunucu tarafında tutulur.`,
  },
  {
    title: "Saklama Süresi",
    body: `Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı sildiğinizde profil, seanslar, yıldız tozu kayıtları, rozetler, haftalık raporlar ve kimlik doğrulama kaydınız kalıcı olarak silinir. Analitik ve çökme raporları, ilgili üçüncü taraf sağlayıcıların saklama politikalarına tabidir; hesap silme sonrası kimlik bilgileriniz bu sistemlerde sıfırlanır veya ayrıştırılır.`,
  },
  {
    title: "Veri Güvenliği",
    body: `Veriler TLS (HTTPS) ile şifrelenerek iletilir. Veritabanında Satır Düzeyinde Güvenlik (RLS) ile yalnızca kendi kayıtlarınıza erişebilirsiniz. Oturum belirteçleri cihazda güvenli depoda saklanır. Hesap silme gibi yetkili işlemler yalnızca sunucu tarafında, hizmet rolü ile gerçekleştirilir.`,
  },
  {
    title: "Haklarınız ve Hesap Silme",
    body: `KVKK ve GDPR kapsamında verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve taşınabilirlik talep etme haklarına sahipsiniz.

Hesabınızı ve tüm ilişkili verilerinizi uygulama içinden kalıcı olarak silebilirsiniz: Ayarlar → Hesabı Sil → «Hesabımı kalıcı olarak sil». Bu işlem geri alınamaz; profil, seanslar, ilerleme kayıtları ve kimlik doğrulama hesabınız silinir.

Veri talepleriniz veya gizlilik sorularınız için: ${CONTACT_EMAIL}`,
  },
  {
    title: "Çocukların Gizliliği",
    body: "Astrocus çocuklara özel olarak tasarlanmamıştır ve çocuklardan bilerek kişisel veri toplamayı hedeflemez. Ebeveyn veya veli iseniz ve çocuğunuzun veri paylaştığını düşünüyorsanız İletişim bölümünden bize ulaşabilirsiniz.",
  },
  {
    title: "Politika Değişiklikleri",
    body: `Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde uygulama içi bildirim veya güncellenmiş yürürlük tarihi ile bilgilendirilirsiniz. Güncellemeden sonra uygulamayı kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.`,
  },
  {
    title: "İletişim",
    body: `Gizlilik ile ilgili sorular, talepler veya Google Play inceleme ekibi iletişimi için: ${CONTACT_EMAIL}`,
  },
];

const en: PolicyBlock[] = [
  {
    title: "Data Controller",
    body: `The data controller for Astrocus is the individual developer and operator of the app (${CONTACT_EMAIL}). Effective date: ${EFFECTIVE_DATE_EN}.`,
  },
  {
    title: "Data We Collect",
    body: `Account & identity: email address, username, display name (optional), password (email sign-up only; stored encrypted by Supabase Auth), language preference. If you sign in with Google, Google shares your name and email for authentication; you do not set a password with us.

Profile & gamification: avatar choice, galaxy name, target star, total stardust and XP, level, streak records, unlocked stars, badges, constellation progress, daily goal duration.

Focus sessions: category, duration, stardust and XP earned, pause usage, start and end times; offline sessions are stored temporarily on your device and synced when online.

Weekly reports: summary text generated from your focus statistics (Turkish and English) stored in our database.

Device & technical data: session token in secure device storage; preferences in standard local storage. Optional push notifications: Expo push token and notification preference on your profile. In production, when configured: crash and error reports (Sentry), app usage events and screen views (PostHog), and technical info such as OS version and device model.`,
  },
  {
    title: "Why and How We Use Data",
    body: `We process your data to: create and secure your account; record focus sessions and show progress (stardust, XP, badges, constellations); enforce gamification rules and prevent abuse (e.g. minimum duration and server-side validation); generate personalized weekly focus reports; send optional push notifications; monitor stability and fix errors; improve the product through analytics.

Legal basis (GDPR / KVKK): contract performance (account and core features), legitimate interests (security, debugging, analytics), and your consent (push notifications and privacy policy acceptance at sign-up).`,
  },
  {
    title: "Third-Party Services",
    body: `Your data is processed using the infrastructure below; each provider's own privacy policy applies:

• Supabase — database (PostgreSQL), authentication, and secure API access.
• Expo / EAS — app builds, distribution, and push notification infrastructure.
• OpenRouter — processing summarized statistics for weekly AI focus reports.
• PostHog — product analytics (when configured).
• Sentry — crash and error reporting (when configured).
• Google — optional Sign in with Google (OAuth).

These providers may process data on their servers (commonly in the US and EU).`,
  },
  {
    title: "AI Processing",
    body: `Weekly focus reports send summarized session statistics (e.g. total minutes, session count, streak, daily goal) to AI models via OpenRouter. Your raw email or password is not included. API keys are kept server-side only.`,
  },
  {
    title: "Data Retention",
    body: `We retain your data while your account is active. When you delete your account, your profile, sessions, stardust ledger, badges, weekly reports, and authentication record are permanently deleted. Analytics and crash data follow the retention policies of those third-party providers; identifiers are reset or disassociated after account deletion.`,
  },
  {
    title: "Data Security",
    body: `Data is transmitted over TLS (HTTPS). Row Level Security (RLS) in the database ensures you can only access your own records. Session tokens are stored in secure device storage. Privileged operations such as account deletion run server-side with a service role.`,
  },
  {
    title: "Your Rights & Account Deletion",
    body: `Under GDPR and KVKK you may request access, correction, deletion, restriction, and portability of your data.

You can permanently delete your account and all related data in the app: Settings → Delete Account → "Permanently delete my account". This cannot be undone; your profile, sessions, progress, and auth account are removed.

For data requests or privacy questions: ${CONTACT_EMAIL}`,
  },
  {
    title: "Children's Privacy",
    body: "Astrocus is not designed specifically for children and does not knowingly target the collection of personal data from children. If you are a parent or guardian and believe your child has shared data with us, please reach out via the Contact section.",
  },
  {
    title: "Policy Changes",
    body: `We may update this policy from time to time. Material changes will be communicated via in-app notice or an updated effective date. Continued use after an update means you accept the revised policy.`,
  },
  {
    title: "Contact",
    body: `Privacy questions, data requests, and Play Store review contact: ${CONTACT_EMAIL}`,
  },
];

export const getPrivacyPolicyBlocks = (language: Language): PolicyBlock[] =>
  language === "en" ? en : tr;
