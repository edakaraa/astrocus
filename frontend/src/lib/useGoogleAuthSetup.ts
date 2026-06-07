import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import type { AuthSessionResult } from "expo-auth-session";

type PromptGoogleSignIn = () => Promise<AuthSessionResult>;

let promptGoogleSignIn: PromptGoogleSignIn | null = null;

export const registerGooglePrompt = (prompt: PromptGoogleSignIn | null): void => {
  promptGoogleSignIn = prompt;
};

export const promptGoogleAuth = (): Promise<AuthSessionResult> => {
  if (!promptGoogleSignIn) {
    throw new Error("google_auth_not_ready");
  }
  return promptGoogleSignIn();
};

export const getGoogleClientIds = (): {
  webClientId: string;
  androidClientId: string;
  iosClientId: string;
} => {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return {
    webClientId: extra?.googleWebClientId?.trim() ?? "",
    androidClientId: extra?.googleAndroidClientId?.trim() ?? "",
    iosClientId: extra?.googleIosClientId?.trim() ?? "",
  };
};

/**
 * Google.useIdTokenAuthRequest hook'u — AuthProvider içinde bir kez mount edilmeli.
 * signInWithGoogle(), kayıtlı promptAsync üzerinden doğrudan Google'a gider.
 */
export const useGoogleAuthSetup = (): void => {
  const { webClientId, androidClientId, iosClientId } = getGoogleClientIds();

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webClientId || undefined,
    androidClientId: androidClientId || undefined,
    iosClientId: iosClientId || undefined,
  });

  useEffect(() => {
    if (!request) {
      registerGooglePrompt(null);
      return;
    }

    registerGooglePrompt(() =>
      promptAsync({
        showInRecents: false,
        ...(Platform.OS === "android" ? { createTask: false } : {}),
      }),
    );

    return () => registerGooglePrompt(null);
  }, [request, promptAsync]);
};
