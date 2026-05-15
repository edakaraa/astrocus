import "expo/config";

declare module "expo/config" {
  interface ExpoConfig {
    extra?: {
      apiUrl?: string;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      appEnv?: "development" | "production";
    };
  }
}
