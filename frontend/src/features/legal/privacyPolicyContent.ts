import type { Language } from "../../shared/types";

type PolicyBlock = { title: string; body: string };

const tr: PolicyBlock[] = [
  {
    title: "Veri Sorumlusu",
    body: "Astrocus (Future Talent 2026 bitirme projesi), odaklanma ve gamification verilerinizi yalnızca uygulama işlevselliği için işler.",
  },
  {
    title: "Toplanan Veriler",
    body: "Hesap (e-posta), profil (kullanıcı adı, avatar, galaksi adı), odak seansları (süre, kategori), yıldız tozu kayıtları ve cihazda saklanan tercihler (dil, onboarding).",
  },
  {
    title: "Yapay Zeka",
    body: "Seans sonrası Galaktik Tavsiyeler için özet odak verileriniz Gemini API üzerinden işlenir; API anahtarı yalnızca sunucuda tutulur.",
  },
  {
    title: "Saklama ve Güvenlik",
    body: "Veriler Supabase (PostgreSQL) üzerinde şifreli bağlantı ile saklanır. Satır düzeyinde güvenlik (RLS) ile yalnızca kendi verinize erişirsiniz.",
  },
  {
    title: "Haklarınız",
    body: "Profil → Hesabı Sil ile hesabınızı ve ilişkili verileri kalıcı olarak silebilirsiniz. İletişim: proje geliştirici e-postası (README).",
  },
];

const en: PolicyBlock[] = [
  {
    title: "Data Controller",
    body: "Astrocus (Future Talent 2026 capstone) processes focus and gamification data only to operate the app.",
  },
  {
    title: "Data We Collect",
    body: "Account (email), profile (username, avatar, galaxy name), focus sessions (duration, category), stardust ledger entries, and on-device preferences.",
  },
  {
    title: "AI Processing",
    body: "Galactic Tips use summarized focus metrics via Gemini API; keys stay on the server only.",
  },
  {
    title: "Storage & Security",
    body: "Data is stored in Supabase (PostgreSQL) with Row Level Security so you only access your own rows.",
  },
  {
    title: "Your Rights",
    body: "Delete your account from Profile → Delete Account. Contact the developer email listed in README.",
  },
];

export const getPrivacyPolicyBlocks = (language: Language): PolicyBlock[] =>
  language === "en" ? en : tr;
