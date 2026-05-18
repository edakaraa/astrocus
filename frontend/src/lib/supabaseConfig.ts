import Constants from "expo-constants";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = (Constants.expoConfig?.extra?.supabaseUrl as string | undefined)?.trim();
  const anonKey = (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined)?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

export const requireSupabaseConfig = (): SupabaseConfig => {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to frontend/.env, then restart Expo.",
    );
  }
  return config;
};
