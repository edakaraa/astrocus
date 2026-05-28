/** Kayıt sonrası oturum yok — e-posta doğrulaması bekleniyor (hata değil). */
export class EmailConfirmationRequiredError extends Error {
  readonly email: string;

  constructor(email: string) {
    super("E-posta adresine doğrulama bağlantısı gönderildi.");
    this.name = "EmailConfirmationRequiredError";
    this.email = email;
  }
}

export const isEmailConfirmationRequiredError = (
  error: unknown,
): error is EmailConfirmationRequiredError => error instanceof EmailConfirmationRequiredError;


const normalize = (message: string) => message.toLowerCase();

export const mapSupabaseAuthError = (message: string, context: "login" | "register"): string => {
  const m = normalize(message);

  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already registered")
  ) {
    return "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.";
  }

  if (m.includes("email not confirmed")) {
    return "E-postanı doğrulaman gerekiyor. Gelen kutusu ve spam klasörünü kontrol et.";
  }

  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return context === "login"
      ? "E-posta veya şifre hatalı."
      : "Giriş bilgileri geçersiz.";
  }

  if (m.includes("password") && m.includes("least")) {
    return "Şifre en az 8 karakter olmalı.";
  }

  if (m.includes("email") && m.includes("invalid")) {
    return "Geçerli bir e-posta adresi gir.";
  }

  if (m.includes("signup is disabled") || m.includes("signups not allowed")) {
    return "Yeni kayıt şu an kapalı. Daha sonra tekrar dene.";
  }

  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Çok fazla deneme. Biraz bekleyip tekrar dene.";
  }

  if (m.includes("database error") || m.includes("db error")) {
    return "Sunucu hatası: veritabanı tetikleyicisi başarısız. Supabase SQL Editor'da migration 004 çalıştırıldığından emin ol.";
  }

  return message;
};

export type OAuthErrorCode = "cancelled" | "config" | "connection" | "unsupported" | "unknown";

export class OAuthError extends Error {
  readonly code: OAuthErrorCode;

  constructor(message: string, code: OAuthErrorCode) {
    super(message);
    this.name = "OAuthError";
    this.code = code;
  }
}

export const isOAuthError = (error: unknown): error is OAuthError =>
  error instanceof OAuthError;

export const oauthUserMessage = (
  error: unknown,
  provider: "google" | "apple" = "google",
): { title: string; message: string } => {
  const providerLabel = provider === "apple" ? "Apple girişi" : "Google girişi";

  if (isOAuthError(error)) {
    if (error.code === "cancelled") {
      return { title: providerLabel, message: "Giriş iptal edildi." };
    }
    if (error.code === "unsupported") {
      return { title: providerLabel, message: error.message };
    }
    return { title: providerLabel, message: error.message };
  }
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return { title: providerLabel, message: "Giriş iptal edildi." };
  }
  return {
    title: providerLabel,
    message: error instanceof Error ? error.message : "Giriş sırasında bir sorun oluştu.",
  };
};
