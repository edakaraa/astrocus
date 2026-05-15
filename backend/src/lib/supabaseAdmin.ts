import { ENV_FILE_PATH } from "../loadEnv";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_ANON_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[Astrocus API] ${name} eksik. ${ENV_FILE_PATH} dosyasını doldurup kaydettiğinizden emin olun.`,
    );
  }
  return value;
}

const url = requireEnv("SUPABASE_URL");
const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const anonKey = requireEnv("SUPABASE_ANON_KEY");

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const createSupabaseUserClient = (accessToken: string) =>
  createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
