import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { STORAGE_KEYS } from "../shared/constants";
import { requireSupabaseConfig } from "./supabaseConfig";
import { OAuthError } from "./authErrors";
import { getMetroLanHost, isExpoTunnelHost } from "../shared/config";
import {
  clearOAuthReturnUrl,
  isOAuthReturnUrl,
  peekOAuthReturnUrl,
  stashOAuthReturnUrl,
} from "./oauthLinking";

WebBrowser.maybeCompleteAuthSession();

const SCHEME = "astrocus";
const CALLBACK_PATH = "auth/callback";
/** Dismiss sonrasi deep link bekleme penceresi (ms). */
const OAUTH_WAIT_MS = 15_000;

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
    native: `${SCHEME}://${CALLBACK_PATH}`,
  });
};

const metroReachabilityHint = (): string => {
  if (isExpoTunnelHost()) {
    return "Metro tüneli: npx expo start --tunnel -c ile başlat; Expo Go'yu kapatıp QR ile yeniden bağlan.";
  }
  return "Aynı Wi-Fi + npx expo start --lan -c; Windows'ta Node.js için özel ağ ve 8081 portu açık olsun. Gerekirse --tunnel dene.";
};

/**
 * Android Expo Go: tarayici kapaninca uygulama exp:// deep link ile geri donebilir.
 * WebBrowser "dismiss" donse bile Linking ile gelen URL'yi yakala.
 */
const waitForOAuthReturnUrl = (): { promise: Promise<string>; cancel: () => void } => {
  let settled = false;
  let subscription: { remove: () => void } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stashPoll: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (stashPoll) {
      clearInterval(stashPoll);
      stashPoll = null;
    }
    subscription?.remove();
    subscription = null;
  };

  const cancel = () => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
  };

  const promise = new Promise<string>((resolve, reject) => {
    const finish = (url: string | null | undefined) => {
      if (settled || !isOAuthReturnUrl(url)) {
        return;
      }
      settled = true;
      cleanup();
      resolve(url!);
    };

    subscription = Linking.addEventListener("url", (event) => {
      void stashOAuthReturnUrl(event.url);
      finish(event.url);
    });

    stashPoll = setInterval(() => {
      void peekOAuthReturnUrl().then((url) => finish(url));
    }, 350);

    timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(
        new OAuthError(
          `Google oturumu tamamlanamadi (Metro baglantisi veya redirect). ${metroReachabilityHint()}`,
          "connection",
        ),
      );
    }, OAUTH_WAIT_MS);

    void Linking.getInitialURL().then((url) => {
      if (url) {
        void stashOAuthReturnUrl(url);
      }
      finish(url);
    });
  });

  return { promise, cancel };
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
    `Google oturumu tamamlanamadi. Supabase Redirect URLs listesine ekle: ${getOAuthRedirectUri()}`,
    "config",
  );
};

export const signInWithGoogle = async (): Promise<Session> => {
  try {
    requireSupabaseConfig();
  } catch (error) {
    throw new OAuthError(
      error instanceof Error ? error.message : "Supabase yapilandirmasi eksik.",
      "config",
    );
  }

  const redirectTo = getOAuthRedirectUri();
  if (__DEV__) {
    console.info("[Astrocus OAuth] redirectTo =", redirectTo);
    if (isExpoGo() && Platform.OS === "android" && !isExpoTunnelHost()) {
      console.info(
        "[Astrocus OAuth] Android Expo Go: ayni Wi-Fi + npx expo start --lan -c. Redirect bu adresin Supabase'e ekli olmasi lazim:",
        redirectTo,
      );
    }
    if (/127\.0\.0\.1|localhost/i.test(redirectTo) && getMetroLanHost()) {
      console.warn(
        "[Astrocus OAuth] redirect loopback iceriyor. .env ile LAN IP kullanin:",
        `EXPO_PUBLIC_OAUTH_REDIRECT_URI=${redirectTo.replace(/127\.0\.0\.1|localhost/gi, getMetroLanHost()!)}`,
      );
    }
  }

  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (oauthError) {
    throw new OAuthError(oauthError.message, "connection");
  }

  const authUrl = data?.url?.trim();
  if (!authUrl?.startsWith("http")) {
    throw new OAuthError("Supabase OAuth URL gecersiz.", "config");
  }

  const linkingWait = waitForOAuthReturnUrl();
  await clearOAuthReturnUrl();
  await AsyncStorage.setItem(STORAGE_KEYS.oauthPending, redirectTo);

  try {
    await WebBrowser.warmUpAsync();
  } catch {
    /* Android -- opsiyonel */
  }

  let result: WebBrowser.WebBrowserAuthSessionResult;
  try {
    result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo, {
      // createTask: false → Chrome, Expo Go ile ayni Android gorevinde acilir.
      // Yeni gorev olusursa exp:// deep link Expo Go'yu cold-start eder → "1 module" / remote update hatasi.
      createTask: false,
      showInRecents: false,
    });
  } catch {
    linkingWait.cancel();
    throw new OAuthError("Google ile baglanti kurulamadi.", "connection");
  } finally {
    try {
      await WebBrowser.coolDownAsync();
    } catch {
      /* ignore */
    }
  }

  if (__DEV__) {
    console.info("[Astrocus OAuth] WebBrowser result.type =", result.type);
  }

  if (result.type === "success" && result.url) {
    linkingWait.cancel();
    await stashOAuthReturnUrl(result.url);
    await AsyncStorage.removeItem(STORAGE_KEYS.oauthPending);
    return completeOAuthFromUrl(result.url);
  }

  if (result.type === "cancel") {
    linkingWait.cancel();
    await AsyncStorage.removeItem(STORAGE_KEYS.oauthPending);
    throw new OAuthError("Google girisi iptal edildi.", "cancelled");
  }

  // dismiss / unknown: Android Expo Go, OAuth sonrasinda exp:// deep link ile geri gelir.
  // 15 saniye icinde Linking URL gelmezse buyuk ihtimalle Supabase redirect eksik veya Metro ulasilamaz.
  try {
    const url = await linkingWait.promise;
    await AsyncStorage.removeItem(STORAGE_KEYS.oauthPending);
    return completeOAuthFromUrl(url);
  } catch (error) {
    const stashed = await peekOAuthReturnUrl();
    if (stashed) {
      await AsyncStorage.removeItem(STORAGE_KEYS.oauthPending);
      return completeOAuthFromUrl(stashed);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.oauthPending);
    if (error instanceof OAuthError) {
      throw error;
    }
    throw new OAuthError(
      `Google oturumu gelmedi. Supabase > Redirect URLs: ${redirectTo}. ${metroReachabilityHint()}`,
      "config",
    );
  }
};
