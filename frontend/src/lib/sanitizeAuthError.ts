const SUPABASE_HOST_PATTERN = /[a-z0-9-]+\.supabase\.co/gi;
const SUPABASE_URL_PATTERN = /https?:\/\/[a-z0-9-]+\.supabase\.co[^\s)"'<>]*/gi;

/** Kullanıcıya gösterilen auth hatalarından Supabase URL / proje ref izlerini temizler. */
export const sanitizeAuthErrorMessage = (message: string): string => {
  const cleaned = message
    .replace(SUPABASE_URL_PATTERN, "")
    .replace(SUPABASE_HOST_PATTERN, "Astrocus")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned || /supabase/i.test(message)) {
    return "";
  }

  return cleaned;
};
