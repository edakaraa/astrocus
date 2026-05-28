import { t } from "../shared/i18n";
import type { Language } from "../shared/types";

/** Kayıt sonrası oturum yok — e-posta doğrulaması bekleniyor (hata değil). */
export class EmailConfirmationRequiredError extends Error {
  readonly email: string;

  constructor(email: string, language: Language) {
    super(t(language, "emailConfirmationSent"));
    this.name = "EmailConfirmationRequiredError";
    this.email = email;
  }
}

export const isEmailConfirmationRequiredError = (
  error: unknown,
): error is EmailConfirmationRequiredError => error instanceof EmailConfirmationRequiredError;

const normalize = (message: string) => message.toLowerCase();

export const mapSupabaseAuthError = (
  message: string,
  context: "login" | "register",
  language: Language,
): string => {
  const m = normalize(message);

  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already registered")
  ) {
    return t(language, "emailInUse");
  }

  if (m.includes("email not confirmed")) {
    return t(language, "emailNotConfirmed");
  }

  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return context === "login" ? t(language, "invalidCredentials") : t(language, "loginError");
  }

  if (m.includes("password") && m.includes("least")) {
    return t(language, "weakPassword");
  }

  if (m.includes("email") && m.includes("invalid")) {
    return t(language, "invalidEmail");
  }

  if (m.includes("signup is disabled") || m.includes("signups not allowed")) {
    return t(language, "signupDisabled");
  }

  if (m.includes("rate limit") || m.includes("too many requests")) {
    return t(language, "rateLimited");
  }

  if (m.includes("database error") || m.includes("db error")) {
    return t(language, "databaseError");
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
  language: Language,
  provider: "google" | "apple" = "google",
): { title: string; message: string } => {
  const title = provider === "apple" ? t(language, "oauthAppleTitle") : t(language, "oauthGoogleTitle");

  if (isOAuthError(error)) {
    if (error.code === "cancelled") {
      return { title, message: t(language, "oauthCancelled") };
    }
    if (error.code === "unsupported") {
      return { title, message: error.message };
    }
    return { title, message: error.message };
  }
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return { title, message: t(language, "oauthCancelled") };
  }
  return {
    title,
    message: error instanceof Error ? error.message : t(language, "oauthFailed"),
  };
};
