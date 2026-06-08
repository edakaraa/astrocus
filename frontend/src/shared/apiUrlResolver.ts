export const PRODUCTION_API_URL = "https://astrocus.up.railway.app";

export const DEFAULT_API_PORT = 4000;

/** Yerel geliştirme backend'i (LAN / localhost / emülatör); release'te kullanılmamalı. */
export const isLocalDevApiUrl = (url: string): boolean => {
  const raw = url.trim();
  if (!raw) {
    return false;
  }

  try {
    const parsed = new URL(raw.includes("://") ? raw : `http://${raw}`);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "10.0.2.2") {
      return true;
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return true;
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return true;
    }
    return parsed.protocol === "http:";
  } catch {
    return /^https?:\/\//i.test(raw) ? raw.startsWith("http://") : true;
  }
};

/**
 * app.config.ts — bundle zamanında gömülecek API tabanı.
 * Production build'de .env'deki LAN/localhost URL'leri yok sayılır.
 */
export const resolveBuildApiUrl = (isDev: boolean, fromEnv?: string): string => {
  const trimmed = fromEnv?.trim();
  if (trimmed) {
    if (!isDev && isLocalDevApiUrl(trimmed)) {
      console.warn(
        "[Astrocus] EXPO_PUBLIC_API_URL yerel HTTP adresi; production build için kullanılıyor:",
        PRODUCTION_API_URL,
      );
      return PRODUCTION_API_URL;
    }
    return trimmed;
  }

  if (isDev) {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  console.warn(
    "[Astrocus] EXPO_PUBLIC_API_URL tanımlı değil; production varsayılanı kullanılıyor:",
    PRODUCTION_API_URL,
  );
  return PRODUCTION_API_URL;
};
