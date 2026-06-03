import * as QueryParams from "expo-auth-session/build/QueryParams";

export type DeepLinkAuthType = "recovery" | "signup" | null;

const OAUTH_CALLBACK_FRAGMENT = "auth/callback";

const parseHashParams = (url: string): Record<string, string> => {
  const hash = url.split("#")[1];
  if (!hash) {
    return {};
  }
  const params: Record<string, string> = {};
  for (const part of hash.split("&")) {
    const [key, value = ""] = part.split("=");
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
};

const parseUrlParams = (url: string): Record<string, string> => {
  const { params } = QueryParams.getQueryParams(url);
  return { ...parseHashParams(url), ...params };
};

const inferTypeFromPath = (url: string): DeepLinkAuthType => {
  const normalized = url.toLowerCase();
  if (
    normalized.includes("reset-password") ||
    normalized.includes("auth/reset") ||
    normalized.includes("type=recovery")
  ) {
    return "recovery";
  }
  if (
    normalized.includes("verify-success") ||
    normalized.includes("auth/verify") ||
    normalized.includes("type=signup")
  ) {
    return "signup";
  }
  return null;
};

/** OAuth Google callback — ayrı akışta işlenir. */
export const isOAuthCallbackUrl = (url: string | null | undefined): boolean => {
  if (!url) {
    return false;
  }
  if (!url.includes(OAUTH_CALLBACK_FRAGMENT)) {
    return false;
  }
  const type = inferTypeFromPath(url);
  return type !== "recovery" && type !== "signup";
};

/** Supabase e-posta doğrulama / şifre sıfırlama deep link'i. */
export const isAuthEmailDeepLink = (url: string | null | undefined): boolean => {
  if (!url || isOAuthCallbackUrl(url)) {
    return false;
  }

  const lower = url.toLowerCase();
  if (
    lower.includes("reset-password") ||
    lower.includes("verify-success") ||
    lower.includes("auth/reset") ||
    lower.includes("auth/verify")
  ) {
    return true;
  }

  if (lower.includes("type=recovery") || lower.includes("type=signup")) {
    return true;
  }

  const params = parseUrlParams(url);
  const type = params.type?.toLowerCase();
  return type === "recovery" || type === "signup";
};

export const parseAuthDeepLinkParams = (url: string): Record<string, string> => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    const description = params.error_description ?? params.error ?? errorCode;
    throw new Error(description);
  }
  return { ...parseHashParams(url), ...params };
};

export const resolveAuthDeepLinkType = (
  rawType: string | undefined,
  url: string,
): DeepLinkAuthType => {
  const normalized = rawType?.toLowerCase();
  if (normalized === "recovery") {
    return "recovery";
  }
  if (normalized === "signup" || normalized === "email_change" || normalized === "email") {
    return "signup";
  }
  return inferTypeFromPath(url);
};
