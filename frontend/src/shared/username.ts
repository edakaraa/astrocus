export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
/** Latin + Turkish letters, digits, underscore; case-sensitive. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$/;

/** Trim only — usernames are case-sensitive (Ali ≠ ali). */
export const normalizeUsername = (raw: string): string => raw.trim();

export type UsernameValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: "empty" | "invalid" | "tooShort" | "tooLong" };

export const validateUsername = (raw: string): UsernameValidationResult => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return { ok: false, reason: "invalid" };
  }
  const normalized = normalizeUsername(trimmed);
  if (normalized.length < USERNAME_MIN_LENGTH) {
    return { ok: false, reason: "tooShort" };
  }
  if (normalized.length > USERNAME_MAX_LENGTH) {
    return { ok: false, reason: "tooLong" };
  }
  return { ok: true, normalized };
};

export const isUsernameTakenError = (message: string): boolean => {
  const m = message.toLowerCase();
  return (
    m.includes("profiles_username_unique") ||
    m.includes("profiles_username_lower_unique") ||
    m.includes("duplicate key") ||
    m.includes("username") && m.includes("unique")
  );
};
