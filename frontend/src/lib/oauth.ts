import * as QueryParams from "expo-auth-session/build/QueryParams";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { OAuthError } from "./authErrors";
import { getOAuthRedirectUri } from "./oauthRedirectUri";
import { signInWithGoogleNative } from "./googleSignIn";

export { getOAuthRedirectUri } from "./oauthRedirectUri";

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

const parseRedirectParams = (url: string): Record<string, string> => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    const description = params.error_description ?? params.error ?? errorCode;
    throw new OAuthError(description, "connection");
  }
  return { ...parseHashParams(url), ...params };
};

/** E-posta doğrulama deep-link callback tamamlayıcı. */
export const completeOAuthFromUrl = async (url: string): Promise<Session> => {
  if (__DEV__) {
    console.info("[Astrocus OAuth] completeOAuthFromUrl =", url.slice(0, 160));
  }
  const merged = parseRedirectParams(url);
  const authCode = merged.code;
  const accessToken = merged.access_token;
  const refreshToken = merged.refresh_token;

  if (authCode) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error || !data.session) {
      throw new OAuthError(error?.message ?? "Oturum olusturulamadi.", "connection");
    }
    return data.session;
  }

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error || !data.session) {
      throw new OAuthError(error?.message ?? "Oturum olusturulamadi.", "connection");
    }
    return data.session;
  }

  if (__DEV__) {
    console.warn("[Astrocus OAuth] Redirect URL Supabase allow list:", getOAuthRedirectUri());
  }
  throw new OAuthError("OAuth oturumu tamamlanamadı. Lütfen tekrar deneyin.", "config");
};

/** Native Google Sign-In (production). Redirect / tarayıcı yok. */
export const signInWithGoogle = (): Promise<Session> => signInWithGoogleNative();
