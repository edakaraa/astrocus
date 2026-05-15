import type { ExpoConfig, ConfigContext } from "expo/config";

const resolveApiUrl = (isDev: boolean): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (isDev) {
    return "http://localhost:4000";
  }
  throw new Error("EXPO_PUBLIC_API_URL production ortamında tanımlanmalıdır.");
};

const requireEnv = (key: string, value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    console.warn(`[Astrocus] ${key} tanımlı değil.`);
    return "";
  }
  return trimmed;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = process.env.APP_ENV !== "production";
  const appEnv: "development" | "production" = isDev ? "development" : "production";

  return {
    ...config,
    android: {
      ...config.android,
      usesCleartextTraffic: isDev,
    },
    extra: {
      ...config.extra,
      apiUrl: resolveApiUrl(isDev),
      supabaseUrl: requireEnv("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: requireEnv(
        "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      ),
      appEnv,
    },
  };
};
