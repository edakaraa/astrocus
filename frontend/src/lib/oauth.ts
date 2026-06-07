import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { requireSupabaseConfig } from "./supabaseConfig";
import { OAuthError } from "./authErrors";
import { getMetroLanHost, isExpoTunnelHost } from "../shared/config";
import { getGoogleClientIds, promptGoogleAuth } from "./useGoogleAuthSetup";

const SCHEME = "astrocus";
const CALLBACK_PATH = "auth/callback";

const isExpoGo = () => Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const replaceLoopbackWithLan = (uri: string): string => {
  if (isExpoTunnelHost()) {
    return uri;
  }
  const lan = getMetroLanHost();
  if (!lan) {
    return uri;
  }
  return uri.replace(/\b127\.0\.0\.1\b/g, lan).replace(/\blocalhost\b/gi, lan);
};

/** Expo Go: Metro'nun o an kullandığı exp:// tabanını kullan (tunnel/LAN ile uyumlu). */
const getExpoGoRedirectUri = (): string => {
  const linkingUri = Constants.linkingUri?.trim();
  if (linkingUri?.startsWith("exp://")) {
    const base = linkingUri.replace(/\/--\/.*$/, "").replace(/\/$/, "");
    return replaceLoopbackWithLan(`${base}/--/${CALLBACK_PATH}`);
  }
  return replaceLoopbackWithLan(makeRedirectUri({ path: CALLBACK_PATH }));
};

export const getOAuthRedirectUri = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI?.trim();
  if (fromEnv?.includes("://")) {
    return replaceLoopbackWithLan(fromEnv);
  }

  if (isExpoGo()) {
    return getExpoGoRedirectUri();
  }

  return makeRedirectUri({
    scheme: SCHEME,
    path: CALLBACK_PATH,
  });
};

const requireGoogleClientConfig = (): void => {
  const { webClientId, androidClientId, iosClientId } = getGoogleClientIds();

  if (isExpoGo()) {
    if (!webClientId) {
      throw new OAuthError(
        "Google webClientId tanımlı değil. extra.googleWebClientId veya EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ayarlayın.",
        "config",
      );
    }
    return;
  }

  if (Platform.OS === "android" && !androidClientId) {
    throw new OAuthError(
      "Google androidClientId tanımlı değil. extra.googleAndroidClientId veya GOOGLE_ANDROID_CLIENT_ID ayarlayın.",
      "config",
    );
  }

  if (Platform.OS === "ios" && !iosClientId) {
    throw new OAuthError(
      "Google iosClientId tanımlı değil. extra.googleIosClientId veya GOOGLE_IOS_CLIENT_ID ayarlayın.",
      "config",
    );
  }

  if (!webClientId) {
    throw new OAuthError(
      "Google webClientId tanımlı değil. extra.googleWebClientId veya EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ayarlayın.",
      "config",
    );
  }
};

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

/** E-posta doğrulama / eski deep-link callback yedek tamamlayıcı. */
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

  throw new OAuthError(
    `OAuth oturumu tamamlanamadi. Supabase Redirect URLs listesine ekle: ${getOAuthRedirectUri()}`,
    "config",
  );
};

const extractGoogleIdToken = (result: {
  params?: Record<string, string>;
  authentication?: { idToken?: string | null } | null;
}): string | null => {
  const fromParams = result.params?.id_token?.trim();
  if (fromParams) {
    return fromParams;
  }
  const fromAuth = result.authentication?.idToken?.trim();
  return fromAuth || null;
};

/** Doğrudan Google OAuth → id_token → Supabase signInWithIdToken (Supabase proxy yok). */
export const signInWithGoogle = async (): Promise<Session> => {
  try {
    requireSupabaseConfig();
    requireGoogleClientConfig();
  } catch (error) {
    if (error instanceof OAuthError) {
      throw error;
    }
    throw new OAuthError(
      error instanceof Error ? error.message : "Supabase yapilandirmasi eksik.",
      "config",
    );
  }

  if (__DEV__) {
    console.info("[Astrocus OAuth] Direct Google id_token flow (expo-auth-session)");
  }

  try {
    await WebBrowser.warmUpAsync();
  } catch {
    /* Android — opsiyonel */
  }

  let result;
  try {
    result = await promptGoogleAuth();
  } catch (error) {
    if (error instanceof Error && error.message === "google_auth_not_ready") {
      throw new OAuthError("Google girisi henuz hazir degil. Uygulamayi yeniden baslatin.", "config");
    }
    throw new OAuthError("Google ile baglanti kurulamadi.", "connection");
  } finally {
    try {
      await WebBrowser.coolDownAsync();
    } catch {
      /* ignore */
    }
  }

  if (__DEV__) {
    console.info("[Astrocus OAuth] Google prompt result.type =", result.type);
  }

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new OAuthError("Google girisi iptal edildi.", "cancelled");
  }

  if (result.type !== "success") {
    throw new OAuthError("Google oturumu tamamlanamadi.", "connection");
  }

  const idToken = extractGoogleIdToken(result);
  if (!idToken) {
    throw new OAuthError("Google kimlik belirteci alinamadi.", "connection");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error || !data.session) {
    throw new OAuthError(error?.message ?? "Oturum olusturulamadi.", "connection");
  }

  return data.session;
};
