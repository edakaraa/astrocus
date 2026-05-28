import { t, type TranslationKey } from "./i18n";
import type { Language } from "./types";

const WEEK_DAY_KEYS = [
  "weekDay_mon",
  "weekDay_tue",
  "weekDay_wed",
  "weekDay_thu",
  "weekDay_fri",
  "weekDay_sat",
  "weekDay_sun",
] as const satisfies readonly TranslationKey[];

export const getWeekDayLabels = (language: Language): string[] =>
  WEEK_DAY_KEYS.map((key) => t(language, key));

export const getLocaleTag = (language: Language): string =>
  language === "tr" ? "tr-TR" : "en-US";

export const formatNumber = (language: Language, value: number): string =>
  value.toLocaleString(getLocaleTag(language));

export const formatDuration = (language: Language, minutes: number): string => {
  if (minutes < 60) {
    return language === "tr" ? `${minutes} dk` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (language === "tr") {
    return remainder === 0 ? `${hours}s` : `${hours}s ${remainder}dk`;
  }
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
};

export const formatDateKey = (language: Language, iso: string): string =>
  new Date(iso).toLocaleDateString(getLocaleTag(language));
