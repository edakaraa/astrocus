import Constants from "expo-constants";

export type GoogleClientIds = {
  webClientId: string;
  androidClientId: string;
  iosClientId: string;
};

export const getGoogleClientIds = (): GoogleClientIds => {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return {
    webClientId: extra?.googleWebClientId?.trim() ?? "",
    androidClientId: extra?.googleAndroidClientId?.trim() ?? "",
    iosClientId: extra?.googleIosClientId?.trim() ?? "",
  };
};

/** iOS config plugin için: Web client ID → reversed URL scheme. */
export const webClientIdToIosUrlScheme = (webClientId: string): string | null => {
  const trimmed = webClientId.trim();
  const suffix = ".apps.googleusercontent.com";
  if (!trimmed.endsWith(suffix)) {
    return null;
  }
  const idPart = trimmed.slice(0, -suffix.length);
  return `com.googleusercontent.apps.${idPart}`;
};
