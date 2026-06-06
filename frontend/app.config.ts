import type { ExpoConfig, ConfigContext } from "expo/config";
import path from "node:path";
import { loadProjectEnv } from "@expo/env";

// app.config.ts değerlendirilirken .env bazen henüz yüklenmemiş olabilir.
const frontendRoot = path.resolve(__dirname);
const projectRoot = process.env.EXPO_PROJECT_ROOT ?? process.cwd();

loadProjectEnv(frontendRoot, { force: true, silent: true });
if (!process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) {
  loadProjectEnv(projectRoot, { force: true, silent: true });
}

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

const requireEnv = (key: string, value: string | undefined, isDev: boolean): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    if (!isDev) {
      throw new Error(`[Astrocus] ${key} production ortamında zorunludur.`);
    }
    console.warn(`[Astrocus] ${key} tanımlı değil.`);
    return "";
  }
  return trimmed;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDev = process.env.APP_ENV !== "production";
  const appEnv: "development" | "production" = isDev ? "development" : "production";

  const plugins = (config.plugins ?? []).filter((entry) => {
    const name = typeof entry === "string" ? entry : entry[0];
    return name !== "expo-notifications";
  });
  if (!isDev) {
    plugins.push("expo-notifications");
  }

  return {
    ...config,
    scheme: config.scheme ?? "astrocus",
    // Expo Go "remote update" çoğu zaman Metro bundle indirme hatasıdır; OTA kapalı tut.
    updates: {
      enabled: false,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "NEVER",
    },
    plugins,
    android: {
      ...config.android,
      usesCleartextTraffic: isDev,
    },
    extra: {
      ...config.extra,
      eas: {
        projectId: "936918de-b53c-4d70-8d4c-110698d13797",
      },
      apiUrl: resolveApiUrl(isDev),
      supabaseUrl: requireEnv("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL, isDev),
      supabaseAnonKey: requireEnv(
        "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        isDev,
      ),
      appEnv,
    },
  };
};
