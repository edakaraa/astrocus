import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

if (!url || !serviceKey) {
  console.warn("[Astrocus API] SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.");
}

export const supabaseAdmin = createClient(url ?? "", serviceKey ?? "", {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const createSupabaseUserClient = (accessToken: string) =>
  createClient(url ?? "", anonKey ?? "", {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
