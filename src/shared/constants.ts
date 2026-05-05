import { Category, Star } from "./types";
import Constants from "expo-constants";

export const STORAGE_KEYS = {
  authToken: "astrocus.authToken",
  language: "astrocus.language",
  onboardingSeen: "astrocus.onboardingSeen",
  pendingSessions: "astrocus.pendingSessions",
  analyticsEvents: "astrocus.analyticsEvents",
} as const;

export const DEFAULT_DURATION_MINUTES = 25;
export const BACKGROUND_TOLERANCE_SECONDS = 20;
export const WARNING_THRESHOLD_SECONDS = 10;
export const PAUSE_LIMIT = 1;

export const CATEGORIES: Category[] = [
  { id: "work", key: "category.work", emoji: "💼" },
  { id: "reading", key: "category.reading", emoji: "📚" },
  { id: "project", key: "category.project", emoji: "🛠" },
  { id: "creativity", key: "category.creativity", emoji: "🎨" },
  { id: "sports", key: "category.sports", emoji: "🏃" },
  { id: "meditation", key: "category.meditation", emoji: "🧘" },
  { id: "coding", key: "category.coding", emoji: "💻" },
  { id: "general", key: "category.general", emoji: "✨" },
];

export const STARS: Star[] = [
  { id: "luna", name: "Luna", description: "Sessiz ve parlak bir başlangıç yıldızı.", requiredStardust: 0 },
  { id: "solis", name: "Solis", description: "İlk istikrarın sıcaklığı.", requiredStardust: 250 },
  { id: "nova", name: "Nova", description: "İlerlemenin görünür hale geldiği an.", requiredStardust: 600 },
  { id: "aurora", name: "Aurora", description: "Düzenli odakla açılan renkli yıldız.", requiredStardust: 1000 },
  { id: "zenith", name: "Zenith", description: "MVP yolculuğunun zirve yıldızı.", requiredStardust: 1500 },
];

export const AVATARS = ["🌙", "🪐", "☄️", "🌠", "✨"];

const runtimeApiUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  (Constants.manifest2?.extra?.expoClient?.extra?.apiUrl as string | undefined);

const getDevServerHost = () => {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | undefined)?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split("://").pop() ?? hostUri;
  const [hostname] = host.split(":");
  return hostname || null;
};

const resolveApiUrl = () => {
  if (runtimeApiUrl && !runtimeApiUrl.includes("localhost") && !runtimeApiUrl.includes("127.0.0.1")) {
    return runtimeApiUrl;
  }

  const host = getDevServerHost();
  if (host) {
    return `http://${host}:4000`;
  }

  return runtimeApiUrl ?? "http://localhost:4000";
};

export const API_URL = resolveApiUrl();
