import type { ExpoConfig, ConfigContext } from "expo/config";
import fs from "node:fs";
import path from "node:path";
import { loadProjectEnv } from "@expo/env";
// Gradle/expo-constants Node CJS ile çalışır; .ts import edilemez.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolveBuildApiUrl } = require("./apiUrlResolver.cjs") as {
  resolveBuildApiUrl: (isDev: boolean, fromEnv?: string) => string;
};

const webClientIdToIosUrlScheme = (webClientId: string): string | null => {
  const trimmed = webClientId.trim();
  const suffix = ".apps.googleusercontent.com";
  if (!trimmed.endsWith(suffix)) {
    return null;
  }
  return `com.googleusercontent.apps.${trimmed.slice(0, -suffix.length)}`;
};

// app.config.ts değerlendirilirken .env bazen henüz yüklenmemiş olabilir.
const frontendRoot = path.resolve(__dirname);
const projectRoot = process.env.EXPO_PROJECT_ROOT ?? process.cwd();

loadProjectEnv(frontendRoot, { force: true, silent: true });
if (!process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) {
  loadProjectEnv(projectRoot, { force: true, silent: true });
}

// EAS CLI ilk config değerlendirmesinde EXPO_NO_DOTENV=1 kullanır; Dashboard env henüz yüklenmemiş olabilir.
// Bu yüzden eksik değerlerde throw etmiyoruz — ikinci geçişte EAS env enjekte edilir; runtime'da supabaseConfig kontrol eder.
const resolveEnv = (key: string, value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    console.warn(`[Astrocus] ${key} tanımlı değil.`);
    return "";
  }
  return trimmed;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Yalnızca APP_ENV=development açıkça development sayılır; EAS production'da varsayılan production.
  const isDev = process.env.APP_ENV === "development";
  const appEnv: "development" | "production" = isDev ? "development" : "production";

  const plugins = [...(config.plugins ?? [])];
  const hasNotificationsPlugin = plugins.some((entry) => {
    const name = typeof entry === "string" ? entry : entry[0];
    return name === "expo-notifications";
  });
  if (!hasNotificationsPlugin) {
    plugins.push("expo-notifications");
  }

  const googleWebClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ??
    process.env.GOOGLE_WEB_CLIENT_ID?.trim() ??
    "";
  const googleIosUrlScheme = webClientIdToIosUrlScheme(googleWebClientId);
  const hasGoogleSignInPlugin = plugins.some((entry) => {
    const name = typeof entry === "string" ? entry : entry[0];
    return name === "@react-native-google-signin/google-signin";
  });
  if (!hasGoogleSignInPlugin && googleIosUrlScheme) {
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: googleIosUrlScheme },
    ]);
  }

  const googleServicesFile = path.join(frontendRoot, "google-services.json");
  const hasGoogleServices = fs.existsSync(googleServicesFile);
  if (!hasGoogleServices && !isDev) {
    console.warn(
      "[Astrocus] frontend/google-services.json eksik — Android push (FCM) calismaz. docs/fcm-android-setup.md",
    );
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
      ...(hasGoogleServices ? { googleServicesFile: "./google-services.json" } : {}),
    },
    extra: {
      ...config.extra,
      eas: {
        projectId: "936918de-b53c-4d70-8d4c-110698d13797",
      },
      apiUrl: resolveBuildApiUrl(isDev, process.env.EXPO_PUBLIC_API_URL),
      supabaseUrl: resolveEnv("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: resolveEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
      googleWebClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ??
        process.env.GOOGLE_WEB_CLIENT_ID?.trim() ??
        (config.extra as { googleWebClientId?: string } | undefined)?.googleWebClientId ??
        "",
      googleAndroidClientId:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ??
        process.env.GOOGLE_ANDROID_CLIENT_ID?.trim() ??
        (config.extra as { googleAndroidClientId?: string } | undefined)?.googleAndroidClientId ??
        "",
      googleIosClientId:
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ??
        process.env.GOOGLE_IOS_CLIENT_ID?.trim() ??
        (config.extra as { googleIosClientId?: string } | undefined)?.googleIosClientId ??
        "",
      appEnv,
    },
  };
};
