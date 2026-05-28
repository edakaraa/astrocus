import Constants from "expo-constants";

const DEFAULT_API_PORT = 4000;

/** Metro'nun LAN IP'si (fiziksel cihazda 127.0.0.1 yerine kullanılır). */
export const getMetroLanHost = (): string | null => {
  const uri = Constants.expoConfig?.hostUri ?? Constants.linkingUri ?? "";
  const match = uri.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  return match?.[1] ?? null;
};

const metroLanHost = getMetroLanHost;

/** Expo tunnel (exp.direct) — OAuth redirect'te LAN ile değiştirme. */
export const isExpoTunnelHost = (): boolean => {
  const uri = Constants.expoConfig?.hostUri ?? Constants.linkingUri ?? "";
  return /exp\.direct|exp\.host|\.ngrok/i.test(uri);
};

/**
 * Express API tabanı.
 * - https://… (ngrok) → olduğu gibi (tunnel + API birlikte çalışır)
 * - LAN Metro varken → hostname Metro IP ile hizalanır
 * - Sadece Expo tunnel, LAN yok → .env’deki LAN IP telefona ulaşmaz; ngrok URL kullan
 */
export const getApiUrl = (): string => {
  const configured = (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.trim() ?? "";
  if (!configured) {
    return `http://127.0.0.1:${DEFAULT_API_PORT}`;
  }

  if (/^https:\/\//i.test(configured)) {
    return configured.replace(/\/$/, "");
  }

  let url = configured;
  if (__DEV__) {
    const lan = metroLanHost();
    if (lan) {
      try {
        const parsed = new URL(url.includes("://") ? url : `http://${url}`);
        parsed.hostname = lan;
        url = parsed.toString();
      } catch {
        url = `http://${lan}:${DEFAULT_API_PORT}`;
      }
    }
  }

  return url.replace(/\/$/, "");
};
