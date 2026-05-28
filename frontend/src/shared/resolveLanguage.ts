import * as Localization from "expo-localization";
import { asyncStorage } from "./storage";
import { STORAGE_KEYS } from "./constants";
import type { Language } from "./types";

const isLanguage = (value: unknown): value is Language => value === "tr" || value === "en";

export const languageFromDeviceLocale = (): Language => {
  const tag = Localization.getLocales()[0]?.languageTag?.toLowerCase() ?? "";
  return tag.includes("tr") ? "tr" : "en";
};

/** AsyncStorage → cihaz dili → tr varsayılanı yok, cihaz/en. */
export const resolveInitialLanguage = async (): Promise<Language> => {
  const stored = await asyncStorage.get<Language | null>(STORAGE_KEYS.language, null);
  if (isLanguage(stored)) {
    return stored;
  }
  return languageFromDeviceLocale();
};
