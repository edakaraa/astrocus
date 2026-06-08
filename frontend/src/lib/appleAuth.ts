import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { requireSupabaseConfig } from "./supabaseConfig";
import { OAuthError } from "./authErrors";
import { sanitizeAuthErrorMessage } from "./sanitizeAuthError";

export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") {
    return false;
  }
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
};

export const signInWithApple = async (): Promise<Session> => {
  if (Platform.OS !== "ios") {
    throw new OAuthError("Apple ile giriş yalnızca iOS cihazlarda kullanılabilir.", "unsupported");
  }

  try {
    requireSupabaseConfig();
  } catch (error) {
    throw new OAuthError(
      error instanceof Error ? error.message : "Supabase yapılandırması eksik.",
      "config",
    );
  }

  const available = await isAppleSignInAvailable();
  if (!available) {
    throw new OAuthError("Bu cihazda Apple ile giriş desteklenmiyor.", "unsupported");
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      const code = String((error as { code: string }).code);
      if (code === "ERR_REQUEST_CANCELED") {
        throw new OAuthError("Apple girişi iptal edildi.", "cancelled");
      }
    }
    throw new OAuthError("Apple ile bağlantı kurulamadı.", "connection");
  }

  const identityToken = credential.identityToken;
  if (!identityToken) {
    throw new OAuthError("Apple kimlik jetonu alınamadı.", "connection");
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
  });

  if (error || !data.session) {
    const detail = sanitizeAuthErrorMessage(error?.message ?? "");
    throw new OAuthError(detail || "Oturum oluşturulamadı.", "connection");
  }

  return data.session;
};
