import "expo/config";

declare module "expo/config" {
  interface ExpoConfig {
    extra?: {
      apiUrl?: string;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      appEnv?: "development" | "production";
      googleWebClientId?: string;
      googleAndroidClientId?: string;
      googleIosClientId?: string;
      eas?: { projectId?: string };
    };
  }
}
