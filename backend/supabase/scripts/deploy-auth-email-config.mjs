import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { AUTH_EMAIL_OTP_EXPIRY_SECONDS } from "../templates/auth-email-palette.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const backendRoot = join(root, "..");
const templatesDir = join(root, "templates");

dotenv.config({ path: join(backendRoot, ".env") });

/** .env satır sonu yorumlarını (# ...) temizler. */
const env = (key) => {
  const raw = process.env[key];
  if (!raw) {
    return "";
  }
  return raw.split("#")[0].trim();
};

const accessToken = env("SUPABASE_ACCESS_TOKEN");
const projectRef = env("SUPABASE_PROJECT_REF") || env("SUPABASE_PROJECT_ID");

if (!accessToken || !projectRef) {
  console.error(
    "Gerekli ortam değişkenleri: SUPABASE_ACCESS_TOKEN ve SUPABASE_PROJECT_REF (veya SUPABASE_PROJECT_ID).",
  );
  console.error("Token: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const readTemplate = (filename) => readFileSync(join(templatesDir, filename), "utf8");

const REDIRECT_ALLOW_LIST = [
  "astrocus://auth/callback",
  "astrocus://**",
  "exp://**",
  "astrocus://reset-password",
  "astrocus://verify-email",
  "astrocus://verify-success",
  "astrocus://",
  "https://astrocus.up.railway.app/auth/mobile-redirect",
  "https://astrocus.up.railway.app/auth/mobile-redirect?*",
].join(",");

const smtpHost = env("SMTP_HOST");
const smtpPort = Number(env("SMTP_PORT") || "587");
const smtpUser = env("SMTP_USER");
const smtpPass = env("SMTP_PASS");
const smtpAdminEmail = env("SMTP_ADMIN_EMAIL");

const payload = {
  mailer_otp_exp: AUTH_EMAIL_OTP_EXPIRY_SECONDS,
  mailer_subjects_confirmation: "Astrocus — E-postanı doğrula",
  mailer_templates_confirmation_content: readTemplate("confirmation.html"),
  mailer_subjects_recovery: "Astrocus — Şifre sıfırlama",
  mailer_templates_recovery_content: readTemplate("recovery.html"),
  site_url: "https://astrocus.up.railway.app",
  uri_allow_list: REDIRECT_ALLOW_LIST,
  smtp_sender_name: "Astrocus",
};

if (smtpHost && smtpUser && smtpPass && smtpAdminEmail) {
  Object.assign(payload, {
    external_email_enabled: true,
    smtp_host: smtpHost,
    smtp_port: String(Number.isFinite(smtpPort) ? smtpPort : 587),
    smtp_user: smtpUser,
    smtp_pass: smtpPass,
    smtp_admin_email: smtpAdminEmail,
  });
  console.log("[Astrocus] Custom SMTP ayarları payload'a eklendi:", smtpHost);
} else {
  console.warn(
    "[Astrocus] SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_ADMIN_EMAIL eksik — yalnızca şablonlar güncellenir. Kayıt e-postaları için custom SMTP gerekir (prodocs/tech-stack.md (auth e-posta)).",
  );
}

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Auth config güncellenemedi (${response.status}):`, body);
  process.exit(1);
}

console.log(
  `Auth e-posta + redirect ayarları güncellendi (OTP: ${AUTH_EMAIL_OTP_EXPIRY_SECONDS} sn / 15 dk).`,
);
