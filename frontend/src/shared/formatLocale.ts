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

export const formatDuration = (language: Language, minutes: number): string =>
  language === "tr" ? `${minutes} dk` : `${minutes} min`;

export const formatDateKey = (language: Language, iso: string): string =>
  new Date(iso).toLocaleDateString(getLocaleTag(language));
