const PRODUCTION_API_URL = "https://astrocus.up.railway.app";
const DEFAULT_API_PORT = 4000;

/** @param {string} url */
const isLocalDevApiUrl = (url) => {
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

/** @param {boolean} isDev @param {string | undefined} fromEnv */
const resolveBuildApiUrl = (isDev, fromEnv) => {
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

module.exports = {
  PRODUCTION_API_URL,
  DEFAULT_API_PORT,
  isLocalDevApiUrl,
  resolveBuildApiUrl,
};
