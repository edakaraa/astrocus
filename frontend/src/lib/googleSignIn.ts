import { isRunningInExpoGo } from "expo";
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { requireSupabaseConfig } from "./supabaseConfig";
import { OAuthError } from "./authErrors";
import { getGoogleClientIds } from "./googleClientConfig";
import { sanitizeAuthErrorMessage } from "./sanitizeAuthError";

let configured = false;

const ensureGoogleSignInConfigured = (): void => {
  const { webClientId, iosClientId } = getGoogleClientIds();

  if (!webClientId) {
    throw new OAuthError(
      "Google webClientId tanımlı değil. EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ayarlayın (EAS secret).",
      "config",
    );
  }

  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: Platform.OS === "ios" && iosClientId ? iosClientId : undefined,
    offlineAccess: false,
  });
  configured = true;
};

const mapGoogleSignInError = (error: unknown): OAuthError => {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return new OAuthError("Google girişi iptal edildi.", "cancelled");
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return new OAuthError("Google Play Services güncel değil veya yüklü değil.", "connection");
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return new OAuthError("Google girişi zaten devam ediyor.", "connection");
    }
    if (error.code === "10" || error.message.includes("DEVELOPER_ERROR")) {
      return new OAuthError(
        "Google yapılandırma hatası (DEVELOPER_ERROR). Google Console Android client: package com.astrocus.app + doğru SHA-1 (yerel debug veya EAS). prodocs/tech-stack.md (Google OAuth)",
        "config",
      );
    }
    return new OAuthError(error.message || "Google ile bağlantı kurulamadı.", "connection");
  }
  return new OAuthError(
    error instanceof Error ? error.message : "Google ile bağlantı kurulamadı.",
    "connection",
  );
};

/**
 * Native Google Sign-In → id_token → Supabase.
 * Redirect URI / tarayıcı / IP yok; preview ve production build'de çalışır. Expo Go desteklenmez.
 */
export const signInWithGoogleNative = async (): Promise<Session> => {
  if (isRunningInExpoGo()) {
    throw new OAuthError(
      "Google ile giriş Expo Go'da desteklenmiyor. Preview veya production build kullanın (eas build).",
      "unsupported",
    );
  }

  try {
    requireSupabaseConfig();
    ensureGoogleSignInConfigured();
  } catch (error) {
    if (error instanceof OAuthError) {
      throw error;
    }
    throw new OAuthError(
      error instanceof Error ? error.message : "Supabase yapılandırması eksik.",
      "config",
    );
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch (error) {
    throw mapGoogleSignInError(error);
  }

  let idToken: string | null = null;

  try {
    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      throw new OAuthError("Google girişi iptal edildi.", "cancelled");
    }

    if (isSuccessResponse(response)) {
      idToken = response.data.idToken;
    }

    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }
  } catch (error) {
    if (error instanceof OAuthError) {
      throw error;
    }
    throw mapGoogleSignInError(error);
  }

  if (!idToken) {
    throw new OAuthError("Google kimlik jetonu alınamadı.", "connection");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });

  if (error || !data.session) {
    const detail = sanitizeAuthErrorMessage(error?.message ?? "");
    throw new OAuthError(detail || "Oturum oluşturulamadı.", "connection");
  }

  return data.session;
};

/** Uygulama çıkışında Google'ın önbelleğe aldığı hesabı temizler; sonraki girişte hesap seçici açılır. */
export const signOutFromGoogle = async (): Promise<void> => {
  if (isRunningInExpoGo()) {
    return;
  }

  const { webClientId, iosClientId } = getGoogleClientIds();
  if (!webClientId) {
    return;
  }

  if (!configured) {
    GoogleSignin.configure({
      webClientId,
      iosClientId: Platform.OS === "ios" && iosClientId ? iosClientId : undefined,
      offlineAccess: false,
    });
    configured = true;
  }

  try {
    await GoogleSignin.signOut();
  } catch {
    /* E-posta ile giriş yapmış kullanıcıda veya zaten çıkış yapılmışsa sorun değil */
  }
};
