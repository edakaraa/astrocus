import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? config.extra?.apiUrl ?? "http://localhost:4000";

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
    },
  };
};

