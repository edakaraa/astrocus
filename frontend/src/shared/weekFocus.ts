import type { SessionRecord } from "./types";

const MONDAY_FIRST_WEEKDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const getDeviceTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const toDateKeyInTimeZone = (iso: string, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};

/** Monday → Sunday date keys for the current calendar week in the given timezone. */
export const buildMondayWeekDateKeys = (timeZone: string, anchor = new Date()): string[] => {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(anchor);
  const mondayOffset = MONDAY_FIRST_WEEKDAY[weekday] ?? 0;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() - mondayOffset + index);
    return toDateKeyInTimeZone(date.toISOString(), timeZone);
  });
};

const sumMinutesForDay = (sessions: SessionRecord[], dateKey: string, timeZone: string): number =>
  sessions
    .filter((session) => toDateKeyInTimeZone(session.completedAt, timeZone) === dateKey)
    .reduce((sum, session) => sum + session.durationMinutes, 0);

/**
 * Seven values (Mon–Sun) for the current week. Prefers server analytics when length is 7
 * (backend uses the same Monday-first week keys).
 */
export const getMondayWeekFocusMinutes = (
  sessions: SessionRecord[],
  analyticsWeek?: number[],
  timeZone = getDeviceTimeZone(),
): number[] => {
  if (analyticsWeek?.length === 7) {
    return analyticsWeek;
  }

  const weekKeys = buildMondayWeekDateKeys(timeZone);
  return weekKeys.map((key) => sumMinutesForDay(sessions, key, timeZone));
};
