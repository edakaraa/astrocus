import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabaseConfig";

const config = getSupabaseConfig();

if (!config) {
  console.warn(
    "[Astrocus] EXPO_PUBLIC_SUPABASE_URL veya EXPO_PUBLIC_SUPABASE_ANON_KEY eksik. Supabase özellikleri devre dışı kalır.",
  );
}

export const supabase = createClient(config?.url ?? "https://placeholder.invalid", config?.anonKey ?? "placeholder", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
