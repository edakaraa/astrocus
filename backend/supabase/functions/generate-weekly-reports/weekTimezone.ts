/** Monday-first week boundaries in a user's IANA timezone (matches analytics API). */

const MONDAY_FIRST_WEEKDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MAX_BACKFILL_WEEKS = 12;

export const toDateKeyInTimeZone = (instant: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};

export const dateKeyToInstant = (dateKey: string): Date => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
};

export const addCalendarDays = (dateKey: string, days: number, timeZone: string): string => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const instant = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return toDateKeyInTimeZone(new Date(instant.getTime() + days * MS_PER_DAY), timeZone);
};

/** Most recent fully completed Mon–Sun week (Monday date key in `timeZone`). */
export const getLastCompletedWeekMondayKey = (timeZone: string, anchor = new Date()): string => {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(anchor);
  const mondayOffset = MONDAY_FIRST_WEEKDAY[weekday] ?? 0;
  const todayKey = toDateKeyInTimeZone(anchor, timeZone);
  const currentMondayKey = addCalendarDays(todayKey, -mondayOffset, timeZone);
  return addCalendarDays(currentMondayKey, -7, timeZone);
};

export const getWeekDateKeys = (mondayKey: string, timeZone: string): string[] =>
  Array.from({ length: 7 }, (_, i) => addCalendarDays(mondayKey, i, timeZone));

export const getWeekMondayKeyForLocalDate = (localDateKey: string, timeZone: string): string => {
  const [y, m, d] = localDateKey.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const daysFromMonday = (dow + 6) % 7;
  return addCalendarDays(localDateKey, -daysFromMonday, timeZone);
};

export const getWeeksToProcessForUser = (
  timeZone: string,
  refDate: Date,
  explicitWeekStart: string | null,
  backfill: boolean,
): string[] => {
  if (explicitWeekStart) {
    return [explicitWeekStart];
  }

  const latest = getLastCompletedWeekMondayKey(timeZone, refDate);
  if (!backfill) {
    return [latest];
  }

  const weeks: string[] = [];
  for (let i = MAX_BACKFILL_WEEKS - 1; i >= 0; i -= 1) {
    weeks.push(addCalendarDays(latest, -i * 7, timeZone));
  }
  return weeks;
};

export const formatWeekLabel = (
  mondayKey: string,
  sundayKey: string,
  locale: "tr-TR" | "en-US",
): string => {
  const monday = dateKeyToInstant(mondayKey);
  const sunday = dateKeyToInstant(sundayKey);
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" });
  const fmtShort = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const startStr = locale === "en-US" ? fmtShort.format(monday) : fmt.format(monday);
  const endStr = fmt.format(sunday);
  return `${startStr} - ${endStr}`;
};

export const civilWeekdayIndex = (dateKey: string): number => {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const weekdayIndexInTimeZone = (dateKey: string, _timeZone: string): number =>
  civilWeekdayIndex(dateKey);
