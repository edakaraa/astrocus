import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { isAuthEmailDeepLink, isOAuthCallbackUrl } from "./authDeepLink";

export const isOAuthReturnUrl = (url: string | null | undefined): boolean => {
  if (!url || isAuthEmailDeepLink(url)) {
    return false;
  }
  if (isOAuthCallbackUrl(url)) {
    return true;
  }
  return url.includes("code=") || url.includes("access_token=");
};

/** OAuth dönüş URL'si — Expo Go cold start / Metro reload sonrası tamamlamak için. */
export const stashOAuthReturnUrl = async (url: string): Promise<void> => {
  if (!isOAuthReturnUrl(url)) {
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.oauthReturnUrl, url);
  if (__DEV__) {
    console.info("[Astrocus OAuth] stashed return url =", url.slice(0, 160));
  }
};

export const peekOAuthReturnUrl = async (): Promise<string | null> => {
  const url = await AsyncStorage.getItem(STORAGE_KEYS.oauthReturnUrl);
  return isOAuthReturnUrl(url) ? url : null;
};

export const consumeOAuthReturnUrl = async (): Promise<string | null> => {
  const url = await peekOAuthReturnUrl();
  if (url) {
    await AsyncStorage.removeItem(STORAGE_KEYS.oauthReturnUrl);
  }
  return url;
};

export const clearOAuthReturnUrl = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.oauthReturnUrl);
};

/** Uygulama açılır açılmaz deep link yakala (reload öncesi). */
export const installOAuthUrlCapture = (): void => {
  Linking.addEventListener("url", (event) => {
    void stashOAuthReturnUrl(event.url);
  });
  void Linking.getInitialURL().then((url) => {
    if (url) {
      void stashOAuthReturnUrl(url);
    }
  });
};

installOAuthUrlCapture();
